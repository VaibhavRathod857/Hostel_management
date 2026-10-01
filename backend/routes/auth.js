const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Generate JWT Helper
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'hostel_super_secret_jwt_key_2026',
    { expiresIn: '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user (Student or Warden)
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, studentId, email, password, confirmPassword, role, course, year } = req.body;

    // Check mandatory fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, email, password).',
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match.',
      });
    }

    const assignedRole = role === 'warden' ? 'warden' : 'student';

    // If student, validate studentId
    if (assignedRole === 'student') {
      if (!studentId || !studentId.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Student ID is required for student registration.',
        });
      }

      // Check if studentId already exists
      const existingStudentId = await User.findOne({ studentId: studentId.trim() });
      if (existingStudentId) {
        return res.status(400).json({
          success: false,
          message: 'Student ID is already registered.',
        });
      }
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email address is already registered.',
      });
    }

    // Create user
    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: assignedRole,
    };

    if (assignedRole === 'student') {
      userData.studentId = studentId.trim();
      userData.course = course ? course.trim() : '';
      userData.year = year ? year.trim() : '';
    }

    const user = await User.create(userData);

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        course: user.course,
        year: user.year,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration.',
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const query = { email: email.toLowerCase().trim() };
    if (role) {
      query.role = role.toLowerCase().trim();
    }

    const user = await User.findOne(query);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials or incorrect role selected.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials.',
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        course: user.course,
        year: user.year,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login.',
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user details
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve user profile.',
    });
  }
});

module.exports = router;
