const express = require('express');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const Permit = require('../models/Permit');
const DocumentRequirement = require('../models/DocumentRequirement');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { uploadMultiple, uploadSingle, uploadsDir } = require('../middleware/upload');
const { sendEmail, emailTemplates } = require('../utils/emailService');
const { logAuditEvent } = require('../utils/auditLogger');

const router = express.Router();

// Helper to check permit ownership or administrative access
const canAccessPermit = (user, permit) => {
  if (!user || !permit) return false;
  if (['admin', 'superadmin', 'fire_reviewer', 'sanitation_reviewer'].includes(user.role)) return true;
  return permit.applicant?.toString() === user._id.toString() || permit.applicant?._id?.toString() === user._id.toString();
};

// @route   GET /api/permits
// @desc    Get user's permits
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const permitType = req.query.permitType;
    const skip = (page - 1) * limit;

    const query = { applicant: req.user.id };
    if (status) query.status = status;
    if (permitType) query.permitType = permitType;

    const permits = await Permit.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('applicant', 'firstName lastName email phone');

    const total = await Permit.countDocuments(query);

    res.json({
      success: true,
      data: {
        permits,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit) || 1,
          total
        }
      }
    });
  } catch (error) {
    console.error('Get permits error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching permits'
    });
  }
});

// @route   GET /api/permits/requirements
// @desc    Get applicable document requirements for applicant wizard
// @access  Private
router.get('/requirements', protect, async (req, res) => {
  try {
    const { permitType = 'new', businessType = 'sole_proprietorship' } = req.query;

    const query = {
      isActive: true,
      reviewingAgency: 'applicant',
      applicablePermitType: { $in: ['all', permitType] },
      applicableBusinessType: { $in: ['all', businessType] }
    };

    const requirements = await DocumentRequirement.find(query).sort({ order: 1 });

    res.json({
      success: true,
      data: { requirements }
    });
  } catch (error) {
    console.error('Get requirements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching document requirements'
    });
  }
});

// @route   GET /api/permits/:id
// @desc    Get single permit
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const permit = await Permit.findById(req.params.id)
      .populate('applicant', 'firstName lastName email phone address')
      .populate('agencyReviews.fire.assignedReviewer', 'firstName lastName email')
      .populate('agencyReviews.sanitation.assignedReviewer', 'firstName lastName email');

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Permit application not found'
      });
    }

    if (!canAccessPermit(req.user, permit)) {
      await logAuditEvent(req, {
        action: 'unauthorized_permit_view_attempt',
        entityType: 'permit',
        entityId: permit._id.toString(),
        trackingNumber: permit.trackingNumber,
        result: 'failure'
      });

      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this permit application.'
      });
    }

    res.json({
      success: true,
      data: { permit }
    });
  } catch (error) {
    console.error('Get permit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching permit'
    });
  }
});

