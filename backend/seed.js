const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Room = require('./models/Room');
const Allocation = require('./models/Allocation');

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hostel_management';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing collections
    await Allocation.deleteMany({});
    await Room.deleteMany({});
    await User.deleteMany({});
    console.log('Existing collections cleared.');

    // 1. Create Warden
    const warden = await User.create({
      name: 'Dr. Ramesh Sharma (Chief Warden)',
      email: 'warden@hostel.edu',
      password: 'password123',
      role: 'warden',
    });
    console.log('✓ Warden created: warden@hostel.edu (password123)');

    // 2. Create Students
    const student1 = await User.create({
      name: 'Rahul Verma',
      studentId: 'STU2026001',
      email: 'rahul@student.edu',
      password: 'password123',
      role: 'student',
      course: 'B.Tech Computer Science',
      year: '3rd Year',
    });

    const student2 = await User.create({
      name: 'Amit Patel',
      studentId: 'STU2026002',
      email: 'amit@student.edu',
      password: 'password123',
      role: 'student',
      course: 'B.Tech Information Technology',
      year: '2nd Year',
    });

    const student3 = await User.create({
      name: 'Priya Sundaram',
      studentId: 'STU2026003',
      email: 'priya@student.edu',
      password: 'password123',
      role: 'student',
      course: 'B.Tech Electronics & Comm.',
      year: '3rd Year',
    });

    const student4 = await User.create({
      name: 'Rohan Mehra',
      studentId: 'STU2026004',
      email: 'rohan@student.edu',
      password: 'password123',
      role: 'student',
      course: 'MCA Computer Applications',
      year: '1st Year',
    });

    // 3. Create Sample Rooms
    const roomsData = [
      { roomNumber: '101', floor: 1, roomType: 'AC', totalBeds: 3, occupiedBeds: 2, availableBeds: 1, status: 'Available' },
      { roomNumber: '102', floor: 1, roomType: 'Non-AC', totalBeds: 2, occupiedBeds: 2, availableBeds: 0, status: 'Full' },
      { roomNumber: '103', floor: 1, roomType: 'AC', totalBeds: 3, occupiedBeds: 0, availableBeds: 3, status: 'Available' },
      { roomNumber: '201', floor: 2, roomType: 'AC', totalBeds: 2, occupiedBeds: 0, availableBeds: 2, status: 'Available' },
      { roomNumber: '202', floor: 2, roomType: 'Non-AC', totalBeds: 4, occupiedBeds: 0, availableBeds: 4, status: 'Available' },
      { roomNumber: '203', floor: 2, roomType: 'AC', totalBeds: 1, occupiedBeds: 0, availableBeds: 1, status: 'Available' },
      { roomNumber: '301', floor: 3, roomType: 'Non-AC', totalBeds: 3, occupiedBeds: 0, availableBeds: 3, status: 'Available' },
      { roomNumber: '302', floor: 3, roomType: 'AC', totalBeds: 2, occupiedBeds: 0, availableBeds: 2, status: 'Available' },
    ];

    const createdRooms = await Room.insertMany(roomsData);
    console.log(`✓ ${createdRooms.length} Rooms created.`);

    // 4. Create Initial Allocations for Room 101 and Room 102
    const room101 = createdRooms.find((r) => r.roomNumber === '101');
    const room102 = createdRooms.find((r) => r.roomNumber === '102');

    // Rahul and Amit in 101
    await Allocation.create({
      student: student1._id,
      room: room101._id,
      allocationDate: new Date('2026-08-15'),
      status: 'Active',
    });

    await Allocation.create({
      student: student2._id,
      room: room101._id,
      allocationDate: new Date('2026-08-16'),
      status: 'Active',
    });

    // Priya and Rohan in 102 (making 102 full)
    await Allocation.create({
      student: student3._id,
      room: room102._id,
      allocationDate: new Date('2026-08-10'),
      status: 'Active',
    });

    await Allocation.create({
      student: student4._id,
      room: room102._id,
      allocationDate: new Date('2026-08-12'),
      status: 'Active',
    });

    console.log('✓ Initial 4 student allocations populated.');
    console.log('====================================');
    console.log('SEEDING COMPLETED SUCCESSFULLY!');
    console.log('Warden Credentials:  warden@hostel.edu / password123');
    console.log('Allocated Student:   rahul@student.edu  / password123 (Room 101)');
    console.log('Unallocated Student: You can register a new student or use student accounts!');
    console.log('====================================');

    process.exit(0);
  } catch (err) {
    console.error('Error during seeding:', err);
    process.exit(1);
  }
};

seedData();
