const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Allocation = require('../models/Allocation');
const Room = require('../models/Room');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/allocations/book/:roomId
// @desc    Atomically book one available bed in a room
// @access  Private (Student only)
router.post('/book/:roomId', protect, authorize('student'), async (req, res) => {
  const studentId = req.user._id;
  const { roomId } = req.params;

  try {
    // 1. Check whether the student already has an active allocation (Rule 3)
    const existingAllocation = await Allocation.findOne({
      student: studentId,
      status: 'Active',
    }).populate('room');

    if (existingAllocation) {
      return res.status(400).json({
        success: false,
        message: 'You already have a hostel room allocation.',
        allocation: existingAllocation,
      });
    }

    // 2. Check if room exists
    const roomCheck = await Room.findById(roomId);
    if (!roomCheck) {
      return res.status(404).json({
        success: false,
        message: 'The requested room does not exist.',
      });
    }

    // 3. Check whether room has vacancy (Rule 4)
    if (roomCheck.availableBeds <= 0 || roomCheck.status === 'Full') {
      return res.status(400).json({
        success: false,
        message: 'This room is currently full. No beds are available.',
      });
    }

    // 4. Rule 5 - ATOMIC BOOKING
    // We execute an atomic findOneAndUpdate with condition availableBeds > 0
    // This prevents simultaneous requests from causing race conditions or overbooking!
    const updatedRoom = await Room.findOneAndUpdate(
      {
        _id: roomId,
        availableBeds: { $gt: 0 }, // Atomic guard condition
      },
      [
        {
          $set: {
            occupiedBeds: { $add: ['$occupiedBeds', 1] },
            availableBeds: { $subtract: ['$availableBeds', 1] },
            status: {
              $cond: {
                if: { $lte: [{ $subtract: ['$availableBeds', 1] }, 0] },
                then: 'Full',
                else: 'Available',
              },
            },
          },
        },
      ],
      { new: true }
    );

    if (!updatedRoom) {
      return res.status(400).json({
        success: false,
        message: 'Booking failed. All beds were just taken. No available beds remaining.',
      });
    }

    // 5. Create Allocation record
    let newAllocation;
    try {
      newAllocation = await Allocation.create({
        student: studentId,
        room: updatedRoom._id,
        allocationDate: new Date(),
        status: 'Active',
      });
    } catch (allocError) {
      // Rollback room bed if allocation creation fails (e.g. unique index constraint)
      await Room.findByIdAndUpdate(roomId, [
        {
          $set: {
            occupiedBeds: { $max: [{ $subtract: ['$occupiedBeds', 1] }, 0] },
            availableBeds: { $add: ['$availableBeds', 1] },
            status: 'Available',
          },
        },
      ]);
      return res.status(400).json({
        success: false,
        message: allocError.message || 'Failed to complete allocation.',
      });
    }

    const populatedAllocation = await Allocation.findById(newAllocation._id)
      .populate('room')
      .populate('student', 'name studentId email course year');

    return res.status(201).json({
      success: true,
      message: `Bed successfully booked in Room ${updatedRoom.roomNumber}!`,
      allocation: populatedAllocation,
      room: updatedRoom,
    });
  } catch (error) {
    console.error('Error in booking room:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error occurred during bed booking.',
    });
  }
});

// @route   GET /api/allocations/my
// @desc    Get current student's active allocation
// @access  Private (Student only)
router.get('/my', protect, authorize('student'), async (req, res) => {
  try {
    const allocation = await Allocation.findOne({
      student: req.user._id,
      status: 'Active',
    }).populate('room');

    if (!allocation) {
      return res.status(200).json({
        success: true,
        hasAllocation: false,
        message: 'No active allocation found.',
        allocation: null,
      });
    }

    return res.status(200).json({
      success: true,
      hasAllocation: true,
      allocation,
    });
  } catch (error) {
    console.error('Error fetching student allocation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve allocation details.',
    });
  }
});

// @route   GET /api/allocations
// @desc    Get all allocations (for Warden)
// @access  Private (Warden only)
router.get('/', protect, authorize('warden'), async (req, res) => {
  try {
    const allocations = await Allocation.find()
      .populate('room')
      .populate('student', 'name studentId email course year')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: allocations.length,
      allocations,
    });
  } catch (error) {
    console.error('Error fetching allocations:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve allocations list.',
    });
  }
});

// @route   GET /api/allocations/room/:roomId
// @desc    Get all active residents/allocations for a specific room
// @access  Private (Warden only)
router.get('/room/:roomId', protect, authorize('warden'), async (req, res) => {
  try {
    const allocations = await Allocation.find({
      room: req.params.roomId,
      status: 'Active',
    }).populate('student', 'name studentId email course year');

    return res.status(200).json({
      success: true,
      count: allocations.length,
      residents: allocations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve room residents.',
    });
  }
});

// @route   PUT /api/allocations/cancel/:id
// @desc    Warden can deallocate / cancel an allocation and free up a bed
// @access  Private (Warden only)
router.put('/cancel/:id', protect, authorize('warden'), async (req, res) => {
  try {
    const allocation = await Allocation.findById(req.params.id);
    if (!allocation) {
      return res.status(404).json({
        success: false,
        message: 'Allocation record not found.',
      });
    }

    if (allocation.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This allocation is already cancelled.',
      });
    }

    allocation.status = 'Cancelled';
    await allocation.save();

    // Release bed in the room atomically
    await Room.findByIdAndUpdate(allocation.room, [
      {
        $set: {
          occupiedBeds: { $max: [{ $subtract: ['$occupiedBeds', 1] }, 0] },
          availableBeds: { $add: ['$availableBeds', 1] },
          status: 'Available',
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      message: 'Student deallocated and bed freed successfully.',
      allocation,
    });
  } catch (error) {
    console.error('Error cancelling allocation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to cancel allocation.',
    });
  }
});

module.exports = router;