// @route   POST /api/permits
// @desc    Create new or renewal permit application
// @access  Private
router.post('/', protect, [
  body('permitType').optional().isIn(['new', 'renewal']).withMessage('Permit type must be either new or renewal'),
  body('businessInfo.businessName').trim().notEmpty().withMessage('Business name is required'),
  body('businessInfo.businessType').isIn([
    'sole_proprietorship',
    'one_person_corporation',
    'corporation',
    'partnership',
    'cooperative'
  ]).withMessage('Invalid business type'),
  body('businessInfo.businessAddress.barangay').notEmpty().withMessage('Business barangay is required'),
  body('businessInfo.businessNature').trim().notEmpty().withMessage('Business nature is required'),
  body('businessInfo.capitalization').isNumeric().withMessage('Capitalization must be a positive number'),
  body('ownerInfo.firstName').trim().notEmpty().withMessage('Owner first name is required'),
  body('ownerInfo.lastName').trim().notEmpty().withMessage('Owner last name is required'),
  body('ownerInfo.phone').matches(/^09\d{9}$/).withMessage('Please provide a valid Philippine mobile number (09XXXXXXXXX)'),
  body('ownerInfo.email').isEmail().withMessage('Please provide a valid email address'),
  body('ownerInfo.gender').optional().isIn(['male', 'female', 'prefer_not_to_say']).withMessage('Invalid gender option'),
  body('paymentInfo.paymentFrequency').optional().isIn(['annually', 'bi-annually', 'quarterly']).withMessage('Invalid payment frequency')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg || 'Validation error',
        errors: errors.array()
      });
    }

    const {
      permitType = 'new',
      previousPermitNumber,
      previousApplicationNumber,
      previousPermitId,
      businessInfo,
      ownerInfo,
      paymentInfo
    } = req.body;

    // Validate renewal permit reference
    if (permitType === 'renewal') {
      if (!previousPermitNumber && !previousApplicationNumber && !previousPermitId) {
        return res.status(400).json({
          success: false,
          message: 'Renewal applications must reference a previous permit number or application number'
        });
      }

      // If previous permit ID or number is provided, verify it belongs to this applicant if exists
      if (previousPermitNumber) {
        const prevPermit = await Permit.findOne({
          $or: [
            { permitNumber: previousPermitNumber.trim() },
            { trackingNumber: previousPermitNumber.trim() }
          ]
        });

        if (prevPermit && prevPermit.applicant.toString() !== req.user.id && req.user.role !== 'admin') {
          return res.status(400).json({
            success: false,
            message: 'Referenced previous permit does not belong to your account.'
          });
        }
      }
    }

    const year = new Date().getFullYear();
    const randomSeq = Math.floor(10000 + Math.random() * 90000);
    const trackingNumber = `TRK-${year}-${randomSeq}`;
    const businessIdNumber = `BIN-${year}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create permit
    const permit = new Permit({
      applicant: req.user.id,
      permitType,
      previousPermitNumber: previousPermitNumber ? previousPermitNumber.trim() : undefined,
      previousApplicationNumber: previousApplicationNumber ? previousApplicationNumber.trim() : undefined,
      previousPermitId,
      trackingNumber,
      businessIdNumber,
      businessInfo,
      ownerInfo,
      paymentInfo: {
        paymentFrequency: paymentInfo?.paymentFrequency || 'annually',
        receiptDate: paymentInfo?.receiptDate || null,
        amount: paymentInfo?.amount || 0,
        paymentStatus: 'pending'
      },
      status: 'draft',
      agencyReviews: {
        fire: { status: 'pending' },
        sanitation: { status: 'pending' }
      }
    });

    await permit.save();

    await logAuditEvent(req, {
      action: 'application_created',
      entityType: 'permit',
      entityId: permit._id.toString(),
      trackingNumber: permit.trackingNumber,
      result: 'success',
      details: {
        permitType,
        businessName: businessInfo.businessName,
        businessType: businessInfo.businessType
      }
    });

    res.status(201).json({
      success: true,
      message: 'Permit application initialized successfully',
      data: { permit }
    });
  } catch (error) {
    console.error('Create permit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating permit application'
    });
  }
});

// @route   PUT /api/permits/:id/documents
// @desc    Upload or replace applicant documents with versioning
// @access  Private
router.put('/:id/documents', protect, uploadMultiple('documents', 10), async (req, res) => {
  try {
    const permit = await Permit.findById(req.params.id);

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Permit application not found'
      });
    }

    if (permit.applicant.toString() !== req.user.id && !['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to upload documents for this permit'
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files were attached for upload.'
      });
    }

    const docTypes = req.body.docTypes ? (typeof req.body.docTypes === 'string' ? JSON.parse(req.body.docTypes) : req.body.docTypes) : {};
    const docNames = req.body.docNames ? (typeof req.body.docNames === 'string' ? JSON.parse(req.body.docNames) : req.body.docNames) : {};
    const reqCodes = req.body.reqCodes ? (typeof req.body.reqCodes === 'string' ? JSON.parse(req.body.reqCodes) : req.body.reqCodes) : {};

    req.files.forEach((file, index) => {
      const docName = docNames[file.originalname] || docNames[index] || file.originalname;
      const docType = docTypes[file.originalname] || docTypes[index] || 'other';
      const requirementCode = reqCodes[file.originalname] || reqCodes[index] || '';
      const fileUrl = file.path.startsWith('http') ? file.path : `/api/permits/${permit._id}/documents/file/${path.basename(file.path)}`;

      // Check if existing document with this name or requirementCode exists
      const existingDocIndex = permit.documents.findIndex(d => 
        (requirementCode && d.requirementCode === requirementCode) || 
        (d.name === docName)
      );

      if (existingDocIndex >= 0) {
        const existingDoc = permit.documents[existingDocIndex];
        
        // Push old version to history
        if (!existingDoc.history) existingDoc.history = [];
        existingDoc.history.push({
          version: existingDoc.version || 1,
          fileUrl: existingDoc.fileUrl,
          filePath: existingDoc.filePath,
          originalName: existingDoc.originalName,
          fileSize: existingDoc.fileSize,
          mimeType: existingDoc.mimeType,
          uploadedAt: existingDoc.uploadedAt,
          remarks: existingDoc.remarks
        });

        // Update current active document
        existingDoc.fileUrl = fileUrl;
        existingDoc.filePath = file.path;
        existingDoc.originalName = file.originalname;
        existingDoc.fileSize = file.size;
        existingDoc.mimeType = file.mimetype;
        existingDoc.uploadedAt = new Date();
        existingDoc.uploadedBy = req.user.id;
        existingDoc.version = (existingDoc.version || 1) + 1;
        existingDoc.status = 'pending';
        existingDoc.remarks = 'Updated version uploaded by applicant';
      } else {
        // Add new document
        permit.documents.push({
          docType,
          requirementCode,
          name: docName,
          originalName: file.originalname,
          fileUrl,
          filePath: file.path,
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedAt: new Date(),
          uploadedBy: req.user.id,
          agency: 'applicant',
          status: 'pending',
          version: 1,
          history: []
        });
      }
    });

    // Remove fixed items from missingRequirements if matching document was uploaded
    if (permit.missingRequirements && permit.missingRequirements.length > 0) {
      const uploadedNames = req.files.map((f, idx) => docNames[f.originalname] || docNames[idx] || f.originalname);
      permit.missingRequirements = permit.missingRequirements.filter(mr => !uploadedNames.some(un => un.includes(mr) || mr.includes(un)));
    }

    await permit.save();

    await logAuditEvent(req, {
      action: 'document_uploaded',
      entityType: 'document',
      entityId: permit._id.toString(),
      trackingNumber: permit.trackingNumber,
      result: 'success',
      details: {
        fileCount: req.files.length,
        uploadedFiles: req.files.map(f => f.originalname)
      }
    });

    res.json({
      success: true,
      message: 'Documents uploaded and registered successfully',
      data: { permit }
    });
  } catch (error) {
    console.error('Upload documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading documents: ' + error.message
    });
  }
});

// @route   GET /api/permits/:id/documents/file/:filename
// @desc    Secure document stream / download with RBAC verification
// @access  Private
router.get('/:id/documents/file/:filename', protect, async (req, res) => {
  try {
    const permit = await Permit.findById(req.params.id);
    if (!permit) {
      return res.status(404).json({ success: false, message: 'Permit application not found' });
    }

    if (!canAccessPermit(req.user, permit)) {
      await logAuditEvent(req, {
        action: 'unauthorized_file_download_attempt',
        entityType: 'document',
        entityId: permit._id.toString(),
        trackingNumber: permit.trackingNumber,
        result: 'failure',
        details: { filename: req.params.filename }
      });
      return res.status(403).json({ success: false, message: 'Unauthorized document access' });
    }

    const safeFilename = path.basename(req.params.filename);
    let filePath = path.join(uploadsDir, safeFilename);

    if (!fs.existsSync(filePath)) {
      // 1. Check if permit has a document with matching path, url or originalName
      const matchingDoc = permit.documents?.find(d => 
        (d.filePath && path.basename(d.filePath) === safeFilename) ||
        (d.fileUrl && path.basename(d.fileUrl.split('?')[0]) === safeFilename) ||
        (d.originalName === safeFilename)
      );

      if (matchingDoc) {
        if (matchingDoc.filePath && fs.existsSync(matchingDoc.filePath)) {
          filePath = matchingDoc.filePath;
        } else if (matchingDoc.fileUrl && (matchingDoc.fileUrl.startsWith('http://') || matchingDoc.fileUrl.startsWith('https://'))) {
          return res.redirect(matchingDoc.fileUrl);
        }
      }
    }

    if (!fs.existsSync(filePath)) {
      const altPaths = [
        path.join(__dirname, '../uploads', safeFilename),
        path.join(__dirname, '../public/uploads', safeFilename),
        path.join(__dirname, '../public/uploads/documents', safeFilename)
      ];
      const foundAlt = altPaths.find(p => fs.existsSync(p));
      if (foundAlt) {
        filePath = foundAlt;
      } else {
        return res.status(404).json({ success: false, message: 'Document file not found on storage server' });
      }
    }

    await logAuditEvent(req, {
      action: 'document_downloaded',
      entityType: 'document',
      entityId: permit._id.toString(),
      trackingNumber: permit.trackingNumber,
      result: 'success',
      details: { filename: safeFilename }
    });

    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error('Document download error:', error);
    res.status(500).json({ success: false, message: 'Server error downloading document' });
  }
});

// @route   PUT /api/permits/:id/submit
// @desc    Submit permit application for official BPLO & Agency reviews
// @access  Private
router.put('/:id/submit', protect, async (req, res) => {
  try {
    const permit = await Permit.findById(req.params.id);

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Permit application not found'
      });
    }

    if (permit.applicant.toString() !== req.user.id && !['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit this permit'
      });
    }

    // Check required applicant documents from DocumentRequirement configuration
    const mandatoryRequirements = await DocumentRequirement.find({
      isActive: true,
      isRequired: true,
      reviewingAgency: 'applicant',
      applicablePermitType: { $in: ['all', permit.permitType || 'new'] },
      applicableBusinessType: { $in: ['all', permit.businessInfo?.businessType || 'sole_proprietorship'] }
    });

    const uploadedDocNames = permit.documents.map(d => d.name);
    const uploadedReqCodes = permit.documents.map(d => d.requirementCode).filter(Boolean);

    const missingDocs = mandatoryRequirements.filter(req => {
      const codeMatch = uploadedReqCodes.includes(req.code);
      const nameMatch = uploadedDocNames.some(dName => dName.toLowerCase().includes(req.name.toLowerCase()) || req.name.toLowerCase().includes(dName.toLowerCase()));
      return !codeMatch && !nameMatch;
    });

    if (missingDocs.length > 0 && permit.documents.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload the mandatory applicant documents before submitting.',
        missingRequirements: missingDocs.map(d => d.name)
      });
    }

    // Assign tracking number if missing
    if (!permit.trackingNumber) {
      const year = new Date().getFullYear();
      permit.trackingNumber = `TRK-${year}-${Math.floor(10000 + Math.random() * 90000)}`;
    }

    // Automatic Routing: Route to Bureau of Fire and Bureau of Sanitation
    permit.status = 'submitted';
    permit.appliedAt = permit.appliedAt || new Date();
    permit.agencyReviews.fire.status = 'pending';
    permit.agencyReviews.sanitation.status = 'pending';

    permit.approvalHistory.push({
      action: 'submitted',
      performedBy: req.user.id,
      performedAt: new Date(),
      remarks: `Application submitted for review. Routed to Bureau of Fire and Bureau of Sanitation.`
    });

    await permit.save();

    // Create In-App Notifications for Reviewers
    await Notification.create([
      {
        role: 'fire_reviewer',
        title: 'New Fire Safety Review Required',
        message: `New permit submission for ${permit.businessInfo?.businessName} (${permit.trackingNumber}) is ready for Fire Safety inspection.`,
        relatedPermit: permit._id,
        link: `/agency/review/${permit._id}`
      },
      {
        role: 'sanitation_reviewer',
        title: 'New Sanitation Review Required',
        message: `New permit submission for ${permit.businessInfo?.businessName} (${permit.trackingNumber}) is ready for Sanitary clearance.`,
        relatedPermit: permit._id,
        link: `/agency/review/${permit._id}`
      },
      {
        role: 'admin',
        title: 'New Permit Submission',
        message: `Application submitted for ${permit.businessInfo?.businessName} (${permit.trackingNumber}).`,
        relatedPermit: permit._id,
        link: `/admin/permits`
      }
    ]);

    await logAuditEvent(req, {
      action: 'application_submitted',
      entityType: 'permit',
      entityId: permit._id.toString(),
      trackingNumber: permit.trackingNumber,
      result: 'success',
      details: {
        permitType: permit.permitType,
        routedAgencies: ['bureau_of_fire', 'bureau_of_sanitation', 'bplo']
      }
    });

    // Dispatch confirmation email to applicant in background (non-blocking)
    User.findById(req.user.id).then(user => {
      if (user) {
        sendEmail(emailTemplates.applicationReceived(user, permit)).catch(err => {
          console.warn('Background email notification error:', err.message);
        });
      }
    }).catch(err => console.warn('User lookup for email warning:', err.message));

    res.json({
      success: true,
      message: 'Application submitted and automatically routed to Bureau of Fire & Sanitation queues.',
      data: { permit }
    });
  } catch (error) {
    console.error('Submit permit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting permit application'
    });
  }
});

// @route   PUT /api/permits/:id/approve
// @desc    Approve permit (Admin only)
// @access  Private/Admin
router.put('/:id/approve', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const permit = await Permit.findById(req.params.id);

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Permit application not found'
      });
    }

    permit.status = 'approved';
    permit.missingRequirements = [];
    permit.adminComments = req.body.remarks || 'Application approved by BPLO Licensing Board.';
    permit.remarks = req.body.remarks || 'Application approved by BPLO Licensing Board.';
    
    if (!permit.permitNumber) {
      const year = new Date().getFullYear();
      permit.permitNumber = `BP-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    permit.approvalHistory.push({
      action: 'approved',
      performedBy: req.user.id,
      performedAt: new Date(),
      remarks: req.body.remarks || 'Application approved'
    });

    await permit.save();

    await Notification.create({
      recipient: permit.applicant,
      role: 'user',
      title: 'Business Permit Approved! 🎉',
      message: `Congratulations! Your business permit application (${permit.trackingNumber}) has been approved.`,
      relatedPermit: permit._id,
      link: `/permit-status/${permit._id}`,
      type: 'success'
    });

    await logAuditEvent(req, {
      action: 'permit_approved',
      entityType: 'permit',
      entityId: permit._id.toString(),
      trackingNumber: permit.trackingNumber,
      result: 'success',
      details: { permitNumber: permit.permitNumber, remarks: req.body.remarks }
    });

    // Send approval email in background (non-blocking)
    User.findById(permit.applicant).then(user => {
      if (user) {
        sendEmail(emailTemplates.permitApproved(user, permit)).catch(err => {
          console.warn('Background approval email warning:', err.message);
        });
      }
    }).catch(err => console.warn('User lookup warning:', err.message));

    res.json({
      success: true,
      message: 'Permit approved and registered successfully',
      data: { permit }
    });
  } catch (error) {
    console.error('Approve permit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving permit'
    });
  }
});

