const express = require('express');
const mongoose = require('mongoose');
const { protect, authorize } = require('../middleware/auth');
const Permit = require('../models/Permit');
const User = require('../models/User');
const ChatLog = require('../models/ChatLog');
const AuditLog = require('../models/AuditLog');
const DocumentRequirement = require('../models/DocumentRequirement');
const { logAuditEvent } = require('../utils/auditLogger');

const router = express.Router();

// All admin routes require authentication and admin/superadmin role
router.use(protect);
router.use(authorize('admin', 'superadmin'));

// ==========================================
// 1. AUDIT LOGS ENDPOINT (Requirement 8)
// ==========================================

// @route   GET /api/admin/audit-logs
// @desc    Get paginated, filterable audit log records (Read-Only)
// @access  Private/Admin
router.get('/audit-logs', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const {
      startDate,
      endDate,
      action,
      role,
      result,
      entityType,
      trackingNumber,
      search
    } = req.query;

    const skip = (page - 1) * limit;
    const query = {};

    // Date range filter
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.timestamp.$lte = end;
      }
    }

    if (action) query.action = action;
    if (role) query.role = role;
    if (result) query.result = result;
    if (entityType) query.entityType = entityType;
    if (trackingNumber) query.trackingNumber = { $regex: trackingNumber, $options: 'i' };

    if (search) {
      query.$or = [
        { 'actor.name': { $regex: search, $options: 'i' } },
        { 'actor.email': { $regex: search, $options: 'i' } },
        { action: { $regex: search, $options: 'i' } },
        { trackingNumber: { $regex: search, $options: 'i' } },
        { entityId: { $regex: search, $options: 'i' } }
      ];
    }

    const auditLogs = await AuditLog.find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments(query);

    // Record audit event that the audit log was accessed
    await logAuditEvent(req, {
      action: 'audit_log_viewed',
      entityType: 'audit_log',
      result: 'success',
      details: { queryParams: req.query, totalFound: total }
    });

    res.json({
      success: true,
      data: {
        auditLogs,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit) || 1,
          total
        }
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching audit logs'
    });
  }
});

// ==========================================
// 2. DOCUMENT REQUIREMENTS CONFIGURATION
// ==========================================

// @route   GET /api/admin/document-requirements
// @desc    Get all configurable document requirements
// @access  Private/Admin
router.get('/document-requirements', async (req, res) => {
  try {
    const requirements = await DocumentRequirement.find().sort({ order: 1, createdAt: 1 });
    res.json({
      success: true,
      data: { requirements }
    });
  } catch (error) {
    console.error('Get document requirements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching document requirements'
    });
  }
});

