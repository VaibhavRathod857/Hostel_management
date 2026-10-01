import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  GraduationCap,
  ArrowRight,
  Wifi,
  ShieldAlert,
  BookOpen,
  Coffee,
  Sparkles,
  Zap,
  Droplets,
  Shirt,
  CheckCircle2,
  Calendar,
  Layers,
  MapPin,
  Phone,
  Mail,
  Menu,
  X,
  ChevronRight,
  BedDouble
} from 'lucide-react';
import { campusImages } from '../assets/campusImages';
import OccupancyDots from '../components/OccupancyDots';
import { SkeletonCard } from '../components/SkeletonLoader';
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LandingPage = () => {
  const navigate = useNavigate();

  // Scroll state for navbar transition
  const [scrolled, setScrolled] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Live room availability from MongoDB
  const [liveRooms, setLiveRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [stats, setStats] = useState({
    totalRooms: 24,
    totalBeds: 72,
    availableBeds: 12,
    floors: 3,
  });

  // Lightbox modal state for gallery
  const [activePhoto, setActivePhoto] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile drawer or lightbox is open
  useEffect(() => {
    if (mobileDrawerOpen || activePhoto) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [mobileDrawerOpen, activePhoto]);

  // Fetch live available rooms from MongoDB backend
  useEffect(() => {
    const fetchLiveAvailability = async () => {
      try {
        const res = await fetch(`${API_BASE}/rooms/available`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.rooms) {
            setLiveRooms(data.rooms.slice(0, 4));
            const totalAvail = data.rooms.reduce((acc, r) => acc + (r.availableBeds || 0), 0);
            setStats(prev => ({
              ...prev,
              availableBeds: totalAvail > 0 ? totalAvail : prev.availableBeds,
            }));
          }
        }
      } catch (err) {
        console.warn('Backend not responding to public available rooms request, fallback to defaults');
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchLiveAvailability();
  }, []);

  const closeMobileMenu = () => {
    setMobileDrawerOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)', overflowX: 'hidden', width: '100%' }}>
      
      {/* SECTION 1 — NAVBAR */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        transition: 'all var(--transition-normal)',
        backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.98)' : 'rgba(245, 246, 244, 0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: scrolled ? '1px solid var(--border-color)' : '1px solid transparent',
        boxShadow: scrolled ? 'var(--shadow-subtle)' : 'none',
        padding: scrolled ? '0.65rem clamp(1rem, 3vw, 2rem)' : '1rem clamp(1rem, 3vw, 2rem)',
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%'
        }}>
          {/* Logo Mark */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '1.1rem',
              letterSpacing: '-0.02em',
              flexShrink: 0
            }}>
              H
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: '800',
                fontSize: '0.95rem',
                color: 'var(--primary)',
                letterSpacing: '0.04em',
                lineHeight: 1.15,
                textTransform: 'uppercase'
              }}>
                Hostel Portal
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', letterSpacing: '0.02em' }}>
                Campus Residences
              </div>
            </div>
          </Link>

          {/* Desktop Center Navigation Links */}
          <div className="hide-tablet-mobile" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <a href="#hero" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Home</a>
            <a href="#availability" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Rooms</a>
            <a href="#facilities" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Facilities</a>
            <a href="#about" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>About</a>
            <a href="#footer" style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>Contact</a>
          </div>

          {/* Desktop Right Action Buttons */}
          <div className="hide-tablet-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link to="/login?role=student" className="btn-secondary" style={{ fontSize: '0.825rem', padding: '0.5rem 1rem', minHeight: '38px' }}>
              <GraduationCap size={15} /> Student Login
            </Link>
            <Link to="/login?role=warden" className="btn-primary" style={{ fontSize: '0.825rem', padding: '0.5rem 1rem', minHeight: '38px' }}>
              <ShieldCheck size={15} /> Warden Portal
            </Link>
          </div>

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            style={{
              padding: '0.5rem',
              color: 'var(--primary)',
              minHeight: '44px',
              minWidth: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            className="show-tablet-mobile hide-on-desktop"
            aria-label="Open navigation menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      {/* MOBILE OFFCANVAS DRAWER & BACKDROP */}
      {mobileDrawerOpen && (
        <>
          <div
            className="mobile-drawer-backdrop"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
          <aside className="mobile-drawer" aria-label="Mobile Navigation">
            {/* Drawer Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
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
                  fontSize: '0.95rem'
                }}>
                  H
                </div>
                <div style={{ fontWeight: '800', fontSize: '0.9rem', color: 'var(--primary)', letterSpacing: '0.03em' }}>
                  HOSTEL PORTAL
                </div>
              </div>

              <button
                onClick={closeMobileMenu}
                style={{
                  color: 'var(--text-muted)',
                  padding: '0.4rem',
                  minHeight: '44px',
                  minWidth: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label="Close menu"
              >
                <X size={22} />
              </button>
            </div>

            {/* Drawer Links */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', flex: 1 }}>
              <a
                href="#hero"
                onClick={closeMobileMenu}
                style={{ padding: '0.65rem 0', color: 'var(--primary)', fontSize: '1rem', fontWeight: '600', borderBottom: '1px solid var(--border-subtle)' }}
              >
                Home
              </a>
              <a
                href="#availability"
                onClick={closeMobileMenu}
                style={{ padding: '0.65rem 0', color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: '500', borderBottom: '1px solid var(--border-subtle)' }}
              >
                Live Room Availability
              </a>
              <a
                href="#facilities"
                onClick={closeMobileMenu}
                style={{ padding: '0.65rem 0', color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: '500', borderBottom: '1px solid var(--border-subtle)' }}
              >
                Campus Facilities
              </a>
              <a
                href="#about"
                onClick={closeMobileMenu}
                style={{ padding: '0.65rem 0', color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: '500', borderBottom: '1px solid var(--border-subtle)' }}
              >
                About the Hostel
              </a>
              <a
                href="#footer"
                onClick={closeMobileMenu}
                style={{ padding: '0.65rem 0', color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: '500', borderBottom: '1px solid var(--border-subtle)' }}
              >
                Emergency & Contact
              </a>
            </div>

            {/* Drawer Actions */}
            <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem', backgroundColor: 'var(--bg-main)' }}>
              <Link
                to="/login?role=student"
                onClick={closeMobileMenu}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <GraduationCap size={16} /> Student Login
              </Link>
              <Link
                to="/login?role=warden"
                onClick={closeMobileMenu}
                className="btn-gold"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <ShieldCheck size={16} /> Warden Portal
              </Link>
            </div>
          </aside>
        </>
      )}

      {/* SECTION 2 — HERO (Responsive Stack on Mobile, Editorial 2-Col on Desktop) */}
      <section id="hero" style={{ padding: 'clamp(2rem, 5vw, 4.5rem) clamp(1rem, 3vw, 2rem)', overflow: 'hidden' }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
          gap: 'clamp(2rem, 4vw, 3.5rem)',
          alignItems: 'center'
        }}>
          {/* Left Hero Content */}
          <div style={{ maxWidth: '580px', width: '100%' }}>
            <div className="inst-badge" style={{ marginBottom: '1.25rem' }}>
              <Building2 size={13} /> College Hostel • Room Allocation
            </div>

            <h1 className="font-serif" style={{
              fontSize: 'clamp(2.15rem, 5.5vw, 3.75rem)',
              color: 'var(--primary)',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              marginBottom: '1.25rem',
              fontWeight: '400',
            }}>
              Find a place <br />
              <span style={{ fontStyle: 'italic', color: 'var(--secondary)' }}>that feels like home.</span>
            </h1>

            <p style={{
              fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
              marginBottom: '2rem',
              maxWidth: '520px',
            }}>
              Explore hostel rooms, check live availability and reserve your bed through the college's centralized accommodation portal.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.85rem', alignItems: 'center' }}>
              <a href="#availability" className="btn-primary" style={{ padding: '0.8rem 1.6rem', fontSize: '0.925rem', flex: '1 1 auto', minWidth: '160px' }}>
                Explore Rooms <ArrowRight size={16} />
              </a>
              <Link to="/login?role=student" className="btn-secondary" style={{ padding: '0.8rem 1.6rem', fontSize: '0.925rem', flex: '1 1 auto', minWidth: '160px' }}>
                Student Login
              </Link>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0 }} />
              <span>Live MongoDB synchronization • One Student per Bed Policy</span>
            </div>
          </div>

          {/* Right Hero Image Composition */}
          <div style={{ position: 'relative', width: '100%' }}>
            <div style={{
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-elevated)',
              border: '1px solid var(--border-color)',
              position: 'relative',
              height: 'clamp(260px, 45vw, 460px)',
              backgroundColor: '#E5E8E4'
            }}>
              <img
                src={campusImages.hero}
                alt="University Student Residence Hall"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>

            {/* Responsive Floating Live Availability Card */}
            <div style={{
              marginTop: '1rem',
              backgroundColor: '#FFFFFF',
              padding: '0.85rem 1.25rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-card)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              maxWidth: '100%'
            }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--success-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--success)',
                flexShrink: 0
              }}>
                <BedDouble size={18} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.725rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                  <span className="live-indicator" /> Live Availability
                </div>
                <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--primary)', marginTop: '2px' }}>
                  {stats.availableBeds} beds available today
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — TRUST / QUICK INFORMATION STRIP (Responsive 2x2 on Mobile, 4-Col Desktop) */}
      <section style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
        padding: '2rem clamp(1rem, 3vw, 2rem)',
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
          gap: 'clamp(1.25rem, 3vw, 2rem)',
          alignItems: 'center'
        }}>
          <div style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1rem' }}>
            <div className="font-serif" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)', color: 'var(--primary)', lineHeight: 1 }}>
              {stats.totalRooms}+
            </div>
            <div style={{ fontSize: '0.825rem', fontWeight: '600', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Hostel Rooms
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Across sanitized wings</div>
          </div>

          <div style={{ borderLeft: '3px solid var(--secondary)', paddingLeft: '1rem' }}>
            <div className="font-serif" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)', color: 'var(--secondary)', lineHeight: 1 }}>
              {stats.totalBeds}+
            </div>
            <div style={{ fontSize: '0.825rem', fontWeight: '600', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Bed Capacity
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Individual study stations</div>
          </div>

          <div style={{ borderLeft: '3px solid var(--accent)', paddingLeft: '1rem' }}>
            <div className="font-serif" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)', color: 'var(--accent)', lineHeight: 1 }}>
              {stats.floors}
            </div>
            <div style={{ fontSize: '0.825rem', fontWeight: '600', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Hostel Floors
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Elevator & fire safe</div>
          </div>

          <div style={{ borderLeft: '3px solid var(--teal)', paddingLeft: '1rem' }}>
            <div className="font-serif" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.25rem)', color: 'var(--teal)', lineHeight: 1 }}>
              24/7
            </div>
            <div style={{ fontSize: '0.825rem', fontWeight: '600', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Student Support
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Wardens & medical care</div>
          </div>
        </div>
      </section>

      {/* SECTION 4 — ABOUT HOSTEL */}
      <section id="about" style={{ padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 3vw, 2rem)', backgroundColor: 'var(--bg-main)' }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
          gap: 'clamp(2rem, 5vw, 4rem)',
          alignItems: 'center'
        }}>
          {/* Left About Image */}
          <div style={{
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-card)',
            height: 'clamp(240px, 40vw, 440px)',
            backgroundColor: '#EAECE9'
          }}>
            <img
              src={campusImages.about}
              alt="University Quad Architecture"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          {/* Right Editorial Copy */}
          <div>
            <div className="inst-badge" style={{ marginBottom: '1rem' }}>
              About the Hostel
            </div>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.75rem)', color: 'var(--primary)', lineHeight: 1.2, marginBottom: '1.25rem' }}>
              Designed for students. <br />
              Managed for simplicity.
            </h2>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: 1.65, marginBottom: '1.75rem' }}>
              Our college residence facilities combine modern academic amenities with disciplined institutional management. Centralized digital allocation ensures room bookings remain transparent, democratic, and error-free.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <CheckCircle2 size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--primary)' }}>Safe Accommodation</div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>CCTV and dedicated warden staff</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <CheckCircle2 size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--primary)' }}>Organized Allocation</div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Automated queue priority</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <CheckCircle2 size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--primary)' }}>Transparent Vacancy</div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Real-time bed counts</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <CheckCircle2 size={18} color="var(--success)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--primary)' }}>Digital Reservation</div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>Instant bed confirmation</div>
                </div>
              </div>
            </div>

            <a href="#availability" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--primary)',
              fontWeight: '600',
              fontSize: '0.9rem',
              borderBottom: '2px solid var(--accent)',
              paddingBottom: '2px'
            }}>
              Learn about our accommodation options <ChevronRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 5 — ROOM TYPES */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 3vw, 2rem)', backgroundColor: '#FFFFFF', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto clamp(2rem, 4vw, 3.5rem)' }}>
            <div className="inst-badge" style={{ marginBottom: '0.75rem' }}>
              Accommodation Options
            </div>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.6rem)', color: 'var(--primary)' }}>
              Find the room that suits you
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
              Whether you prefer climate-controlled comfort or practical shared community living, our hostel caters to all student requirements.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: '1.75rem',
          }}>
            {/* AC Rooms */}
            <div className="panel-card panel-card-lift" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={campusImages.roomAc}
                  alt="AC Hostel Room"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span className="status-pill ac" style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  Climate Controlled
                </span>
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '0.4rem' }}>AC Rooms</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    Comfortable rooms with climate-controlled accommodation, study desks, and premium ergonomic setups.
                  </p>
                </div>
                <Link to="/login?role=student" className="btn-secondary" style={{ width: '100%', justifyContent: 'space-between' }}>
                  <span>View AC Rooms</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Non-AC Rooms */}
            <div className="panel-card panel-card-lift" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={campusImages.roomNonAc}
                  alt="Non-AC Hostel Room"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span className="status-pill non-ac" style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  Natural Ventilation
                </span>
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '0.4rem' }}>Non-AC Rooms</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    Practical and comfortable student accommodation with natural ventilation and airy garden balconies.
                  </p>
                </div>
                <Link to="/login?role=student" className="btn-secondary" style={{ width: '100%', justifyContent: 'space-between' }}>
                  <span>View Rooms</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Shared Rooms */}
            <div className="panel-card panel-card-lift" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                <img
                  src={campusImages.roomShared}
                  alt="Shared Hostel Room"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span className="status-pill available" style={{ position: 'absolute', top: '12px', right: '12px' }}>
                  Shared Community
                </span>
              </div>
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '0.4rem' }}>Shared Rooms</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                    Well-organized shared accommodation for students fostering peer camaraderie and collaborative study.
                  </p>
                </div>
                <Link to="/login?role=student" className="btn-secondary" style={{ width: '100%', justifyContent: 'space-between' }}>
                  <span>Explore Rooms</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — LIVE ROOM AVAILABILITY */}
      <section id="availability" style={{ padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 3vw, 2rem)', backgroundColor: 'var(--bg-main)', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="inst-badge" style={{ marginBottom: '0.65rem' }}>
                <span className="live-indicator" /> Live Campus Database
              </div>
              <h2 className="font-serif" style={{ fontSize: 'clamp(1.85rem, 3vw, 2.5rem)', color: 'var(--primary)' }}>
                Rooms available right now
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
                Check current vacancies before choosing your accommodation.
              </p>
            </div>

            <Link to="/login?role=student" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--primary)',
              fontWeight: '600',
              fontSize: '0.9rem',
            }}>
              View all rooms →
            </Link>
          </div>

          {loadingRooms ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '1.5rem' }}>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : liveRooms.length === 0 ? (
            <div className="panel-card" style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '1rem', marginBottom: '1rem' }}>
                All rooms are currently at capacity.
              </div>
              <Link to="/login?role=student" className="btn-primary">
                Login to check waiting list
              </Link>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
              gap: '1.5rem'
            }}>
              {liveRooms.map((room) => (
                <div key={room._id} className="panel-card panel-card-lift" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                          Floor {room.floor}
                        </div>
                        <h3 style={{ fontSize: '1.45rem', fontWeight: '700', color: 'var(--primary)' }}>
                          Room {room.roomNumber}
                        </h3>
                      </div>
                      <span className={`status-pill ${room.roomType === 'AC' ? 'ac' : 'non-ac'}`}>
                        {room.roomType}
                      </span>
                    </div>

                    <div style={{
                      backgroundColor: 'var(--bg-main)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.9rem',
                      marginBottom: '1.25rem',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.85rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Bed Capacity:</span>
                        <span style={{ fontWeight: '600' }}>{room.totalBeds} Beds</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Available Now:</span>
                        <span style={{ fontWeight: '700', color: 'var(--success)' }}>
                          {room.availableBeds} {room.availableBeds === 1 ? 'bed' : 'beds'}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Occupancy:</span>
                        <OccupancyDots totalBeds={room.totalBeds} occupiedBeds={room.occupiedBeds} />
                      </div>
                    </div>
                  </div>

                  <Link to="/login?role=student" className="btn-primary" style={{ width: '100%', fontSize: '0.85rem', padding: '0.65rem 1rem' }}>
                    View & Reserve Bed
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SECTION 7 — HOW IT WORKS */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 3vw, 2rem)', backgroundColor: '#FFFFFF', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(2rem, 4vw, 3.5rem)' }}>
            <div className="inst-badge" style={{ marginBottom: '0.75rem' }}>
              Streamlined Process
            </div>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.6rem)', color: 'var(--primary)' }}>
              How room allocation works
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.4rem' }}>
              Three straightforward steps to secure your college residence for the academic term.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
            gap: '2.5rem',
          }}>
            {/* Step 1 */}
            <div>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2.75rem, 5vw, 3.5rem)',
                color: 'var(--border-strong)',
                lineHeight: 1,
                marginBottom: '0.75rem',
                fontWeight: '700'
              }}>
                01
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                Sign In or Register
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Create your verified student profile using your Student Enrollment ID and academic department.
              </p>
            </div>

            {/* Step 2 */}
            <div>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2.75rem, 5vw, 3.5rem)',
                color: 'var(--border-strong)',
                lineHeight: 1,
                marginBottom: '0.75rem',
                fontWeight: '700'
              }}>
                02
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                Choose a Room
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Browse live floor plans, compare AC or Non-AC rooms, and inspect vacant beds in real time.
              </p>
            </div>

            {/* Step 3 */}
            <div>
              <div style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2.75rem, 5vw, 3.5rem)',
                color: 'var(--accent)',
                lineHeight: 1,
                marginBottom: '0.75rem',
                fontWeight: '700'
              }}>
                03
              </div>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                Reserve Your Bed
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Confirm booking with a single click. The bed is atomically secured and registered on your student pass.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8 — HOSTEL FACILITIES */}
      <section id="facilities" style={{ padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 3vw, 2rem)', backgroundColor: 'var(--bg-main)', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ maxWidth: '600px', marginBottom: '2.5rem' }}>
            <div className="inst-badge" style={{ marginBottom: '0.75rem' }}>
              Campus Living Amenities
            </div>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.6rem)', color: 'var(--primary)' }}>
              Facilities built for student life
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
              Essential services and comfortable spaces designed to support academic excellence and peace of mind.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
            gap: '1.25rem',
          }}>
            <div className="panel-card" style={{ padding: '1.5rem' }}>
              <Wifi size={24} color="var(--primary)" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '0.35rem' }}>High-Speed Wi-Fi</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Seamless campus-wide broadband coverage in all residential blocks and study carrels.
              </p>
            </div>

            <div className="panel-card" style={{ padding: '1.5rem', backgroundColor: '#FAFBF9' }}>
              <ShieldAlert size={24} color="var(--primary)" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '0.35rem' }}>24/7 Campus Security</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Access-controlled entry, turnstile checkpoints, and round-the-clock security personnel.
              </p>
            </div>

            <div className="panel-card" style={{ padding: '1.5rem' }}>
              <BookOpen size={24} color="var(--primary)" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '0.35rem' }}>Quiet Study Areas</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Dedicated silent study rooms on each floor, equipped with charging sockets and reading lamps.
              </p>
            </div>

            <div className="panel-card" style={{ padding: '1.5rem' }}>
              <Coffee size={24} color="var(--primary)" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '0.35rem' }}>Common Recreation Room</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Indoor games, satellite TV, student periodicals, and collaborative project space.
              </p>
            </div>

            <div className="panel-card" style={{ padding: '1.5rem' }}>
              <Sparkles size={24} color="var(--primary)" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '0.35rem' }}>Clean Washrooms</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Daily sanitized sanitary blocks with solar water heaters and continuous maintenance.
              </p>
            </div>

            <div className="panel-card" style={{ padding: '1.5rem' }}>
              <Zap size={24} color="var(--primary)" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '0.35rem' }}>100% Power Backup</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Automatic diesel generators ensure uninterrupted power for fans, lighting, and Wi-Fi.
              </p>
            </div>

            <div className="panel-card" style={{ padding: '1.5rem' }}>
              <Droplets size={24} color="var(--primary)" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '0.35rem' }}>RO Drinking Water</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Reverse Osmosis filtration stations with chilled and normal dispensing on every level.
              </p>
            </div>

            <div className="panel-card" style={{ padding: '1.5rem' }}>
              <Shirt size={24} color="var(--primary)" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '0.35rem' }}>Laundry Facilities</h3>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Automated commercial washing machines and open-air covered drying terraces.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9 — CAMPUS / HOSTEL GALLERY */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 3vw, 2rem)', backgroundColor: '#FFFFFF', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <div className="inst-badge" style={{ marginBottom: '0.75rem' }}>
              Visual Tour
            </div>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.6rem)', color: 'var(--primary)' }}>
              Campus life & residences
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Click any photo to explore our student living spaces in high definition.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
            gap: '1.25rem',
          }}>
            {campusImages.gallery.map((photo, index) => (
              <div
                key={index}
                onClick={() => setActivePhoto(photo)}
                style={{
                  height: photo.size === 'large' ? '280px' : '220px',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'pointer',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-subtle)'
                }}
              >
                <img
                  src={photo.src}
                  alt={photo.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(22, 35, 46, 0.8) 0%, transparent 60%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '1.25rem',
                  color: '#FFFFFF'
                }}>
                  <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{photo.title}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>{photo.subtitle}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {activePhoto && (
        <div className="lightbox-overlay" onClick={() => setActivePhoto(null)}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img src={activePhoto.src} alt={activePhoto.title} className="lightbox-img" />
            <div style={{ color: '#FFFFFF', marginTop: '1rem', textAlign: 'center' }}>
              <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{activePhoto.title}</div>
              <div style={{ fontSize: '0.85rem', opacity: 0.75, marginTop: '2px' }}>{activePhoto.subtitle}</div>
            </div>
            <button
              onClick={() => setActivePhoto(null)}
              className="btn-secondary"
              style={{ marginTop: '1.25rem', fontSize: '0.825rem', padding: '0.5rem 1.5rem' }}
            >
              Close Preview
            </button>
          </div>
        </div>
      )}

      {/* SECTION 10 — STUDENT EXPERIENCE / TESTIMONIALS */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 3vw, 2rem)', backgroundColor: 'var(--bg-main)', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div className="inst-badge" style={{ marginBottom: '1rem' }}>
            Student Experiences
          </div>
          <blockquote className="font-serif" style={{
            fontSize: 'clamp(1.2rem, 2.5vw, 1.85rem)',
            color: 'var(--primary)',
            lineHeight: 1.45,
            fontStyle: 'italic',
            marginBottom: '1.5rem',
          }}>
            "Finding a room used to mean visiting the hostel office and waiting in lines. With the centralized portal, I was able to inspect available beds, check room types, and reserve my accommodation within minutes."
          </blockquote>
          <div>
            <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--primary)' }}>
              Rahul Verma
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              B.Tech Computer Science • Resident, Room 101
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 11 — CALL TO ACTION */}
      <section style={{ padding: 'clamp(3rem, 6vw, 5rem) clamp(1rem, 3vw, 2rem)', backgroundColor: 'var(--primary)' }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          textAlign: 'center',
          color: '#FFFFFF'
        }}>
          <h2 className="font-serif" style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            color: '#FFFFFF',
            lineHeight: 1.2,
            marginBottom: '1rem',
            fontWeight: '400',
          }}>
            Ready to find your room?
          </h2>
          <p style={{
            fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
            color: '#CBD7E2',
            maxWidth: '560px',
            margin: '0 auto 2.25rem',
            lineHeight: 1.6
          }}>
            Check current vacancies and complete your hostel allocation online before term allotments close.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <a href="#availability" className="btn-gold" style={{ padding: '0.8rem 1.75rem', fontSize: '0.925rem', flex: '1 1 auto', minWidth: '180px' }}>
              Explore Available Rooms
            </a>
            <Link to="/login?role=student" className="btn-secondary" style={{ padding: '0.8rem 1.75rem', fontSize: '0.925rem', flex: '1 1 auto', minWidth: '180px' }}>
              Student Login
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 12 — FOOTER */}
      <footer id="footer" style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--border-color)',
        padding: 'clamp(3rem, 5vw, 4.5rem) clamp(1rem, 3vw, 2rem) 2rem',
        color: 'var(--text-main)',
        fontSize: '0.875rem'
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{
                width: '36px',
                height: '36px',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800'
              }}>
                H
              </div>
              <div style={{ fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Hostel Portal
              </div>
            </div>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.825rem', marginBottom: '1.25rem' }}>
              Official residential hall allocation and occupancy governance platform for undergraduate and postgraduate students.
            </p>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Directorate of Campus Residences <br />
              College Campus, North Block
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <div style={{ fontWeight: '700', color: 'var(--primary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Quick Navigation
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <a href="#hero" style={{ color: 'var(--text-muted)' }}>Home</a>
              <a href="#availability" style={{ color: 'var(--text-muted)' }}>Room Availability</a>
              <a href="#facilities" style={{ color: 'var(--text-muted)' }}>Hostel Facilities</a>
              <a href="#about" style={{ color: 'var(--text-muted)' }}>About the Hostel</a>
              <Link to="/login" style={{ color: 'var(--text-muted)' }}>Portal Login</Link>
            </div>
          </div>

          {/* Student */}
          <div>
            <div style={{ fontWeight: '700', color: 'var(--primary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Student Services
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <Link to="/login?role=student" style={{ color: 'var(--text-muted)' }}>Student Login</Link>
              <Link to="/register?role=student" style={{ color: 'var(--text-muted)' }}>New Student Registration</Link>
              <Link to="/student/dashboard" style={{ color: 'var(--text-muted)' }}>My Room Allocation</Link>
              <a href="#availability" style={{ color: 'var(--text-muted)' }}>Live Bed Vacancies</a>
            </div>
          </div>

          {/* Warden */}
          <div>
            <div style={{ fontWeight: '700', color: 'var(--primary)', marginBottom: '1rem', fontSize: '0.9rem' }}>
              Hostel Governance
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <Link to="/login?role=warden" style={{ color: 'var(--text-muted)' }}>Chief Warden Login</Link>
              <Link to="/login?role=warden" style={{ color: 'var(--text-muted)' }}>Room Inventory Management</Link>
              <Link to="/login?role=warden" style={{ color: 'var(--text-muted)' }}>Occupancy Ledger</Link>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                Emergency Warden Helpline: <br />
                <b>+91 (0) 1234-567890</b>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-footer */}
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          color: 'var(--text-light)',
          fontSize: '0.8rem'
        }}>
          <div>
            © 2026 College Hostel Management Portal. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            <span>Privacy Policy</span>
            <span>Terms of Residence</span>
            <span>Institutional Security</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
