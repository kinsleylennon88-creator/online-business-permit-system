const AuditLog = require('../models/AuditLog');

/**
 * Log an audit event safely
 * @param {Object} req - Express request object (optional)
 * @param {Object} options - Audit event details
 * @param {string} options.action - Event action string
 * @param {string} options.entityType - Target entity type
 * @param {string} [options.entityId] - Target entity ID
 * @param {string} [options.trackingNumber] - Associated tracking or permit number
 * @param {string} [options.result] - 'success' | 'failure'
 * @param {Object} [options.details] - Extra metadata without secrets
 * @param {Object} [options.actorOverride] - Explicit actor if req.user is absent
 */
const logAuditEvent = async (req, options = {}) => {
  try {
    const {
      action,
      entityType,
      entityId,
      trackingNumber,
      result = 'success',
      details = {},
      actorOverride
    } = options;

    let actor = {
      name: 'System / Guest',
      email: 'system@janiuay.gov.ph',
      role: 'guest'
    };

    if (actorOverride) {
      actor = {
        id: actorOverride.id || actorOverride._id,
        name: `${actorOverride.firstName || ''} ${actorOverride.lastName || ''}`.trim() || actorOverride.name || 'Anonymous',
        email: actorOverride.email || 'unknown@janiuay.gov.ph',
        role: actorOverride.role || 'guest'
      };
    } else if (req && req.user) {
      actor = {
        id: req.user._id || req.user.id,
        name: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || 'User',
        email: req.user.email,
        role: req.user.role || 'user'
      };
    }

    const ipAddress = req
      ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '127.0.0.1').toString().split(',')[0].trim()
      : '127.0.0.1';

    const userAgent = req?.headers ? req.headers['user-agent'] || 'Unknown' : 'System Service';

    // Sanitize details to ensure no passwords or sensitive tokens are stored
    const sanitizedDetails = { ...details };
    delete sanitizedDetails.password;
    delete sanitizedDetails.currentPassword;
    delete sanitizedDetails.newPassword;
    delete sanitizedDetails.token;
    delete sanitizedDetails.authorization;

    await AuditLog.create({
      timestamp: new Date(),
      actor,
      role: actor.role,
      action,
      entityType,
      entityId: entityId ? entityId.toString() : undefined,
      trackingNumber,
      result,
      ipAddress,
      userAgent,
      details: sanitizedDetails
    });
  } catch (err) {
    console.error('⚠️ Failed to record audit log:', err.message);
  }
};

module.exports = { logAuditEvent };