// @route   PUT /api/permits/:id/reject
// @desc    Reject or Flag Deficiencies for permit (Admin only)
// @access  Private/Admin
router.put('/:id/reject', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { reason, missingRequirements, adminComments } = req.body;
    const deficiencyReason = reason || adminComments || 'Application has missing or deficient requirements.';

    const permit = await Permit.findById(req.params.id);

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Permit application not found'
      });
    }

    permit.status = 'returned_for_correction';
    permit.remarks = deficiencyReason;
    permit.adminComments = deficiencyReason;
    if (Array.isArray(missingRequirements)) {
      permit.missingRequirements = missingRequirements;
    }

    permit.approvalHistory.push({
      action: 'returned_for_correction',
      performedBy: req.user.id,
      performedAt: new Date(),
      remarks: deficiencyReason
    });

    await permit.save();

    await Notification.create({
      recipient: permit.applicant,
      role: 'user',
      title: 'Corrections Required on Permit Application',
      message: `BPLO evaluator requested corrections for ${permit.businessInfo?.businessName}: "${deficiencyReason}"`,
      relatedPermit: permit._id,
      link: `/permit-status/${permit._id}`,
      type: 'warning'
    });

    await logAuditEvent(req, {
      action: 'permit_correction_requested',
      entityType: 'permit',
      entityId: permit._id.toString(),
      trackingNumber: permit.trackingNumber,
      result: 'success',
      details: { deficiencyReason, missingRequirements }
    });

    // Send rejection/correction email in background (non-blocking)
    User.findById(permit.applicant).then(user => {
      if (user) {
        sendEmail(emailTemplates.permitRejected(user, permit, deficiencyReason)).catch(err => {
          console.warn('Background rejection email warning:', err.message);
        });
      }
    }).catch(err => console.warn('User lookup warning:', err.message));

    res.json({
      success: true,
      message: 'Deficiency notice and correction request recorded successfully',
      data: { permit }
    });
  } catch (error) {
    console.error('Reject permit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating deficiency notice'
    });
  }
});

