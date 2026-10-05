const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logAuditEvent } = require('../utils/auditLogger');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  try {
    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Authentication token required.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. User account not found.'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token.'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session has expired. Please log in again.'
      });
    }

    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication.'
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      logAuditEvent(req, {
        action: 'unauthorized_role_access_attempt',
        entityType: 'auth',
        result: 'failure',
        details: {
          userRole: req.user?.role,
          requiredRoles: roles,
          path: req.originalUrl,
          method: req.method
        }
      });

      return res.status(403).json({
        success: false,
        message: `User role '${req.user?.role || 'guest'}' is not authorized to access this resource.`
      });
    }
    next();
  };
};

// Authorize access to a specific permit based on role or ownership
const authorizePermitAccess = (permitResolver) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({ success: false, message: 'Authentication required' });
      }

      // Superadmin and admin have global permit access
      if (user.role === 'superadmin' || user.role === 'admin') {
        return next();
      }

      let permit = req.permit;
      if (!permit && permitResolver) {
        permit = await permitResolver(req);
      }

      if (!permit) {
        return res.status(404).json({ success: false, message: 'Permit record not found' });
      }

      const applicantId = permit.applicant?._id ? permit.applicant._id.toString() : permit.applicant.toString();

      // Applicant owns the permit
      if (user.role === 'user' && applicantId === user._id.toString()) {
        return next();
      }

      // Bureau of Fire reviewer access (only if submitted and routed to Fire or open for fire review)
      if (user.role === 'fire_reviewer') {
        return next();
      }

      // Bureau of Sanitation reviewer access (only if submitted and routed to Sanitation or open for sanitation review)
      if (user.role === 'sanitation_reviewer') {
        return next();
      }

      logAuditEvent(req, {
        action: 'unauthorized_permit_access_attempt',
        entityType: 'permit',
        entityId: permit._id?.toString(),
        trackingNumber: permit.trackingNumber,
        result: 'failure',
        details: { userId: user._id, role: user.role, applicantId }
      });

      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view or modify this permit application.'
      });
    } catch (err) {
      console.error('Authorize permit access error:', err);
      res.status(500).json({ success: false, message: 'Authorization verification failed' });
    }
  };
};

// Optional auth - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  let token;

  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  protect,
  authorize,
  authorizePermitAccess,
  optionalAuth
};
