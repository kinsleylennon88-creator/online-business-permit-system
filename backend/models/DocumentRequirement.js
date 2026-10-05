const mongoose = require('mongoose');

const documentRequirementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Document requirement name is required'],
    trim: true,
    maxlength: [120, 'Name cannot exceed 120 characters']
  },
  code: {
    type: String,
    required: [true, 'Document requirement code is required'],
    trim: true,
    uppercase: true
  },
  description: {
    type: String,
    trim: true
  },
  issuingAgency: {
    type: String,
    trim: true,
    default: 'Local Government / Agency'
  },
  notes: {
    type: String,
    trim: true
  },
  isRequired: {
    type: Boolean,
    default: true
  },
  applicablePermitType: {
    type: String,
    enum: ['all', 'new', 'renewal'],
    default: 'all'
  },
  applicableBusinessType: {
    type: [String],
    default: ['all']
  },
  reviewingAgency: {
    type: String,
    enum: ['applicant', 'bplo', 'bureau_of_fire', 'bureau_of_sanitation'],
    default: 'applicant'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
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

documentRequirementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

documentRequirementSchema.index({ isActive: 1, reviewingAgency: 1, applicablePermitType: 1 });
documentRequirementSchema.index({ code: 1 }, { unique: true });

module.exports = mongoose.model('DocumentRequirement', documentRequirementSchema);