// @route   PUT /api/permits/:id/assessment
// @desc    Update permit fee assessment (Admin only)
// @access  Private/Admin
router.put('/:id/assessment', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { fees, paymentInfo } = req.body;

    const permit = await Permit.findById(req.params.id);

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Permit application not found'
      });
    }

    if (fees) {
      const total = Object.keys(fees).reduce((sum, key) => {
        if (key !== 'total') return sum + (Number(fees[key]) || 0);
        return sum;
      }, 0);
      fees.total = total;
      permit.assessment.fees = fees;
      permit.assessment.assessedBy = req.user.id;
      permit.assessment.assessedAt = new Date();
    }

    if (paymentInfo) {
      if (paymentInfo.paymentFrequency) permit.paymentInfo.paymentFrequency = paymentInfo.paymentFrequency;
      if (paymentInfo.receiptDate) permit.paymentInfo.receiptDate = paymentInfo.receiptDate;
      if (paymentInfo.orNumber) permit.paymentInfo.orNumber = paymentInfo.orNumber;
      if (paymentInfo.paymentStatus) permit.paymentInfo.paymentStatus = paymentInfo.paymentStatus;
      if (paymentInfo.amount) permit.paymentInfo.amount = paymentInfo.amount;
    }

    await permit.save();

    await logAuditEvent(req, {
      action: 'permit_assessment_updated',
      entityType: 'payment',
      entityId: permit._id.toString(),
      trackingNumber: permit.trackingNumber,
      result: 'success',
      details: { fees: permit.assessment.fees, paymentInfo: permit.paymentInfo }
    });

    res.json({
      success: true,
      message: 'Assessment and payment data updated successfully',
      data: { permit }
    });
  } catch (error) {
    console.error('Update assessment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating assessment'
    });
  }
});

