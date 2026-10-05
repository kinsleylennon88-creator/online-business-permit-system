const mongoose = require('mongoose');

const chatLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  sessionId: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['public', 'user', 'admin', 'superadmin'],
    default: 'public'
  },
  messages: [{
    type: {
      type: String,
      enum: ['user', 'bot'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      intent: String,
      confidence: Number,
      responseTime: Number
    }
  }],
  userInfo: {
    ip: String,
    userAgent: String,
    location: String
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    ratedAt: Date
  },
  escalated: {
    type: Boolean,
    default: false
  },
  escalationReason: String,
  escalatedAt: Date,
  resolved: {
    type: Boolean,
    default: false
  },
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
chatLogSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
chatLogSchema.index({ userId: 1 });
chatLogSchema.index({ sessionId: 1 });
chatLogSchema.index({ createdAt: -1 });
chatLogSchema.index({ escalated: 1 });

module.exports = mongoose.model('ChatLog', chatLogSchema);