// @route   POST /api/admin/document-requirements
// @desc    Create new document requirement
// @access  Private/Admin
router.post('/document-requirements', async (req, res) => {
  try {
    const {
      name,
      code,
      description,
      issuingAgency,
      notes,
      isRequired = true,
      applicablePermitType = 'all',
      applicableBusinessType = ['all'],
      reviewingAgency = 'applicant',
      isActive = true,
      order = 0
    } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Name and Code are required'
      });
    }

    const existing = await DocumentRequirement.findOne({ code: code.toUpperCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Requirement code ${code} is already in use.`
      });
    }

    const requirement = await DocumentRequirement.create({
      name,
      code: code.toUpperCase(),
      description,
      issuingAgency,
      notes,
      isRequired,
      applicablePermitType,
      applicableBusinessType,
      reviewingAgency,
      isActive,
      order
    });

    await logAuditEvent(req, {
      action: 'document_requirement_created',
      entityType: 'document_requirement',
      entityId: requirement._id.toString(),
      result: 'success',
      details: { name, code: requirement.code, reviewingAgency }
    });

    res.status(201).json({
      success: true,
      message: 'Document requirement created successfully',
      data: { requirement }
    });
  } catch (error) {
    console.error('Create document requirement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating document requirement'
    });
  }
});

// @route   PUT /api/admin/document-requirements/:id
// @desc    Update document requirement
// @access  Private/Admin
router.put('/document-requirements/:id', async (req, res) => {
  try {
    const requirement = await DocumentRequirement.findById(req.params.id);
    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: 'Document requirement not found'
      });
    }

    const fields = [
      'name', 'description', 'issuingAgency', 'notes',
      'isRequired', 'applicablePermitType', 'applicableBusinessType',
      'reviewingAgency', 'isActive', 'order'
    ];

    fields.forEach(f => {
      if (req.body[f] !== undefined) requirement[f] = req.body[f];
    });

    await requirement.save();

    await logAuditEvent(req, {
      action: 'document_requirement_updated',
      entityType: 'document_requirement',
      entityId: requirement._id.toString(),
      result: 'success',
      details: { code: requirement.code, updatedFields: req.body }
    });

    res.json({
      success: true,
      message: 'Document requirement updated successfully',
      data: { requirement }
    });
  } catch (error) {
    console.error('Update document requirement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating document requirement'
    });
  }
});

// @route   DELETE /api/admin/document-requirements/:id
// @desc    Delete document requirement
// @access  Private/Admin
router.delete('/document-requirements/:id', async (req, res) => {
  try {
    const requirement = await DocumentRequirement.findByIdAndDelete(req.params.id);
    if (!requirement) {
      return res.status(404).json({
        success: false,
        message: 'Document requirement not found'
      });
    }

    await logAuditEvent(req, {
      action: 'document_requirement_deleted',
      entityType: 'document_requirement',
      entityId: req.params.id,
      result: 'success',
      details: { code: requirement.code, name: requirement.name }
    });

    res.json({
      success: true,
      message: 'Document requirement deleted successfully'
    });
  } catch (error) {
    console.error('Delete document requirement error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting document requirement'
    });
  }
});

// ==========================================
// 3. DASHBOARD STATS & METRICS
// ==========================================

// @route   GET /api/admin/dashboard
// @desc    Get dashboard stats for charts
// @access  Private/Admin
router.get('/dashboard', async (req, res) => {
  try {
    const today = new Date();
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);

    // Status counts
    const statusCounts = {
      submitted: await Permit.countDocuments({ status: { $in: ['submitted', 'under_review', 'under_admin_review'] } }),
      pending_fire_review: await Permit.countDocuments({ 'agencyReviews.fire.status': 'pending' }),
      pending_sanitation_review: await Permit.countDocuments({ 'agencyReviews.sanitation.status': 'pending' }),
      returned_for_correction: await Permit.countDocuments({ status: 'returned_for_correction' }),
      approved: await Permit.countDocuments({ status: 'approved' }),
      issued: await Permit.countDocuments({ status: 'issued' }),
      rejected: await Permit.countDocuments({ status: 'rejected' })
    };

    // Monthly data for last 6 months
    const monthlyData = await Permit.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const formattedMonthlyData = monthlyData.map(item => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      count: item.count
    }));

    // Recent applications
    const recentApplications = await Permit.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('applicant', 'firstName lastName email');

    const formattedRecent = recentApplications.map(app => ({
      _id: app._id,
      trackingNumber: app.trackingNumber,
      permitType: app.permitType,
      businessName: app.businessInfo?.businessName || 'N/A',
      applicantName: app.applicant ? `${app.applicant.firstName} ${app.applicant.lastName}` : 'N/A',
      barangay: app.businessInfo?.businessAddress?.barangay || 'N/A',
      status: app.status,
      createdAt: app.createdAt
    }));

    // Total revenue
    const permitsWithFees = await Permit.find({ 'assessment.fees.total': { $gt: 0 } });
    const totalRevenue = permitsWithFees.reduce((sum, permit) => sum + (permit.assessment?.fees?.total || 0), 0);

    res.json({
      success: true,
      data: {
        totalApplications: await Permit.countDocuments(),
        pendingApplications: statusCounts.submitted,
        approvedApplications: statusCounts.approved + statusCounts.issued,
        totalRevenue,
        statusCounts,
        monthlyData: formattedMonthlyData,
        recentApplications: formattedRecent
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard stats'
    });
  }
});

// @route   GET /api/admin/metrics
// @desc    Get dashboard metrics
// @access  Private/Admin
router.get('/metrics', async (req, res) => {
  try {
    const today = new Date();
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisYear = new Date(today.getFullYear(), 0, 1);

    const totalUsers = await User.countDocuments();
    const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: thisMonth } });
    const activeUsers = await User.countDocuments({ lastLogin: { $gte: thisMonth } });

    const totalPermits = await Permit.countDocuments();
    const pendingPermits = await Permit.countDocuments({ status: { $in: ['submitted', 'under_review', 'under_admin_review'] } });
    const approvedThisMonth = await Permit.countDocuments({ 
      status: { $in: ['approved', 'issued'] }, 
      updatedAt: { $gte: thisMonth } 
    });
    const rejectedThisMonth = await Permit.countDocuments({ 
      status: { $in: ['rejected', 'returned_for_correction'] }, 
      updatedAt: { $gte: thisMonth } 
    });

    const totalProcessed = approvedThisMonth + rejectedThisMonth;
    const approvalRate = totalProcessed > 0 ? Math.round((approvedThisMonth / totalProcessed) * 100) : 0;

    const permitsWithFees = await Permit.find({ 'assessment.fees.total': { $gt: 0 } });
    const totalRevenue = permitsWithFees.reduce((sum, permit) => sum + permit.assessment.fees.total, 0);

    const barangayStats = await Permit.aggregate([
      { $match: { 'businessInfo.businessAddress.barangay': { $exists: true } } },
      {
        $group: {
          _id: '$businessInfo.businessAddress.barangay',
          applications: { $sum: 1 },
          approvals: {
            $sum: { $cond: [{ $in: ['$status', ['approved', 'issued']] }, 1, 0] }
          }
        }
      },
      { $sort: { applications: -1 } },
      { $limit: 10 }
    ]);

    const totalChats = await ChatLog.countDocuments({ createdAt: { $gte: thisMonth } });
    const escalatedChats = await ChatLog.countDocuments({ 
      escalated: true, 
      createdAt: { $gte: thisMonth } 
    });

    const monthlyTrends = await Permit.aggregate([
      { $match: { createdAt: { $gte: thisYear } } },
      {
        $group: {
          _id: { $month: '$createdAt' },
          applications: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $in: ['$status', ['approved', 'issued']] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          newThisMonth: newUsersThisMonth,
          active: activeUsers
        },
        permits: {
          total: totalPermits,
          pending: pendingPermits,
          approvedThisMonth,
          rejectedThisMonth,
          approvalRate
        },
        revenue: {
          total: totalRevenue,
          thisMonth: permitsWithFees
            .filter(p => p.updatedAt >= thisMonth)
            .reduce((sum, permit) => sum + permit.assessment.fees.total, 0)
        },
        barangays: barangayStats,
        chatbot: {
          totalQueries: totalChats,
          escalatedQueries: escalatedChats
        },
        trends: monthlyTrends
      }
    });
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching metrics'
    });
  }
});

// ==========================================
// 4. PERMITS MANAGEMENT
// ==========================================

// @route   GET /api/admin/permits
// @desc    Get all permits with filtering
// @access  Private/Admin
router.get('/permits', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { status, permitType, barangay, search } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;
    if (permitType) query.permitType = permitType;
    if (barangay) query['businessInfo.businessAddress.barangay'] = barangay;
    if (search) {
      query.$or = [
        { 'businessInfo.businessName': { $regex: search, $options: 'i' } },
        { trackingNumber: { $regex: search, $options: 'i' } },
        { businessIdNumber: { $regex: search, $options: 'i' } },
        { 'ownerInfo.firstName': { $regex: search, $options: 'i' } },
        { 'ownerInfo.lastName': { $regex: search, $options: 'i' } },
        { 'ownerInfo.email': { $regex: search, $options: 'i' } }
      ];
    }

    const permits = await Permit.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('applicant', 'firstName lastName email phone')
      .populate('agencyReviews.fire.assignedReviewer', 'firstName lastName')
      .populate('agencyReviews.sanitation.assignedReviewer', 'firstName lastName');

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
    console.error('Get admin permits error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching permits'
    });
  }
});

// ==========================================
// 5. USER AND ROLE MANAGEMENT
// ==========================================

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const role = req.query.role;
    const search = req.query.search;
    const skip = (page - 1) * limit;

    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-password');

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit) || 1,
          total
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role (Superadmin or Admin)
// @access  Private/Admin
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ['user', 'admin', 'superadmin', 'fire_reviewer', 'sanitation_reviewer'];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed roles: ${allowedRoles.join(', ')}`
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot change your own role'
      });
    }

    const previousRole = user.role;
    user.role = role;
    await user.save();

    await logAuditEvent(req, {
      action: 'user_role_changed',
      entityType: 'user',
      entityId: user._id.toString(),
      result: 'success',
      details: {
        targetUser: `${user.firstName} ${user.lastName} (${user.email})`,
        previousRole,
        newRole: role
      }
    });

    res.json({
      success: true,
      message: `User role successfully updated to ${role}`,
      data: { user }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user role'
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private/Superadmin
router.delete('/users/:id', authorize('superadmin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const activePermits = await Permit.countDocuments({ 
      applicant: user._id, 
      status: { $in: ['submitted', 'under_review', 'approved', 'issued'] }
    });

    if (activePermits > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user with active permit applications'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    await logAuditEvent(req, {
      action: 'user_deleted',
      entityType: 'user',
      entityId: req.params.id,
      result: 'success',
      details: { deletedEmail: user.email, deletedName: `${user.firstName} ${user.lastName}` }
    });

    res.json({
      success: true,
      message: 'User account removed successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    });
  }
});

