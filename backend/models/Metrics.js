const mongoose = require('mongoose');

const metricsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  users: {
    newRegistrations: {
      type: Number,
      default: 0
    },
    totalActive: {
      type: Number,
      default: 0
    },
    returningUsers: {
      type: Number,
      default: 0
    }
  },
  permits: {
    newApplications: {
      type: Number,
      default: 0
    },
    approved: {
      type: Number,
      default: 0
    },
    rejected: {
      type: Number,
      default: 0
    },
    pending: {
      type: Number,
      default: 0
    },
    totalActive: {
      type: Number,
      default: 0
    }
  },
  chatbot: {
    totalQueries: {
      type: Number,
      default: 0
    },
    uniqueUsers: {
      type: Number,
      default: 0
    },
    averageResponseTime: {
      type: Number,
      default: 0
    },
    escalatedQueries: {
      type: Number,
      default: 0
    },
    satisfactionScore: {
      type: Number,
      default: 0
    }
  },
  system: {
    uptime: {
      type: Number,
      default: 0
    },
    responseTime: {
      type: Number,
      default: 0
    },
    errorRate: {
      type: Number,
      default: 0
    },
    apiCalls: {
      type: Number,
      default: 0
    }
  },
  revenue: {
    totalCollected: {
      type: Number,
      default: 0
    },
    businessTax: {
      type: Number,
      default: 0
    },
    permitFees: {
      type: Number,
      default: 0
    },
    otherFees: {
      type: Number,
      default: 0
    }
  },
  barangays: [{
    name: String,
    applications: Number,
    approvals: Number
  }],
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
metricsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
metricsSchema.index({ date: -1 });
metricsSchema.index({ 'barangays.name': 1 });

// Static method to get or create daily metrics
metricsSchema.statics.getDailyMetrics = async function(date = new Date()) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  let metrics = await this.findOne({ date: startOfDay });
  
  if (!metrics) {
    metrics = await this.create({ date: startOfDay });
  }
  
  return metrics;
};

module.exports = mongoose.model('Metrics', metricsSchema);
