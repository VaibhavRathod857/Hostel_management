const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Allocation = require('../models/Allocation');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/students
// @desc    Get all registered students with their allocation status
// @access  Private (Warden only)
router.get('/', protect, authorize('warden'), async (req, res) => {
  try {
    const { search } = req.query;

    let query = { role: 'student' };
    if (search && search.trim() !== '') {
      query.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { studentId: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const students = await User.find(query).select('-password').sort({ createdAt: -1 });

    // Fetch active allocations for these students
    const activeAllocations = await Allocation.find({
      student: { $in: students.map((s) => s._id) },
      status: 'Active',
    }).populate('room');

    const allocationMap = {};
    activeAllocations.forEach((a) => {
      allocationMap[a.student.toString()] = a;
    });

    const studentsWithAlloc = students.map((student) => {
      const alloc = allocationMap[student._id.toString()];
      return {
        ...student._doc,
        isAllocated: !!alloc,
        allocation: alloc || null,
      };
    });

    return res.status(200).json({
      success: true,
      count: studentsWithAlloc.length,
      students: studentsWithAlloc,
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve students list.',
    });
  }
});

module.exports = router;