// @route   GET /api/admin/chatlogs
// @desc    Get chatbot logs
// @access  Private/Admin
router.get('/chatlogs', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const escalated = req.query.escalated;
    const search = req.query.search;
    const skip = (page - 1) * limit;

    const query = {};
    if (escalated !== undefined) query.escalated = escalated === 'true';
    if (search) {
      query['messages.content'] = { $regex: search, $options: 'i' };
    }

    const chatLogs = await ChatLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'firstName lastName email');

    const total = await ChatLog.countDocuments(query);

    res.json({
      success: true,
      data: {
        chatLogs,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit) || 1,
          total
        }
      }
    });
  } catch (error) {
    console.error('Get chat logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching chat logs'
    });
  }
});

// @route   PUT /api/admin/chatlogs/:id/resolve
// @desc    Resolve escalated chat
// @access  Private/Admin
router.put('/chatlogs/:id/resolve', async (req, res) => {
  try {
    const { resolution } = req.body;
    const chatLog = await ChatLog.findById(req.params.id);

    if (!chatLog) {
      return res.status(404).json({
        success: false,
        message: 'Chat log not found'
      });
    }

    chatLog.resolved = true;
    chatLog.resolvedAt = new Date();
    chatLog.resolvedBy = req.user.id;
    if (resolution) chatLog.resolution = resolution;

    await chatLog.save();

    res.json({
      success: true,
      message: 'Chat log resolved successfully',
      data: { chatLog }
    });
  } catch (error) {
    console.error('Resolve chat log error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while resolving chat log'
    });
  }
});

// @route   GET /api/admin/system-health
// @desc    Get system health metrics
// @access  Private/Admin
router.get('/system-health', async (req, res) => {
  try {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

    const recentUsers = await User.countDocuments({ lastLogin: { $gte: last24Hours } });
    const recentApplications = await Permit.countDocuments({ createdAt: { $gte: last24Hours } });
    const recentChats = await ChatLog.countDocuments({ createdAt: { $gte: last24Hours } });

    res.json({
      success: true,
      data: {
        database: {
          status: dbStatus,
          collections: {
            users: await User.countDocuments(),
            permits: await Permit.countDocuments(),
            auditLogs: await AuditLog.countDocuments(),
            documentRequirements: await DocumentRequirement.countDocuments(),
            chatLogs: await ChatLog.countDocuments()
          }
        },
        activity: {
          last24Hours: {
            activeUsers: recentUsers,
            newApplications: recentApplications,
            chatQueries: recentChats
          }
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        errorRate: 0
      }
    });
  } catch (error) {
    console.error('System health error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching system health'
    });
  }
});

module.exports = router;
