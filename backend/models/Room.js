const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    floor: {
      type: Number,
      required: [true, 'Floor number is required'],
      min: [0, 'Floor cannot be negative'],
    },
    roomType: {
      type: String,
      enum: ['AC', 'Non-AC'],
      required: [true, 'Room type is required (AC or Non-AC)'],
    },
    totalBeds: {
      type: Number,
      required: [true, 'Total bed capacity is required'],
      min: [1, 'Bed capacity must be at least 1'],
    },
    occupiedBeds: {
      type: Number,
      default: 0,
      min: [0, 'Occupied beds cannot be negative'],
    },
    availableBeds: {
      type: Number,
      min: [0, 'Available beds cannot be negative'],
    },
    status: {
      type: String,
      enum: ['Available', 'Full'],
      default: 'Available',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to ensure availableBeds and status calculations
roomSchema.pre('save', function (next) {
  if (this.occupiedBeds === undefined || this.occupiedBeds === null) {
    this.occupiedBeds = 0;
  }
  this.availableBeds = this.totalBeds - this.occupiedBeds;
  this.status = this.availableBeds <= 0 ? 'Full' : 'Available';
  next();
});

module.exports = mongoose.model('Room', roomSchema);