// @route   PUT /api/permits/:id/send-assessment
// @desc    BPLO decides payment fees and forwards order of payment to client
// @access  Private/Admin
router.put('/:id/send-assessment', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { fees, remarks } = req.body;
    const permit = await Permit.findById(req.params.id);

    if (!permit) {
      return res.status(404).json({ success: false, message: 'Permit application not found' });
    }

    const calculatedFees = {
      businessTax: Number(fees?.businessTax) || 0,
      mayorsPermit: Number(fees?.mayorsPermit) || 0,
      sanitaryFee: Number(fees?.sanitaryFee) || 0,
      fireSafetyFee: Number(fees?.fireSafetyFee) || 0,
      environmentalFee: Number(fees?.environmentalFee) || 0,
      garbageFee: Number(fees?.garbageFee) || 0,
      plateStickerFee: Number(fees?.plateStickerFee) || 0,
    };
    calculatedFees.total = Object.values(calculatedFees).reduce((sum, val) => sum + val, 0);

    permit.assessment = {
      fees: calculatedFees,
      assessedBy: req.user.id,
      assessedAt: new Date(),
      forwardedToClient: true,
      forwardedAt: new Date(),
      paymentStatus: 'pending'
    };

    permit.paymentInfo.amount = calculatedFees.total;
    permit.paymentInfo.paymentStatus = 'pending';
    permit.status = 'pending_payment';
    permit.missingRequirements = [];

    permit.approvalHistory.push({
      action: 'payment_assessment_sent',
      performedBy: req.user.id,
      performedAt: new Date(),
      remarks: remarks || `Payment assessment of ₱${calculatedFees.total.toLocaleString()} decided and forwarded to client by ${req.user.role === 'superadmin' ? 'Super Admin' : 'BPLO'}.`
    });

    await permit.save();

    // Notify client
    await Notification.create({
      recipient: permit.applicant,
      role: 'user',
      title: 'Order of Payment Issued 💳',
      message: `BPLO has finalized your payment assessment of ₱${calculatedFees.total.toLocaleString()} for ${permit.businessInfo?.businessName}. You can now view, download, or print your Order of Payment and upload receipt once paid.`,
      relatedPermit: permit._id,
      link: `/permit-status/${permit._id}`,
      type: 'info'
    });

    if (req.user.role === 'superadmin') {
      await Notification.create({
        role: 'admin',
        title: 'Super Admin Forwarded Assessment',
        message: `Super Admin forwarded payment assessment for ${permit.businessInfo?.businessName} (${permit.trackingNumber}). BPLO notified.`,
        relatedPermit: permit._id,
        link: `/admin/permits`,
        type: 'info'
      });
    }

    await logAuditEvent(req, {
      action: 'payment_assessment_sent',
      entityType: 'payment',
      entityId: permit._id.toString(),
      trackingNumber: permit.trackingNumber,
      result: 'success',
      details: { fees: calculatedFees, total: calculatedFees.total }
    });

    res.json({
      success: true,
      message: 'Payment assessment forwarded to client successfully',
      data: { permit }
    });
  } catch (error) {
    console.error('Send assessment error:', error);
    res.status(500).json({ success: false, message: 'Server error forwarding payment assessment' });
  }
});

