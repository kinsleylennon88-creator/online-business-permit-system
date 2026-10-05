const mongoose = require('mongoose');

const documentHistorySchema = new mongoose.Schema({
  version: {
    type: Number,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  filePath: String,
  originalName: String,
  fileSize: Number,
  mimeType: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  remarks: String
}, { _id: false });

const documentSchema = new mongoose.Schema({
  docType: {
    type: String,
    default: 'other'
  },
  requirementCode: String,
  name: {
    type: String,
    required: true
  },
  description: String,
  originalName: String,
  fileUrl: {
    type: String,
    required: true
  },
  filePath: String,
  fileSize: Number,
  mimeType: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  agency: {
    type: String,
    enum: ['applicant', 'bplo', 'bureau_of_fire', 'bureau_of_sanitation'],
    default: 'applicant'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'superseded'],
    default: 'pending'
  },
  version: {
    type: Number,
    default: 1
  },
  history: [documentHistorySchema],
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  remarks: String
});

const agencyReviewSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['not_required', 'pending', 'under_review', 'approved', 'rejected', 'correction_requested'],
    default: 'pending'
  },
  assignedReviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: Date,
  remarks: {
    type: String,
    maxlength: [1000, 'Remarks cannot exceed 1000 characters']
  },
  correctionReason: {
    type: String,
    maxlength: [1000, 'Correction reason cannot exceed 1000 characters']
  },
  inspectionDate: Date,
  documents: [documentSchema]
}, { _id: false });

const permitSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  permitType: {
    type: String,
    enum: ['new', 'renewal'],
    default: 'new',
    required: [true, 'Permit type is required'],
    index: true
  },
  previousPermitNumber: {
    type: String,
    trim: true
  },
  previousApplicationNumber: {
    type: String,
    trim: true
  },
  previousPermitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Permit'
  },
  trackingNumber: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  },
  businessIdNumber: {
    type: String,
    trim: true,
    index: true
  },
  businessInfo: {
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: [100, 'Business name cannot exceed 100 characters']
    },
    businessType: {
      type: String,
      required: [true, 'Business type is required'],
      enum: [
        'sole_proprietorship',
        'one_person_corporation',
        'corporation',
        'partnership',
        'cooperative'
      ]
    },
    businessAddress: {
      street: String,
      barangay: {
        type: String,
        required: [true, 'Barangay is required']
      },
      municipality: {
        type: String,
        default: 'Janiuay'
      },
      province: {
        type: String,
        default: 'Iloilo'
      }
    },
    businessNature: {
      type: String,
      required: [true, 'Business nature is required']
    },
    capitalization: {
      type: Number,
      required: [true, 'Capitalization is required'],
      min: [0, 'Capitalization must be a positive number']
    },
    grossSales: {
      type: Number,
      default: 0
    }
  },
  ownerInfo: {
    firstName: {
      type: String,
      required: [true, 'Owner first name is required']
    },
    lastName: {
      type: String,
      required: [true, 'Owner last name is required']
    },
    middleName: String,
    gender: {
      type: String,
      enum: ['male', 'female', 'prefer_not_to_say'],
      default: 'prefer_not_to_say'
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^09\d{9}$/, 'Please enter a valid Philippine mobile number']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    }
  },
  paymentInfo: {
    paymentFrequency: {
      type: String,
      enum: ['annually', 'bi-annually', 'quarterly'],
      default: 'annually'
    },
    receiptDate: Date,
    orNumber: String,
    amount: {
      type: Number,
      default: 0
    },
    paymentMethod: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'verified'],
      default: 'pending'
    }
  },
  documents: [documentSchema],
  agencyReviews: {
    fire: {
      type: agencyReviewSchema,
      default: () => ({ status: 'pending' })
    },
    sanitation: {
      type: agencyReviewSchema,
      default: () => ({ status: 'pending' })
    }
  },
  assessment: {
    fees: {
      businessTax: { type: Number, default: 0 },
      mayorsPermit: { type: Number, default: 0 },
      sanitaryFee: { type: Number, default: 0 },
      fireSafetyFee: { type: Number, default: 0 },
      environmentalFee: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },
    assessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assessedAt: Date,
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'verified'],
      default: 'pending'
    },
    paymentMethod: String,
    paymentReference: String,
    paidAt: Date
  },
  status: {
    type: String,
    enum: [
      'draft',
      'submitted',
      'under_admin_review',
      'under_review', // kept for backwards compatibility
      'pending_fire_review',
      'pending_sanitation_review',
      'returned_for_correction',
      'rejected',
      'approved',
      'issued',
      'completed',
      'cancelled',
      'expired'
    ],
    default: 'draft',
    index: true
  },
  remarks: {
    type: String,
    maxlength: [500, 'Remarks cannot exceed 500 characters']
  },
  missingRequirements: [{
    type: String,
    trim: true
  }],
  adminComments: {
    type: String,
    trim: true
  },
  appliedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  approvalHistory: [{
    action: {
      type: String,
      enum: [
        'submitted',
        'reviewed',
        'fire_approved',
        'fire_rejected',
        'fire_correction_requested',
        'sanitation_approved',
        'sanitation_rejected',
        'sanitation_correction_requested',
        'returned_for_correction',
        'approved',
        'rejected',
        'issued',
        'cancelled'
      ]
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    performedAt: {
      type: Date,
      default: Date.now
    },
    remarks: String
  }],
  permitNumber: {
    type: String,
    index: true
  },
  issuedAt: Date,
  expiresAt: Date,
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
permitSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Generate tracking number and Business ID number upon submission
permitSchema.pre('save', function(next) {
  const year = new Date().getFullYear();
  if (this.status !== 'draft' && !this.trackingNumber) {
    const randomSeq = Math.floor(10000 + Math.random() * 90000);
    this.trackingNumber = `TRK-${year}-${randomSeq}`;
  }
  if (!this.businessIdNumber) {
    const randomBin = Math.floor(1000 + Math.random() * 9000);
    this.businessIdNumber = `BIN-${year}-${randomBin}`;
  }
  next();
});

// Generate permit number before approval
permitSchema.pre('save', function(next) {
  if ((this.status === 'approved' || this.status === 'issued') && !this.permitNumber) {
    const year = new Date().getFullYear();
    const sequence = Math.floor(1000 + Math.random() * 9000).toString().padStart(4, '0');
    this.permitNumber = `BP-${year}-${sequence}`;
  }
  next();
});

// Set expiration date when issued
permitSchema.pre('save', function(next) {
  if (this.status === 'issued' && !this.expiresAt) {
    this.expiresAt = new Date();
    this.expiresAt.setFullYear(this.expiresAt.getFullYear() + 1); // 1 year validity
  }
  next();
});

// Indexes
permitSchema.index({ applicant: 1, createdAt: -1 });
permitSchema.index({ status: 1, createdAt: -1 });
permitSchema.index({ 'businessInfo.barangay': 1 });
permitSchema.index({ 'agencyReviews.fire.status': 1 });
permitSchema.index({ 'agencyReviews.sanitation.status': 1 });

module.exports = mongoose.model('Permit', permitSchema);
