import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StudentDashboard from './pages/student/StudentDashboard';
import WardenDashboard from './pages/warden/WardenDashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
          </Route>

          {/* Warden Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={['warden']} />}>
            <Route path="/warden/dashboard" element={<WardenDashboard />} />
          </Route>

          {/* Fallback to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