// @route   POST /api/permits/:id/payment-receipt
// @desc    Client uploads payment receipt (OR number, date, file)
// @access  Private
router.post('/:id/payment-receipt', protect, uploadSingle('receipt'), async (req, res) => {
  try {
    const permit = await Permit.findById(req.params.id);
    if (!permit) {
      return res.status(404).json({ success: false, message: 'Permit application not found' });
    }

    if (!canAccessPermit(req.user, permit)) {
      return res.status(403).json({ success: false, message: 'Not authorized for this permit' });
    }

    const { orNumber, paymentMethod, receiptDate, remarks } = req.body;
    let receiptUrl = req.body.receiptUrl || '';
    let receiptFileName = req.body.receiptFileName || '';

    if (req.file) {
      receiptUrl = req.file.path.startsWith('http') ? req.file.path : `/api/permits/${permit._id}/documents/file/${path.basename(req.file.path)}`;
      receiptFileName = req.file.originalname;

      permit.documents.push({
        docType: 'payment_receipt',
        requirementCode: 'PAYMENT_RECEIPT',
        name: 'Official Payment Receipt',
        originalName: req.file.originalname,
        fileUrl: receiptUrl,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedAt: new Date(),
        uploadedBy: req.user.id,
        agency: 'applicant',
        status: 'pending',
        version: 1
      });
    }

    permit.paymentInfo = {
      paymentFrequency: permit.paymentInfo?.paymentFrequency || 'annually',
      amount: permit.paymentInfo?.amount || 0,
      receiptDate: receiptDate ? new Date(receiptDate) : (permit.paymentInfo?.receiptDate || new Date()),
      preferredPaymentDate: permit.paymentInfo?.preferredPaymentDate,
      orNumber: orNumber || permit.paymentInfo?.orNumber || '',
      paymentMethod: paymentMethod || permit.paymentInfo?.paymentMethod || 'Treasury Cashier',
      paymentStatus: 'receipt_uploaded',
      receiptUrl: receiptUrl || permit.paymentInfo?.receiptUrl,
      receiptFileName: receiptFileName || permit.paymentInfo?.receiptFileName,
      receiptUploadedAt: new Date(),
      verificationNotes: remarks || ''
    };

    permit.status = 'payment_under_review';

    permit.approvalHistory.push({
      action: 'payment_receipt_uploaded',
      performedBy: req.user.id,
      performedAt: new Date(),
      remarks: `Client uploaded payment receipt (OR #${orNumber || 'Pending'}, Method: ${paymentMethod || 'Treasury'}). Awaiting Treasury verification.`
    });

    await permit.save();

    // Notify Admin & Treasury
    await Notification.create({
      role: 'admin',
      title: 'Payment Verification Required 💰',
      message: `Applicant uploaded payment receipt for ${permit.businessInfo?.businessName} (${permit.trackingNumber}). Treasury verification required.`,
      relatedPermit: permit._id,
      link: `/admin/permits`,
      type: 'warning'
    });

    await logAuditEvent(req, {
      action: 'payment_receipt_uploaded',
      entityType: 'payment',
      entityId: permit._id.toString(),
      trackingNumber: permit.trackingNumber,
      result: 'success',
      details: { orNumber, paymentMethod, receiptUrl }
    });

    res.json({
      success: true,
      message: 'Payment receipt uploaded successfully and queued for Treasury verification',
      data: { permit }
    });
  } catch (error) {
    console.error('Payment receipt upload error:', error);
    res.status(500).json({ success: false, message: 'Server error uploading payment receipt: ' + error.message });
  }
});

