# College Hostel Room Allocation System

A complete full-stack web application for college hostel room allocation, occupancy management, and residential governance.

---

## 🛠️ Technology Stack

- **Frontend:** React.js, React Router v7, Lucide Icons, Pure CSS3 Design System
- **Backend:** Node.js, Express.js, JWT Authentication, bcryptjs, REST API
- **Database:** MongoDB + Mongoose (with atomic updates, compound indexes & strict relationships)

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on port `27017`

### 1. Backend Setup & Startup
```bash
cd backend
npm install

# (Optional) Seed realistic demo rooms, warden, and students
npm run seed

# Run the Express server (starts on http://localhost:5000)
npm start
```

### 2. Frontend Setup & Startup
```bash
cd frontend
npm install

# Start Vite React Dev Server (runs on http://localhost:3000)
npm run dev
```

---

## 🔑 Pre-seeded Institutional Credentials

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Chief Warden** | `warden@hostel.edu` | `password123` | Full administrative control & room management |
| **Allocated Student** | `rahul@student.edu` | `password123` | Allocated to Room 101 (View Active Allocation) |
| **Allocated Student** | `amit@student.edu` | `password123` | Allocated to Room 101 |
| **Allocated Student** | `priya@student.edu` | `password123` | Allocated to Room 102 |
| **Allocated Student** | `rohan@student.edu` | `password123` | Allocated to Room 102 |
| **New Student** | *Register via portal* | *Your password* | Can browse and book available beds |

---

## 🛡️ Business Rules Enforced on Backend

1. **Unique Room Number:** Duplicate room numbers are rejected across the database.
2. **Bed Capacity Constraints:** Minimum 1 bed required; zero or negative values rejected.
3. **One Student = One Bed:** Compound unique index `{ student: 1, status: "Active" }` prevents double allocations.
4. **No Overbooking:** Validation guards reject bookings when `availableBeds <= 0`.
5. **Atomic Booking:** Concurrency-safe MongoDB atomic `$subtract` / `$add` pipeline updates room occupancy and bed status simultaneously, guaranteeing that `occupiedBeds + availableBeds = totalBeds` at all times.
