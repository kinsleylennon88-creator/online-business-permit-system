const express = require('express');
const path = require('path');
const Permit = require('../models/Permit');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');
const { logAuditEvent } = require('../utils/auditLogger');

const router = express.Router();

// Require authenticated reviewer access (fire_reviewer, sanitation_reviewer, admin, superadmin)
router.use(protect);
router.use(authorize('fire_reviewer', 'sanitation_reviewer', 'admin', 'superadmin'));

// Helper to determine reviewer's agency domain
const getReviewerAgency = (user) => {
  if (user.role === 'fire_reviewer') return 'fire';
  if (user.role === 'sanitation_reviewer') return 'sanitation';
  return null; // Admin can inspect both
};

// @route   GET /api/agency/queue
// @desc    Get review queue strictly isolated for Bureau of Fire or Bureau of Sanitation
// @access  Private/Agency Reviewers & Admin
router.get('/queue', async (req, res) => {
  try {
    const userRole = req.user.role;
    const requestedAgency = req.query.agency;
    
    let agencyDomain = getReviewerAgency(req.user);
    if (!agencyDomain && requestedAgency && ['fire', 'sanitation'].includes(requestedAgency)) {
      agencyDomain = requestedAgency;
    } else if (!agencyDomain) {
      agencyDomain = 'fire'; // Default for admin view
    }

    // Strict Role-Based Agency Isolation
    if (userRole === 'fire_reviewer' && requestedAgency === 'sanitation') {
      await logAuditEvent(req, {
        action: 'unauthorized_agency_queue_attempt',
        entityType: 'agency_review',
        result: 'failure',
        details: { attemptedAgency: 'sanitation', reviewerRole: userRole }
      });
      return res.status(403).json({
        success: false,
        message: 'Bureau of Fire reviewers cannot access Bureau of Sanitation review queues.'
      });
    }

    if (userRole === 'sanitation_reviewer' && requestedAgency === 'fire') {
      await logAuditEvent(req, {
        action: 'unauthorized_agency_queue_attempt',
        entityType: 'agency_review',
        result: 'failure',
        details: { attemptedAgency: 'fire', reviewerRole: userRole }
      });
      return res.status(403).json({
        success: false,
        message: 'Bureau of Sanitation reviewers cannot access Bureau of Fire review queues.'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status;
    const search = req.query.search;
    const skip = (page - 1) * limit;

    const query = {
      status: { $ne: 'draft' }
    };

    if (status) {
      query[`agencyReviews.${agencyDomain}.status`] = status;
    }

    if (search) {
      query.$or = [
        { 'businessInfo.businessName': { $regex: search, $options: 'i' } },
        { trackingNumber: { $regex: search, $options: 'i' } },
        { 'ownerInfo.firstName': { $regex: search, $options: 'i' } },
        { 'ownerInfo.lastName': { $regex: search, $options: 'i' } }
      ];
    }

    const permits = await Permit.find(query)
      .sort({ appliedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('applicant', 'firstName lastName email phone address')
      .populate(`agencyReviews.${agencyDomain}.assignedReviewer`, 'firstName lastName email');

    const total = await Permit.countDocuments(query);

    // Filter application details safe to expose to reviewer
    const queueData = permits.map(permit => {
      const p = permit.toObject();
      return {
        _id: p._id,
        trackingNumber: p.trackingNumber,
        businessIdNumber: p.businessIdNumber,
        permitType: p.permitType,
        businessInfo: p.businessInfo,
        ownerInfo: p.ownerInfo,
        paymentInfo: p.paymentInfo,
        appliedAt: p.appliedAt,
        status: p.status,
        myAgencyReview: p.agencyReviews?.[agencyDomain] || { status: 'pending' },
        documentsCount: p.documents?.length || 0
      };
    });

    res.json({
      success: true,
      data: {
        agency: agencyDomain,
        permits: queueData,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit) || 1,
          total
        }
      }
    });
  } catch (error) {
    console.error('Get agency queue error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching agency review queue'
    });
  }
});

// @route   GET /api/agency/permits/:id
// @desc    Get permit details for agency review
// @access  Private/Agency Reviewers
router.get('/permits/:id', async (req, res) => {
  try {
    const agencyDomain = getReviewerAgency(req.user) || req.query.agency || 'fire';

    const permit = await Permit.findById(req.params.id)
      .populate('applicant', 'firstName lastName email phone address')
      .populate(`agencyReviews.${agencyDomain}.assignedReviewer`, 'firstName lastName email');

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Permit application not found'
      });
    }

    res.json({
      success: true,
      data: {
        agency: agencyDomain,
        permit
      }
    });
  } catch (error) {
    console.error('Get agency permit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching permit details'
    });
  }
});