// @route   PUT /api/permits/:id/verify-payment
// @desc    Treasury / Admin confirms or flags payment receipt
// @access  Private/Admin
router.put('/:id/verify-payment', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const { verified, orNumber, remarks } = req.body;
    const permit = await Permit.findById(req.params.id);

    if (!permit) {
      return res.status(404).json({ success: false, message: 'Permit application not found' });
    }

    if (verified) {
      permit.paymentInfo.paymentStatus = 'verified';
      permit.paymentInfo.verifiedBy = req.user.id;
      permit.paymentInfo.verifiedAt = new Date();
      if (orNumber) permit.paymentInfo.orNumber = orNumber;
      if (remarks) permit.paymentInfo.verificationNotes = remarks;

      // Payment verified -> Ready for BPLO permit issuance
      permit.status = 'approved';

      // Generate permit number if not yet generated
      if (!permit.permitNumber) {
        const year = new Date().getFullYear();
        permit.permitNumber = `BP-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
      }

      permit.approvalHistory.push({
        action: 'payment_verified',
        performedBy: req.user.id,
        performedAt: new Date(),
        remarks: remarks || `Treasury confirmed payment (OR #${permit.paymentInfo.orNumber || 'Recorded'}). BPLO authorized to issue permit.`
      });

      await permit.save();

      // Notify BPLO
      await Notification.create({
        role: 'admin',
        title: 'Payment Verified: Permit Ready for Issuance 📜',
        message: `Treasury has verified payment for ${permit.businessInfo?.businessName} (${permit.trackingNumber}). BPLO can now issue the business permit.`,
        relatedPermit: permit._id,
        link: `/admin/permits`,
        type: 'success'
      });

      // If Super Admin performed verification, notify BPLO
      if (req.user.role === 'superadmin') {
        await Notification.create({
          role: 'admin',
          title: 'Super Admin Verified Payment',
          message: `Super Admin verified payment for ${permit.businessInfo?.businessName} in lieu of Treasury/BPLO.`,
          relatedPermit: permit._id,
          link: `/admin/permits`,
          type: 'info'
        });
      }

      // Notify Applicant
      await Notification.create({
        recipient: permit.applicant,
        role: 'user',
        title: 'Payment Verified by Treasury ✅',
        message: `Your payment has been successfully confirmed and verified by the Municipal Treasury. Your Mayor's Business Permit is being finalized for issuance.`,
        relatedPermit: permit._id,
        link: `/permit-status/${permit._id}`,
        type: 'success'
      });
    } else {
      permit.paymentInfo.paymentStatus = 'rejected';
      permit.status = 'pending_payment';
      if (remarks) permit.paymentInfo.verificationNotes = remarks;

      permit.approvalHistory.push({
        action: 'reviewed',
        performedBy: req.user.id,
        performedAt: new Date(),
        remarks: remarks || 'Payment verification rejected. Applicant requested to re-upload receipt.'
      });

      await permit.save();

      // Notify applicant
      await Notification.create({
        recipient: permit.applicant,
        role: 'user',
        title: 'Payment Verification Action Needed ⚠️',
        message: remarks || `The Municipal Treasury was unable to verify your payment receipt. Please re-upload a clear and valid official receipt.`,
        relatedPermit: permit._id,
        link: `/permit-status/${permit._id}`,
        type: 'warning'
      });
    }

    await logAuditEvent(req, {
      action: 'payment_verification_completed',
      entityType: 'payment',
      entityId: permit._id.toString(),
      trackingNumber: permit.trackingNumber,
      result: verified ? 'success' : 'failure',
      details: { verified, orNumber: permit.paymentInfo.orNumber, remarks }
    });

    res.json({
      success: true,
      message: verified ? 'Payment confirmed and verified successfully' : 'Payment rejected; client notified to re-upload',
      data: { permit }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ success: false, message: 'Server error verifying payment' });
  }
});

