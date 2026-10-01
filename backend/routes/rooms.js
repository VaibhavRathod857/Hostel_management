const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Allocation = require('../models/Allocation');
const { protect, authorize } = require('../middleware/auth');

// @route   POST /api/rooms
// @desc    Add a new room
// @access  Private (Warden only)
router.post('/', protect, authorize('warden'), async (req, res) => {
  try {
    const { roomNumber, floor, roomType, totalBeds } = req.body;

    // Validation
    if (!roomNumber || floor === undefined || !roomType || !totalBeds) {
      return res.status(400).json({
        success: false,
        message: 'Please provide roomNumber, floor, roomType, and totalBeds.',
      });
    }

    const beds = parseInt(totalBeds, 10);
    const floorNum = parseInt(floor, 10);

    if (isNaN(beds) || beds < 1) {
      return res.status(400).json({
        success: false,
        message: 'Total bed capacity must be a positive number (minimum 1).',
      });
    }

    if (isNaN(floorNum) || floorNum < 0) {
      return res.status(400).json({
        success: false,
        message: 'Floor must be a valid non-negative number.',
      });
    }

    if (!['AC', 'Non-AC'].includes(roomType)) {
      return res.status(400).json({
        success: false,
        message: 'Room type must be either AC or Non-AC.',
      });
    }

    // Check for unique room number
    const formattedRoomNumber = String(roomNumber).trim().toUpperCase();
    const existing = await Room.findOne({ roomNumber: formattedRoomNumber });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Room ${formattedRoomNumber} already exists. Duplicate room numbers are not allowed.`,
      });
    }

    const room = await Room.create({
      roomNumber: formattedRoomNumber,
      floor: floorNum,
      roomType,
      totalBeds: beds,
      occupiedBeds: 0,
      availableBeds: beds,
      status: 'Available',
    });

    return res.status(201).json({
      success: true,
      message: `Room ${room.roomNumber} created successfully.`,
      room,
    });
  } catch (error) {
    console.error('Error creating room:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating room.',
    });
  }
});

// @route   GET /api/rooms
// @desc    Get all rooms with their active residents (for inventory/overview)
// @access  Private (Warden & Student)
router.get('/', protect, async (req, res) => {
  try {
    const { floor, roomType, status, search } = req.query;

    let query = {};

    if (floor !== undefined && floor !== '') {
      query.floor = parseInt(floor, 10);
    }

    if (roomType && ['AC', 'Non-AC'].includes(roomType)) {
      query.roomType = roomType;
    }

    if (status && ['Available', 'Full'].includes(status)) {
      query.status = status;
    }

    if (search && search.trim() !== '') {
      query.roomNumber = { $regex: search.trim(), $options: 'i' };
    }

    const rooms = await Room.find(query).sort({ floor: 1, roomNumber: 1 });

    // If warden requests, populate residents for each room
    let roomsWithResidents = [];
    if (req.user.role === 'warden') {
      const roomIds = rooms.map((r) => r._id);
      const activeAllocations = await Allocation.find({
        room: { $in: roomIds },
        status: 'Active',
      }).populate('student', 'name studentId email course year');

      const allocationMap = {};
      activeAllocations.forEach((alloc) => {
        const rId = alloc.room.toString();
        if (!allocationMap[rId]) allocationMap[rId] = [];
        if (alloc.student) {
          allocationMap[rId].push({
            allocationId: alloc._id,
            allocationDate: alloc.allocationDate,
            ...alloc.student._doc,
          });
        }
      });

      roomsWithResidents = rooms.map((room) => {
        const residents = allocationMap[room._id.toString()] || [];
        return {
          ...room._doc,
          residents,
        };
      });
    } else {
      roomsWithResidents = rooms;
    }

    return res.status(200).json({
      success: true,
      count: roomsWithResidents.length,
      rooms: roomsWithResidents,
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch rooms.',
    });
  }
});

// @route   GET /api/rooms/available
// @desc    Get only available rooms (for student booking)
// @access  Private (Student & Warden)
router.get('/available', protect, async (req, res) => {
  try {
    const { floor, roomType, search } = req.query;

    let query = {
      availableBeds: { $gt: 0 },
      status: 'Available',
    };

    if (floor !== undefined && floor !== '') {
      query.floor = parseInt(floor, 10);
    }

    if (roomType && ['AC', 'Non-AC'].includes(roomType)) {
      query.roomType = roomType;
    }

    if (search && search.trim() !== '') {
      query.roomNumber = { $regex: search.trim(), $options: 'i' };
    }

    const rooms = await Room.find(query).sort({ floor: 1, roomNumber: 1 });

    return res.status(200).json({
      success: true,
      count: rooms.length,
      rooms,
    });
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch available rooms.',
    });
  }
});

// @route   GET /api/rooms/stats
// @desc    Get aggregate stats for Warden dashboard
// @access  Private (Warden)
router.get('/stats', protect, authorize('warden'), async (req, res) => {
  try {
    const rooms = await Room.find();

    const totalRooms = rooms.length;
    const totalBeds = rooms.reduce((acc, r) => acc + (r.totalBeds || 0), 0);
    const occupiedBeds = rooms.reduce((acc, r) => acc + (r.occupiedBeds || 0), 0);
    const availableBeds = rooms.reduce((acc, r) => acc + (r.availableBeds || 0), 0);
    const fullRooms = rooms.filter((r) => r.status === 'Full' || r.availableBeds <= 0).length;

    return res.status(200).json({
      success: true,
      stats: {
        totalRooms,
        totalBeds,
        occupiedBeds,
        availableBeds,
        fullRooms,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate statistics.',
    });
  }
});

// @route   GET /api/rooms/:id
// @desc    Get single room details
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    // Also get active residents
    const allocations = await Allocation.find({
      room: room._id,
      status: 'Active',
    }).populate('student', 'name studentId email course year');

    return res.status(200).json({
      success: true,
      room,
      residents: allocations.map((a) => ({
        allocationId: a._id,
        allocationDate: a.allocationDate,
        ...a.student._doc,
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch room details.',
    });
  }
});

// @route   DELETE /api/rooms/:id
// @desc    Delete eligible room (only if occupiedBeds === 0)
// @access  Private (Warden only)
router.delete('/:id', protect, authorize('warden'), async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found.',
      });
    }

    // Check if room has active residents
    if (room.occupiedBeds > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete Room ${room.roomNumber} because it currently has ${room.occupiedBeds} resident(s). Deallocate residents first.`,
      });
    }

    await Room.findByIdAndDelete(req.params.id);
    return res.status(200).json({
      success: true,
      message: `Room ${room.roomNumber} deleted successfully.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete room.',
    });
  }
});

module.exports = router;