// @route   PUT /api/agency/permits/:id/review
// @desc    Accept, Reject, or Request Corrections from Agency (Fire or Sanitation)
// @access  Private/Agency Reviewers
router.put('/permits/:id/review', async (req, res) => {
  try {
    const { status, remarks, correctionReason, inspectionDate } = req.body;
    const agencyDomain = getReviewerAgency(req.user) || req.body.agency;

    if (!agencyDomain || !['fire', 'sanitation'].includes(agencyDomain)) {
      return res.status(400).json({
        success: false,
        message: 'Valid agency domain (fire or sanitation) is required'
      });
    }

    // Role check
    if (req.user.role === 'fire_reviewer' && agencyDomain !== 'fire') {
      return res.status(403).json({ success: false, message: 'Unauthorized for non-fire reviews.' });
    }
    if (req.user.role === 'sanitation_reviewer' && agencyDomain !== 'sanitation') {
      return res.status(403).json({ success: false, message: 'Unauthorized for non-sanitation reviews.' });
    }

    if (!['approved', 'rejected', 'correction_requested', 'under_review'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid review status required (approved, rejected, correction_requested, under_review)'
      });
    }

    const permit = await Permit.findById(req.params.id);
    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Permit application not found'
      });
    }

    // Update specific agency review record
    permit.agencyReviews[agencyDomain].status = status;
    permit.agencyReviews[agencyDomain].assignedReviewer = req.user.id;
    permit.agencyReviews[agencyDomain].reviewedAt = new Date();
    if (remarks) permit.agencyReviews[agencyDomain].remarks = remarks;
    if (correctionReason) permit.agencyReviews[agencyDomain].correctionReason = correctionReason;
    if (inspectionDate) permit.agencyReviews[agencyDomain].inspectionDate = new Date(inspectionDate);

    // Record action in history
    const agencyLabel = agencyDomain === 'fire' ? 'Bureau of Fire' : 'Bureau of Sanitation';
    const actionKey = `${agencyDomain}_${status}`;
    
    permit.approvalHistory.push({
      action: actionKey.includes('approved') ? `${agencyDomain}_approved` : actionKey.includes('rejected') ? `${agencyDomain}_rejected` : `${agencyDomain}_correction_requested`,
      performedBy: req.user.id,
      performedAt: new Date(),
      remarks: `[${agencyLabel}] Decision: ${status}. Notes: ${remarks || correctionReason || 'None'}`
    });

    // Check overall permit status progression
    if (status === 'correction_requested') {
      permit.status = 'returned_for_correction';
      permit.adminComments = `[${agencyLabel}] Correction Request: ${correctionReason || remarks}`;
      if (!permit.missingRequirements) permit.missingRequirements = [];
      if (remarks && !permit.missingRequirements.includes(remarks)) {
        permit.missingRequirements.push(remarks);
      }
    }

    await permit.save();

    // Create In-App Notification for applicant
    await Notification.create({
      recipient: permit.applicant,
      role: 'user',
      title: `${agencyLabel} Review Update`,
      message: status === 'approved' 
        ? `${agencyLabel} has APPROVED clearance for ${permit.businessInfo?.businessName}.`
        : `${agencyLabel} status: ${status}. "${remarks || correctionReason || 'Please review.'}"`,
      relatedPermit: permit._id,
      link: `/permit-status/${permit._id}`,
      type: status === 'approved' ? 'success' : status === 'correction_requested' ? 'warning' : 'error'
    });

    await logAuditEvent(req, {
      action: `${agencyDomain}_review_${status}`,
      entityType: 'agency_review',
      entityId: permit._id.toString(),
      trackingNumber: permit.trackingNumber,
      result: 'success',
      details: {
        agency: agencyDomain,
        status,
        remarks,
        correctionReason,
        reviewer: `${req.user.firstName} ${req.user.lastName}`
      }
    });

    res.json({
      success: true,
      message: `${agencyLabel} review decision recorded successfully`,
      data: { permit, agencyReview: permit.agencyReviews[agencyDomain] }
    });
  } catch (error) {
    console.error('Agency review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error recording agency review'
    });
  }
});

// @route   POST /api/agency/permits/:id/documents
// @desc    Upload or attach agency clearance certificates / inspection reports
// @access  Private/Agency Reviewers
router.post('/permits/:id/documents', uploadMultiple('documents', 5), async (req, res) => {
  try {
    const agencyDomain = getReviewerAgency(req.user) || req.body.agency;
    if (!agencyDomain) {
      return res.status(400).json({ success: false, message: 'Agency domain is required' });
    }

    const permit = await Permit.findById(req.params.id);
    if (!permit) {
      return res.status(404).json({ success: false, message: 'Permit application not found' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No documents attached' });
    }

    const agencyEnum = agencyDomain === 'fire' ? 'bureau_of_fire' : 'bureau_of_sanitation';
    const docTitle = req.body.title || (agencyDomain === 'fire' ? 'Fire Safety Inspection Certificate (FSIC)' : 'Sanitary Permit Clearance');

    req.files.forEach(file => {
      const fileUrl = file.path.startsWith('http') ? file.path : `/api/permits/${permit._id}/documents/file/${path.basename(file.path)}`;

      const newDoc = {
        docType: agencyDomain === 'fire' ? 'fsic' : 'sanitary',
        requirementCode: agencyDomain === 'fire' ? 'REQ-FSIC' : 'REQ-SANITARY',
        name: docTitle,
        originalName: file.originalname,
        fileUrl,
        filePath: file.path,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedAt: new Date(),
        uploadedBy: req.user.id,
        agency: agencyEnum,
        status: 'approved',
        remarks: `Official clearance issued and attached by ${agencyDomain === 'fire' ? 'Bureau of Fire' : 'Bureau of Sanitation'}`
      };

      if (!permit.agencyReviews[agencyDomain].documents) {
        permit.agencyReviews[agencyDomain].documents = [];
      }
      permit.agencyReviews[agencyDomain].documents.push(newDoc);
      permit.documents.push(newDoc);
    });

    await permit.save();

    await logAuditEvent(req, {
      action: `${agencyDomain}_document_attached`,
      entityType: 'document',
      entityId: permit._id.toString(),
      trackingNumber: permit.trackingNumber,
      result: 'success',
      details: {
        agency: agencyDomain,
        files: req.files.map(f => f.originalname)
      }
    });

    res.json({
      success: true,
      message: 'Agency document attached successfully',
      data: { permit }
    });
  } catch (error) {
    console.error('Agency document upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error attaching agency documents'
    });
  }
});

module.exports = router;