// @route   PUT /api/permits/:id/issue
// @desc    BPLO issues digital business permit certificate
// @access  Private/Admin
router.put('/:id/issue', protect, authorize('admin', 'superadmin'), async (req, res) => {
  try {
    const permit = await Permit.findById(req.params.id);
    if (!permit) {
      return res.status(404).json({ success: false, message: 'Permit application not found' });
    }

    const year = new Date().getFullYear();
    if (!permit.permitNumber) {
      permit.permitNumber = `BP-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    permit.status = 'issued';
    permit.issuedAt = new Date();
    
    // Set expiration to December 31 of current calendar year
    const expiration = new Date();
    expiration.setMonth(11, 31); // Dec 31
    expiration.setHours(23, 59, 59, 999);
    permit.expiresAt = expiration;

    permit.approvalHistory.push({
      action: 'issued',
      performedBy: req.user.id,
      performedAt: new Date(),
      remarks: req.body.remarks || `Official Mayor's Business Permit generated and issued by ${req.user.role === 'superadmin' ? 'Super Admin' : 'BPLO'} according to municipal records.`
    });

    await permit.save();

    // If super admin issued, notify BPLO
    if (req.user.role === 'superadmin') {
      await Notification.create({
        role: 'admin',
        title: 'Super Admin Issued Permit',
        message: `Super Admin issued Mayor Business Permit (${permit.permitNumber}) for ${permit.businessInfo?.businessName}.`,
        relatedPermit: permit._id,
        link: `/admin/permits`,
        type: 'info'
      });
    }

    // Notify Applicant
    await Notification.create({
      recipient: permit.applicant,
      role: 'user',
      title: 'Official Business Permit Issued! 🏛️',
      message: `Your Mayor's Business Permit (${permit.permitNumber}) is ready! You can now view, download, or directly print your official municipal certificate.`,
      relatedPermit: permit._id,
      link: `/permit-status/${permit._id}`,
      type: 'success'
    });

    await logAuditEvent(req, {
      action: 'permit_issued',
      entityType: 'permit',
      entityId: permit._id.toString(),
      trackingNumber: permit.trackingNumber,
      result: 'success',
      details: { permitNumber: permit.permitNumber, issuedAt: permit.issuedAt, expiresAt: permit.expiresAt }
    });

    // Send issuance email in background (non-blocking)
    User.findById(permit.applicant).then(user => {
      if (user) {
        sendEmail(emailTemplates.permitApproved(user, permit)).catch(err => {
          console.warn('Background issuance email warning:', err.message);
        });
      }
    }).catch(err => console.warn('User lookup warning:', err.message));

    res.json({
      success: true,
      message: 'Mayor Business Permit issued successfully',
      data: { permit }
    });
  } catch (error) {
    console.error('Issue permit error:', error);
    res.status(500).json({ success: false, message: 'Server error issuing permit' });
  }
});

// @route   DELETE /api/permits/:id
// @desc    Delete draft permit
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const permit = await Permit.findById(req.params.id);

    if (!permit) {
      return res.status(404).json({
        success: false,
        message: 'Permit application not found'
      });
    }

    if (permit.applicant.toString() !== req.user.id && !['admin', 'superadmin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this permit'
      });
    }

    if (permit.applicant.toString() === req.user.id && permit.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete an already submitted permit. Please contact BPLO support.'
      });
    }

    await Permit.findByIdAndDelete(req.params.id);

    await logAuditEvent(req, {
      action: 'permit_deleted',
      entityType: 'permit',
      entityId: req.params.id,
      result: 'success'
    });

    res.json({
      success: true,
      message: 'Permit draft deleted successfully'
    });
  } catch (error) {
    console.error('Delete permit error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting permit'
    });
  }
});

module.exports = router;
