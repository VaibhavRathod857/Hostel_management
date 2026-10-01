const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/rooms');
const allocationRoutes = require('./routes/allocations');
const studentRoutes = require('./routes/students');

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/allocations', allocationRoutes);
app.use('/api/students', studentRoutes);

// Root health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    message: 'Hostel Management System API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Handle uncaught exceptions and rejections
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Port and MongoDB connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_management';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('✓ Successfully connected to MongoDB at', MONGODB_URI);
    const server = app.listen(PORT, () => {
      console.log(`✓ Hostel Management Server running on port ${PORT}`);
    });

    // Keep event loop active
    setInterval(() => {}, 1000 * 60 * 60);
  })
  .catch((err) => {
    console.error('✗ MongoDB connection error:', err.message);
    process.exit(1);
  });

