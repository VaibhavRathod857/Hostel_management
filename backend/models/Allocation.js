const mongoose = require('mongoose');

const allocationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student is required'],
    },
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'Room is required'],
    },
    allocationDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Active', 'Cancelled'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure uniqueness for Active allocation per student
allocationSchema.index(
  { student: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: 'Active' } }
);

module.exports = mongoose.model('Allocation', allocationSchema);
