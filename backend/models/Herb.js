const mongoose = require('mongoose');

const herbSchema = new mongoose.Schema({
  herbId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  collector: {
    type: String,
    required: true,
    trim: true
  },
  geoTag: {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    },
    address: {
      type: String,
      trim: true,
      default: ""
    }
  },
  harvestDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Collected', 'In Processing', 'Packaged', 'Final Formulation', 'Distributed'],
    default: 'Collected'
  },
  blockchainTx: {
    type: String,
    trim: true,
    default: null
  },
  // Additional fields for better traceability
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    enum: ['kg', 'grams', 'tonnes'],
    default: 'kg'
  },
  quality: {
    type: String,
    enum: ['A', 'B', 'C'],
    default: 'A'
  },
  // History tracking
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: String,
    location: String,
    notes: String
  }],
  // Blockchain batch ID from smart contract
  batchId: {
    type: Number,
    default: null
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Index for efficient queries (herbId already has unique index)
herbSchema.index({ status: 1 });
herbSchema.index({ harvestDate: 1 });
herbSchema.index({ 'geoTag.latitude': 1, 'geoTag.longitude': 1 });

// Pre-save middleware to add initial status to history
herbSchema.pre('save', function(next) {
  if (this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
      updatedBy: this.collector,
      location: `${this.geoTag.latitude}, ${this.geoTag.longitude}`,
      notes: 'Initial collection'
    });
  }
  next();
});

// Method to update status and add to history
herbSchema.methods.updateStatus = function(newStatus, updatedBy, location, notes) {
  this.status = newStatus;
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    updatedBy: updatedBy || 'System',
    location: location || '',
    notes: notes || ''
  });
  return this.save();
};

// Virtual for formatted location
herbSchema.virtual('formattedLocation').get(function() {
  return `${this.geoTag.latitude}, ${this.geoTag.longitude}`;
});

// Ensure virtual fields are serialized
herbSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Herb', herbSchema);