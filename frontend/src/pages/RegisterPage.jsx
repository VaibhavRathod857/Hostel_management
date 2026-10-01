import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  ShieldCheck,
  GraduationCap,
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Lock,
  Mail,
  User,
  Hash,
  BookOpen
} from 'lucide-react';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'warden' ? 'warden' : 'student';

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [course, setCourse] = useState('B.Tech Computer Science');
  const [year, setYear] = useState('1st Year');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name,
        email,
        password,
        confirmPassword,
        role,
      };

      if (role === 'student') {
        payload.studentId = studentId;
        payload.course = course;
        payload.year = year;
      }

      const data = await register(payload);
      if (data.user.role === 'warden') {
        navigate('/warden/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)', width: '100%', overflowX: 'hidden' }}>
      {/* Top Header */}
      <header style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.85rem clamp(1rem, 3vw, 2rem)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '500', minHeight: '44px' }}>
          <ArrowLeft size={16} /> <span className="hide-on-mobile">Back to Portal</span>
        </Link>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '32px',
            height: '32px',
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-xs)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '0.9rem'
          }}>
            H
          </div>
          <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--primary)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            Hostel Portal
          </span>
        </Link>
        <div style={{ width: '44px' }} />
      </header>

      {/* Main Registration Panel */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(1.5rem, 4vw, 2.5rem) 1rem' }}>
        <div className="panel-card" style={{ maxWidth: '520px', width: '100%', padding: 'clamp(1.5rem, 4vw, 2.25rem)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div className="inst-badge" style={{ marginBottom: '0.65rem' }}>
              Official Student Registration
            </div>
            <h1 className="font-serif" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 1.75rem)', color: 'var(--primary)', marginBottom: '0.35rem', fontWeight: '400' }}>
              {role === 'warden' ? 'Warden Portal Registration' : 'Student Hostel Registration'}
            </h1>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Create your verified credentials to access campus residential allotment
            </p>
          </div>

          {/* Role Switcher */}
          <div style={{
            display: 'flex',
            backgroundColor: 'var(--bg-main)',
            padding: '4px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            marginBottom: '1.5rem'
          }}>
            <button
              type="button"
              onClick={() => handleRoleChange('student')}
              style={{
                flex: 1,
                minHeight: '44px',
                padding: '0.55rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: role === 'student' ? '#FFFFFF' : 'transparent',
                color: role === 'student' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: role === 'student' ? 'var(--shadow-subtle)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                transition: 'all var(--transition-fast)'
              }}
            >
              <GraduationCap size={16} /> Student
            </button>

            <button
              type="button"
              onClick={() => handleRoleChange('warden')}
              style={{
                flex: 1,
                minHeight: '44px',
                padding: '0.55rem',
                fontSize: '0.85rem',
                fontWeight: '600',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: role === 'warden' ? '#FFFFFF' : 'transparent',
                color: role === 'warden' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: role === 'warden' ? 'var(--shadow-subtle)' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.45rem',
                transition: 'all var(--transition-fast)'
              }}
            >
              <ShieldCheck size={16} /> Warden
            </button>
          </div>

          {error && (
            <div className="alert-error" style={{ marginBottom: '1.25rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {role === 'student' && (
              <>
                <div className="form-group">
                  <label className="form-label">Student ID / Enrollment Number</label>
                  <div style={{ position: 'relative' }}>
                    <Hash size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                    <input
                      type="text"
                      required
                      placeholder="e.g. STU2026105"
                      className="form-input"
                      style={{ paddingLeft: '2.4rem' }}
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid-2col-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Course / Dept</label>
                    <select
                      className="form-select"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                    >
                      <option value="B.Tech Computer Science">B.Tech CS</option>
                      <option value="B.Tech Information Technology">B.Tech IT</option>
                      <option value="B.Tech Electronics & Comm.">B.Tech ECE</option>
                      <option value="B.Tech Mechanical Eng.">B.Tech ME</option>
                      <option value="B.Tech Civil Eng.">B.Tech CE</option>
                      <option value="MCA Computer Applications">MCA</option>
                      <option value="M.Tech Data Science">M.Tech Data Science</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Academic Year</label>
                    <select
                      className="form-select"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Official Campus Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input
                  type="email"
                  required
                  placeholder={role === 'warden' ? 'warden@hostel.edu' : 'student@student.edu'}
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2col-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                  <input
                    type="password"
                    required
                    placeholder="Min 6 chars"
                    className="form-input"
                    style={{ paddingLeft: '2.4rem' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                  <input
                    type="password"
                    required
                    placeholder="Repeat"
                    className="form-input"
                    style={{ paddingLeft: '2.4rem' }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem', minHeight: '48px' }}
            >
              {submitting ? 'Registering...' : `Complete Registration`}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Already registered with the portal?{' '}
            <Link to={`/login?role=${role}`} style={{ color: 'var(--primary)', fontWeight: '600' }}>
              Sign in here
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
