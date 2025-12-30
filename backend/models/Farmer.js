const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  farmerId: {
    type: String,
    required: [true, 'Farmer ID is required'],
    unique: true,
    trim: true,
    uppercase: true,
    match: [/^[A-Z0-9_-]+$/, 'Farmer ID must contain only uppercase letters, numbers, hyphens, and underscores']
  },
  name: {
    type: String,
    required: [true, 'Farmer name is required'],
    trim: true,
    maxlength: [100, 'Farmer name must be less than 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^(\+\d{1,3}[- ]?)?\d{10}$/, 'Please enter a valid phone number']
  },
  address: {
    street: {
      type: String,
      required: [true, 'Street address is required']
    },
    city: {
      type: String,
      required: [true, 'City is required']
    },
    state: {
      type: String,
      required: [true, 'State is required']
    },
    pincode: {
      type: String,
      required: [true, 'Pincode is required'],
      match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
    }
  },
  farmDetails: {
    farmName: {
      type: String,
      required: [true, 'Farm name is required'],
      trim: true
    },
    farmSize: {
      type: Number,
      required: [true, 'Farm size is required'],
      min: [0.1, 'Farm size must be at least 0.1 acres']
    },
    farmType: {
      type: String,
      required: [true, 'Farm type is required'],
      enum: ['Organic', 'Conventional', 'Mixed'],
      default: 'Conventional'
    },
    soilType: {
      type: String,
      enum: ['Clay', 'Sandy', 'Loamy', 'Silt', 'Chalky', 'Peaty']
    },
    irrigationType: {
      type: String,
      enum: ['Drip', 'Sprinkler', 'Flood', 'Rain-fed', 'Mixed']
    }
  },
  location: {
    latitude: {
      type: Number,
      required: [true, 'Latitude is required'],
      min: [-90, 'Latitude must be between -90 and 90'],
      max: [90, 'Latitude must be between -90 and 90']
    },
    longitude: {
      type: Number,
      required: [true, 'Longitude is required'],
      min: [-180, 'Longitude must be between -180 and 180'],
      max: [180, 'Longitude must be between -180 and 180']
    }
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  verificationStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending'
  },
  certifications: [{
    name: {
      type: String,
      required: true
    },
    issuingBody: String,
    issueDate: Date,
    expiryDate: Date,
    certificateNumber: String
  }],
  specializations: [{
    type: String,
    enum: [
      'Ashwagandha', 'Turmeric', 'Neem', 'Tulsi', 'Brahmi', 'Arjuna',
      'Shatavari', 'Guduchi', 'Triphala herbs', 'Aloe Vera', 
      'Medicinal herbs', 'Aromatic herbs', 'Other'
    ]
  }],
  bankDetails: {
    accountNumber: {
      type: String,
      match: [/^\d{9,18}$/, 'Please enter a valid account number']
    },
    ifscCode: {
      type: String,
      match: [/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Please enter a valid IFSC code']
    },
    bankName: String,
    branchName: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Blockchain integration
  walletAddress: {
    type: String,
    match: [/^0x[a-fA-F0-9]{40}$/, 'Please enter a valid Ethereum wallet address']
  },
  // Metadata
  createdBy: {
    type: String,
    default: 'system'
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes must be less than 1000 characters']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for full address
farmerSchema.virtual('fullAddress').get(function() {
  return `${this.address.street}, ${this.address.city}, ${this.address.state} - ${this.address.pincode}`;
});

// Virtual field for herbs count
farmerSchema.virtual('herbsCount', {
  ref: 'Herb',
  localField: 'farmerId',
  foreignField: 'collector',
  count: true
});

// Index for efficient queries (farmerId and email already have unique indexes)
farmerSchema.index({ phone: 1 });
farmerSchema.index({ 'address.state': 1, 'address.city': 1 });
farmerSchema.index({ verificationStatus: 1 });
farmerSchema.index({ specializations: 1 });
farmerSchema.index({ location: '2dsphere' });

// Pre-save middleware
farmerSchema.pre('save', function(next) {
  // Auto-generate farmerId if not provided
  if (!this.farmerId) {
    const prefix = 'FR';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    this.farmerId = `${prefix}${timestamp}${random}`;
  }
  next();
});

module.exports = mongoose.model('Farmer', farmerSchema);