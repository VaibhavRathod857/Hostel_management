import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  ShieldCheck,
  GraduationCap,
  AlertCircle,
  Lock,
  Mail,
  ArrowLeft,
  CheckCircle2,
  KeyRound
} from 'lucide-react';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'warden' ? 'warden' : 'student';

  const [role, setRole] = useState(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
  };

  const handleQuickFill = (demoEmail, demoPass, demoRole) => {
    setRole(demoRole);
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const data = await login(email, password, role);
      if (data.user.role === 'warden') {
        navigate('/warden/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials or login failure.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)', width: '100%', overflowX: 'hidden' }}>
      {/* Top Institutional Header */}
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

      {/* Main Login Panel */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(1.5rem, 4vw, 2.5rem) 1rem' }}>
        <div className="panel-card" style={{ maxWidth: '440px', width: '100%', padding: 'clamp(1.5rem, 4vw, 2.25rem)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div className="inst-badge" style={{ marginBottom: '0.65rem' }}>
              Institutional Sign In
            </div>
            <h1 className="font-serif" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 1.75rem)', color: 'var(--primary)', marginBottom: '0.35rem', fontWeight: '400' }}>
              {role === 'warden' ? 'Warden Portal Login' : 'Student Portal Login'}
            </h1>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Sign in with your verified campus email credentials
            </p>
          </div>

          {/* Role Switcher Tabs */}
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

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="form-input"
                  style={{ paddingLeft: '2.4rem' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem', minHeight: '48px' }}
            >
              {submitting ? 'Authenticating...' : `Sign In as ${role === 'warden' ? 'Chief Warden' : 'Student'}`}
            </button>
          </form>

          {/* Quick Demo Fill Helper */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            backgroundColor: 'var(--bg-main)',
            border: '1px dashed var(--border-strong)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.775rem',
            color: 'var(--text-muted)'
          }}>
            <div style={{ fontWeight: '700', color: 'var(--primary)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
              Quick Fill Demo Credentials
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              <button
                type="button"
                onClick={() => handleQuickFill('warden@hostel.edu', 'password123', 'warden')}
                style={{
                  padding: '0.4rem 0.65rem',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--primary)',
                  minHeight: '36px'
                }}
              >
                Chief Warden
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('rahul@student.edu', 'password123', 'student')}
                style={{
                  padding: '0.4rem 0.65rem',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--secondary)',
                  minHeight: '36px'
                }}
              >
                Allocated Student (Rahul)
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Need to register a new student account?{' '}
            <Link to={`/register?role=${role}`} style={{ color: 'var(--primary)', fontWeight: '600' }}>
              Register here
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
};

export default LoginPage;
