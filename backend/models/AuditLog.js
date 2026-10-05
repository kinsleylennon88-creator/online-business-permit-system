const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  actor: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      required: true,
      default: 'System / Anonymous'
    },
    email: {
      type: String,
      default: 'system@janiuay.gov.ph'
    },
    role: {
      type: String,
      default: 'guest'
    }
  },
  role: {
    type: String,
    index: true
  },
  action: {
    type: String,
    required: true,
    index: true
  },
  entityType: {
    type: String,
    required: true,
    enum: [
      'permit',
      'user',
      'document',
      'document_requirement',
      'agency_review',
      'payment',
      'auth',
      'audit_log',
      'system'
    ],
    index: true
  },
  entityId: {
    type: String,
    index: true
  },
  trackingNumber: {
    type: String,
    index: true
  },
  result: {
    type: String,
    enum: ['success', 'failure'],
    default: 'success',
    index: true
  },
  ipAddress: {
    type: String,
    default: '127.0.0.1'
  },
  userAgent: {
    type: String,
    default: 'Unknown'
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: false,
  versionKey: false
});

// Compound indexes for high performance filtering
auditLogSchema.index({ timestamp: -1, action: 1 });
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ 'actor.id': 1, timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
