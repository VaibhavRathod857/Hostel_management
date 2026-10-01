import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Building2,
  Search,
  Filter,
  Bed,
  Check,
  AlertCircle,
  Calendar,
  ShieldCheck,
  LogOut,
  BedDouble,
  BookOpen,
  Info,
  HelpCircle,
  User,
  CheckCircle2,
  ArrowRight,
  Layers,
  ChevronRight,
  Sparkles,
  MapPin,
  Clock,
  Phone,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { campusImages } from '../../assets/campusImages';
import OccupancyDots from '../../components/OccupancyDots';
import { SkeletonCard } from '../../components/SkeletonLoader';
import { parseApiResponse } from '../../config/api';

const StudentDashboard = () => {
  const { user, token, API_BASE, buildApiUrl, logout } = useAuth();

  // Navigation tab
  const [activeTab, setActiveTab] = useState('findRoom');

  // Allocation status
  const [allocation, setAllocation] = useState(null);
  const [hasAllocation, setHasAllocation] = useState(false);
  const [loadingAlloc, setLoadingAlloc] = useState(true);

  // Available Rooms Discovery State
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [search, setSearch] = useState('');
  const [floor, setFloor] = useState('');
  const [roomType, setRoomType] = useState('');
  const [sortBy, setSortBy] = useState('available');

  // Mobile filters toggle
  const [mobileFiltersExpanded, setMobileFiltersExpanded] = useState(false);

  // Interactive Modals
  const [inspectingRoom, setInspectingRoom] = useState(null);
  const [confirmingRoom, setConfirmingRoom] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Lock scroll when modal is open
  useEffect(() => {
    if (inspectingRoom || confirmingRoom) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [inspectingRoom, confirmingRoom]);

  // 1. Fetch Student Allocation Status
  const fetchMyAllocation = async () => {
    setLoadingAlloc(true);
    try {
      const res = await fetch(buildApiUrl('/api/allocations/my'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await parseApiResponse(res);
      if (data && data.success && data.hasAllocation) {
        setHasAllocation(true);
        setAllocation(data.allocation);
        setActiveTab('myAllocation');
      } else {
        setHasAllocation(false);
        setAllocation(null);
        setActiveTab('findRoom');
      }
    } catch (err) {
      console.error('Failed to fetch allocation:', err);
    } finally {
      setLoadingAlloc(false);
    }
  };

  // 2. Fetch Available Rooms from MongoDB
  const fetchAvailableRooms = async () => {
    setLoadingRooms(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (floor !== '') params.append('floor', floor);
      if (roomType) params.append('roomType', roomType);

      const res = await fetch(buildApiUrl(`/api/rooms/available?${params.toString()}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await parseApiResponse(res);
      if (data && data.success) {
        let fetched = data.rooms || [];
        if (sortBy === 'available') {
          fetched.sort((a, b) => b.availableBeds - a.availableBeds);
        } else if (sortBy === 'floor') {
          fetched.sort((a, b) => a.floor - b.floor);
        } else if (sortBy === 'roomNumber') {
          fetched.sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
        }
        setRooms(fetched);
      }
    } catch (err) {
      console.error('Error fetching available rooms:', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchMyAllocation();
    }
  }, [token]);

  useEffect(() => {
    if (!hasAllocation && !loadingAlloc) {
      fetchAvailableRooms();
    }
  }, [hasAllocation, loadingAlloc, search, floor, roomType, sortBy]);

  // Handle Bed Booking Confirmation
  const handleExecuteBooking = async () => {
    if (!confirmingRoom) return;
    setBookingLoading(true);
    setBookingError('');

    try {
      const res = await fetch(buildApiUrl(`/api/allocations/book/${confirmingRoom._id}`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await parseApiResponse(res);

      setConfirmingRoom(null);
      setInspectingRoom(null);
      showToast(`Congratulations! Bed reserved in Room ${confirmingRoom.roomNumber}.`);
      fetchMyAllocation();
    } catch (err) {
      setBookingError(err.message || 'An error occurred during booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const getRoomImage = (type) => {
    return type === 'AC' ? campusImages.roomAc : campusImages.roomNonAc;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)', width: '100%', overflowX: 'hidden' }}>
      
      {/* Toast Notice */}
      {toastMessage && (
        <div className="toast-notice">
          <Check size={18} color="var(--accent)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* STUDENT TOP HEADER */}
      <header style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-color)',
        padding: '0.85rem clamp(1rem, 3vw, 2rem)',
        boxShadow: 'var(--shadow-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        width: '100%'
      }}>
        <div style={{
          maxWidth: '1240px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {/* Logo Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '1rem',
              flexShrink: 0
            }}>
              H
            </div>
            <div>
              <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Hostel Portal
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                Student Residential Services
              </div>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hide-tablet-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              onClick={() => setActiveTab('findRoom')}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.85rem',
                fontWeight: activeTab === 'findRoom' ? '600' : '500',
                color: activeTab === 'findRoom' ? 'var(--primary)' : 'var(--text-muted)',
                backgroundColor: activeTab === 'findRoom' ? 'var(--primary-light)' : 'transparent',
                borderRadius: 'var(--radius-sm)',
                minHeight: '38px'
              }}
            >
              {hasAllocation ? 'Browse Rooms' : 'Find a Room'}
            </button>

            <button
              onClick={() => setActiveTab('myAllocation')}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.85rem',
                fontWeight: activeTab === 'myAllocation' ? '600' : '500',
                color: activeTab === 'myAllocation' ? 'var(--primary)' : 'var(--text-muted)',
                backgroundColor: activeTab === 'myAllocation' ? 'var(--primary-light)' : 'transparent',
                borderRadius: 'var(--radius-sm)',
                minHeight: '38px'
              }}
            >
              My Allocation {hasAllocation && '✓'}
            </button>

            <button
              onClick={() => setActiveTab('info')}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.85rem',
                fontWeight: activeTab === 'info' ? '600' : '500',
                color: activeTab === 'info' ? 'var(--primary)' : 'var(--text-muted)',
                backgroundColor: activeTab === 'info' ? 'var(--primary-light)' : 'transparent',
                borderRadius: 'var(--radius-sm)',
                minHeight: '38px'
              }}
            >
              Hostel Info
            </button>

            <button
              onClick={() => setActiveTab('help')}
              style={{
                padding: '0.45rem 0.85rem',
                fontSize: '0.85rem',
                fontWeight: activeTab === 'help' ? '600' : '500',
                color: activeTab === 'help' ? 'var(--primary)' : 'var(--text-muted)',
                backgroundColor: activeTab === 'help' ? 'var(--primary-light)' : 'transparent',
                borderRadius: 'var(--radius-sm)',
                minHeight: '38px'
              }}
            >
              Support Desk
            </button>
          </div>

          {/* Student Profile & Signout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--primary)' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                ID: {user?.studentId || 'Enrolled'}
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout session"
              className="btn-secondary"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.775rem', minHeight: '38px' }}
            >
              <LogOut size={14} /> <span className="hide-on-mobile">Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar (< 1024px) */}
        <div className="show-tablet-mobile hide-on-desktop" style={{
          marginTop: '0.75rem',
          display: 'flex',
          overflowX: 'auto',
          gap: '0.5rem',
          paddingBottom: '4px',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.65rem'
        }}>
          <button
            onClick={() => setActiveTab('findRoom')}
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: activeTab === 'findRoom' ? '700' : '500',
              color: activeTab === 'findRoom' ? 'var(--primary)' : 'var(--text-muted)',
              backgroundColor: activeTab === 'findRoom' ? 'var(--primary-light)' : 'transparent',
              borderRadius: 'var(--radius-full)',
              whiteSpace: 'nowrap',
              minHeight: '36px'
            }}
          >
            {hasAllocation ? 'Browse Rooms' : 'Find a Room'}
          </button>

          <button
            onClick={() => setActiveTab('myAllocation')}
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: activeTab === 'myAllocation' ? '700' : '500',
              color: activeTab === 'myAllocation' ? 'var(--primary)' : 'var(--text-muted)',
              backgroundColor: activeTab === 'myAllocation' ? 'var(--primary-light)' : 'transparent',
              borderRadius: 'var(--radius-full)',
              whiteSpace: 'nowrap',
              minHeight: '36px'
            }}
          >
            My Allocation {hasAllocation && '✓'}
          </button>

          <button
            onClick={() => setActiveTab('info')}
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: activeTab === 'info' ? '700' : '500',
              color: activeTab === 'info' ? 'var(--primary)' : 'var(--text-muted)',
              backgroundColor: activeTab === 'info' ? 'var(--primary-light)' : 'transparent',
              borderRadius: 'var(--radius-full)',
              whiteSpace: 'nowrap',
              minHeight: '36px'
            }}
          >
            Hostel Info
          </button>

          <button
            onClick={() => setActiveTab('help')}
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: activeTab === 'help' ? '700' : '500',
              color: activeTab === 'help' ? 'var(--primary)' : 'var(--text-muted)',
              backgroundColor: activeTab === 'help' ? 'var(--primary-light)' : 'transparent',
              borderRadius: 'var(--radius-full)',
              whiteSpace: 'nowrap',
              minHeight: '36px'
            }}
          >
            Support
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ flex: 1, maxWidth: '1240px', width: '100%', margin: '0 auto', padding: 'clamp(1.25rem, 3vw, 2.5rem) clamp(1rem, 3vw, 1.5rem)' }}>
        
        {/* STUDENT GREETING & STATUS BANNER */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
          padding: 'clamp(1.25rem, 3vw, 2rem)',
          boxShadow: 'var(--shadow-subtle)',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          borderLeft: hasAllocation ? '5px solid var(--success)' : '5px solid var(--primary)',
          width: '100%'
        }}>
          <div>
            <div className="inst-badge" style={{ marginBottom: '0.5rem' }}>
              {hasAllocation ? 'Verified Campus Resident' : 'Student Housing Intake'}
            </div>
            <h2 className="font-serif" style={{ fontSize: 'clamp(1.4rem, 3vw, 2.1rem)', color: 'var(--primary)', fontWeight: '400' }}>
              Good morning, {user?.name ? user.name.split(' ')[0] : 'Student'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {hasAllocation
                ? `You're all set! You are assigned to Room ${allocation?.room?.roomNumber}, Floor ${allocation?.room?.floor}.`
                : 'Your room is waiting. Browse available campus rooms below and secure your bed.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', width: '100%', maxWidth: '280px' }}>
            {hasAllocation ? (
              <button
                onClick={() => setActiveTab('myAllocation')}
                className="btn-primary"
                style={{ fontSize: '0.85rem', width: '100%' }}
              >
                View My Allocation <ChevronRight size={15} />
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('findRoom')}
                className="btn-primary"
                style={{ fontSize: '0.85rem', width: '100%' }}
              >
                Explore Rooms <ChevronRight size={15} />
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: FIND A ROOM */}
        {activeTab === 'findRoom' && (
          <div>
            {hasAllocation && (
              <div style={{
                backgroundColor: 'var(--success-bg)',
                border: '1px solid var(--success-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.85rem 1.25rem',
                marginBottom: '1.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <CheckCircle2 size={18} color="var(--success)" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--success)', fontWeight: '600' }}>
                    Active allocation in Room {allocation?.room?.roomNumber}. Single room policy active.
                  </span>
                </div>
                <button onClick={() => setActiveTab('myAllocation')} style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--success)', minHeight: '38px', padding: '0 0.5rem' }}>
                  View Pass →
                </button>
              </div>
            )}

            {/* Title & Responsive Filters Bar */}
            <div className="panel-card" style={{ padding: 'clamp(1rem, 3vw, 1.5rem)', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1 1 200px' }}>
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                  <input
                    type="text"
                    placeholder="Search room number..."
                    className="form-input"
                    style={{ paddingLeft: '2.1rem' }}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {/* Mobile Filter Toggle */}
                <button
                  onClick={() => setMobileFiltersExpanded(!mobileFiltersExpanded)}
                  className="btn-secondary show-tablet-mobile hide-on-desktop"
                  style={{ minHeight: '44px', padding: '0 0.85rem', fontSize: '0.85rem' }}
                >
                  <SlidersHorizontal size={15} /> Filters {floor || roomType ? '●' : ''}
                </button>
              </div>

              {/* Collapsible Filter Row on Mobile, Always visible on Desktop */}
              <div style={{
                display: mobileFiltersExpanded ? 'grid' : 'none',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
                gap: '0.85rem',
                alignItems: 'flex-end',
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--border-subtle)'
              }}
              className="filter-grid-expanded"
              >
                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Floor</label>
                  <select className="form-select" value={floor} onChange={(e) => setFloor(e.target.value)}>
                    <option value="">All Floors</option>
                    <option value="1">Floor 1</option>
                    <option value="2">Floor 2</option>
                    <option value="3">Floor 3</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Room Type</label>
                  <select className="form-select" value={roomType} onChange={(e) => setRoomType(e.target.value)}>
                    <option value="">All Types</option>
                    <option value="AC">AC</option>
                    <option value="Non-AC">Non-AC</option>
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ fontSize: '0.75rem' }}>Sort By</label>
                  <select className="form-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="available">Most Beds Free</option>
                    <option value="floor">Floor</option>
                    <option value="roomNumber">Room Number</option>
                  </select>
                </div>

                <div>
                  <button
                    onClick={() => { setSearch(''); setFloor(''); setRoomType(''); setSortBy('available'); }}
                    className="btn-secondary"
                    style={{ width: '100%', minHeight: '44px' }}
                  >
                    Reset
                  </button>
                </div>
              </div>

              <style>{`
                @media (min-width: 1024px) {
                  .filter-grid-expanded {
                    display: grid !important;
                  }
                }
              `}</style>
            </div>

            {/* Room Discovery Grid (1-Col on Mobile, 2-Col on Tablet, 3-Col on Desktop) */}
            {loadingRooms ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem' }}>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : rooms.length === 0 ? (
              <div className="panel-card" style={{ padding: '3.5rem', textAlign: 'center' }}>
                <Bed size={40} color="var(--text-light)" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                  No available rooms match your criteria
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Try resetting your floor or room type filter to discover other vacant rooms.
                </p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                gap: '1.5rem',
              }}>
                {rooms.map((room) => (
                  <div
                    key={room._id}
                    className="panel-card panel-card-lift"
                    style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                  >
                    <div>
                      {/* Photo Thumbnail */}
                      <div style={{ height: '170px', position: 'relative', overflow: 'hidden' }}>
                        <img
                          src={getRoomImage(room.roomType)}
                          alt={`Room ${room.roomNumber}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <span className={`status-pill ${room.roomType === 'AC' ? 'ac' : 'non-ac'}`} style={{ position: 'absolute', top: '12px', right: '12px' }}>
                          {room.roomType}
                        </span>
                        <div style={{ position: 'absolute', bottom: '10px', left: '12px', color: '#FFFFFF', textShadow: '0 1px 3px rgba(0,0,0,0.8)', fontWeight: '700', fontSize: '1.15rem' }}>
                          Room {room.roomNumber}
                        </div>
                      </div>

                      {/* Content Specs */}
                      <div style={{ padding: '1.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                            Floor {room.floor}
                          </span>
                          <span className="status-pill available">
                            {room.availableBeds} beds available
                          </span>
                        </div>

                        <div style={{
                          backgroundColor: 'var(--bg-main)',
                          padding: '0.85rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          fontSize: '0.825rem',
                          marginBottom: '1rem'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Bed Capacity:</span>
                            <span style={{ fontWeight: '600' }}>{room.totalBeds} Beds</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Occupancy Status:</span>
                            <OccupancyDots totalBeds={room.totalBeds} occupiedBeds={room.occupiedBeds} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ padding: '0 1.25rem 1.25rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => setInspectingRoom(room)}
                        className="btn-secondary"
                        style={{ flex: '1 1 90px', fontSize: '0.825rem', minHeight: '44px' }}
                      >
                        Details
                      </button>
                      
                      <button
                        onClick={() => {
                          if (hasAllocation) {
                            alert('You already have a hostel room allocation. Multiple allocations are prohibited.');
                            return;
                          }
                          setConfirmingRoom(room);
                        }}
                        disabled={hasAllocation || room.availableBeds <= 0}
                        className="btn-primary"
                        style={{ flex: '1 1 120px', fontSize: '0.825rem', minHeight: '44px' }}
                      >
                        <Bed size={15} /> Book Bed
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MY ALLOCATION (Official Pass) */}
        {activeTab === 'myAllocation' && (
          <div style={{ maxWidth: '720px', margin: '0 auto', width: '100%' }}>
            {hasAllocation && allocation ? (
              <div className="panel-card" style={{ padding: 'clamp(1.5rem, 4vw, 2.5rem)', borderTop: '5px solid var(--accent)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div className="inst-badge" style={{ marginBottom: '0.4rem' }}>
                      Campus Residential Pass
                    </div>
                    <h3 className="font-serif" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2rem)', color: 'var(--primary)', fontWeight: '400' }}>
                      Your Hostel Allocation
                    </h3>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                      Valid for Academic Session 2026-2027
                    </p>
                  </div>

                  <span className="status-pill available" style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}>
                    <CheckCircle2 size={14} /> Active Allocation
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                  gap: '1.5rem',
                  marginBottom: '1.75rem'
                }}>
                  <div>
                    <div style={{ fontSize: '0.725rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Room Number
                    </div>
                    <div className="font-serif" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.25rem)', color: 'var(--primary)', marginTop: '0.2rem' }}>
                      Room {allocation.room?.roomNumber}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.725rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Floor
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--primary)', marginTop: '0.2rem' }}>
                      Floor {allocation.room?.floor}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.725rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Room Type
                    </div>
                    <div style={{ marginTop: '0.3rem' }}>
                      <span className={`status-pill ${allocation.room?.roomType === 'AC' ? 'ac' : 'non-ac'}`}>
                        {allocation.room?.roomType}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.725rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Capacity / Occupancy
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
                      <OccupancyDots totalBeds={allocation.room?.totalBeds} occupiedBeds={allocation.room?.occupiedBeds} />
                      <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>
                        {allocation.room?.occupiedBeds}/{allocation.room?.totalBeds} Beds
                      </span>
                    </div>
                  </div>

                  <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
                    <div style={{ fontSize: '0.725rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Allotment Date
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                      <Calendar size={16} /> {formatDate(allocation.allocationDate)}
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '1.15rem',
                  backgroundColor: 'var(--bg-main)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.825rem',
                  color: 'var(--text-secondary)'
                }}>
                  <div style={{ fontWeight: '700', color: 'var(--primary)', marginBottom: '0.35rem' }}>
                    Physical Key Collection Instructions:
                  </div>
                  Please bring your printed Student ID Card to the Warden Administration Desk (Ground Floor, Room G-02) between 9:00 AM - 5:00 PM to receive your room keys.
                </div>
              </div>
            ) : (
              <div className="panel-card" style={{ padding: 'clamp(2rem, 5vw, 3.5rem)', textAlign: 'center' }}>
                <BedDouble size={44} color="var(--text-light)" style={{ margin: '0 auto 1.25rem' }} />
                <h3 className="font-serif" style={{ fontSize: 'clamp(1.4rem, 3vw, 1.75rem)', color: 'var(--primary)', marginBottom: '0.5rem', fontWeight: '400' }}>
                  No active room allocation
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.75rem', maxWidth: '440px', margin: '0 auto 1.75rem' }}>
                  You do not currently have a registered hostel bed. Browse available campus rooms to secure your allotment.
                </p>
                <button onClick={() => setActiveTab('findRoom')} className="btn-primary" style={{ width: '100%', maxWidth: '240px' }}>
                  Browse Available Rooms <ArrowRight size={16} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: HOSTEL INFO */}
        {activeTab === 'info' && (
          <div style={{ maxWidth: '850px', margin: '0 auto', width: '100%' }}>
            <div className="panel-card" style={{ padding: 'clamp(1.5rem, 4vw, 2rem)' }}>
              <h3 className="font-serif" style={{ fontSize: 'clamp(1.4rem, 3vw, 1.65rem)', color: 'var(--primary)', fontWeight: '400', marginBottom: '0.5rem' }}>
                Hostel Residential Guidelines & Timings
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.75rem' }}>
                Essential timings, mess schedules, and residential codes of conduct
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: 'var(--primary)', fontSize: '0.875rem' }}>
                    <Clock size={16} /> Main Gate Curfew
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Entry gates close strictly at <b>9:30 PM</b>. Late entry requires written permission from the Chief Warden.
                  </div>
                </div>

                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700', color: 'var(--primary)', fontSize: '0.875rem' }}>
                    <Clock size={16} /> Dining Hall Hours
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Breakfast: 7:30 - 9:30 AM <br />
                    Lunch: 12:30 - 2:30 PM <br />
                    Dinner: 7:30 - 9:30 PM
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.825rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                <b>One Student = One Bed Policy:</b> Room allocations are non-transferable. Subletting or trading beds will result in immediate cancellation of residency privileges.
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HELP & SUPPORT */}
        {activeTab === 'help' && (
          <div style={{ maxWidth: '850px', margin: '0 auto', width: '100%' }}>
            <div className="panel-card" style={{ padding: 'clamp(1.5rem, 4vw, 2rem)' }}>
              <h3 className="font-serif" style={{ fontSize: 'clamp(1.4rem, 3vw, 1.65rem)', color: 'var(--primary)', fontWeight: '400', marginBottom: '0.5rem' }}>
                Hostel Administration & Emergency Contacts
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '2rem' }}>
                Reach out to campus residential staff for maintenance, health, or administrative inquiries
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '1.25rem' }}>
                <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: '700', color: 'var(--primary)' }}>Chief Warden Office</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Ground Floor, Room G-02 <br />
                    Email: <b>warden@hostel.edu</b> <br />
                    Tel: +91 (0) 1234-567890
                  </div>
                </div>

                <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: '700', color: 'var(--primary)' }}>Campus Medical Health Unit</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    24/7 Residential Nurse & Doctor <br />
                    Ambulance Hotline: 108 / 112 <br />
                    Ext: 4402
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL 1: ROOM DETAILS MODAL (Responsive Bottom Sheet on Mobile) */}
      {inspectingRoom && (
        <div className="modal-overlay" onClick={() => setInspectingRoom(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div>
                <h3 className="font-serif" style={{ fontSize: '1.5rem', color: 'var(--primary)', fontWeight: '400' }}>
                  Room {inspectingRoom.roomNumber}
                </h3>
                <span className={`status-pill ${inspectingRoom.roomType === 'AC' ? 'ac' : 'non-ac'}`} style={{ marginTop: '4px' }}>
                  {inspectingRoom.roomType}
                </span>
              </div>
              <button
                onClick={() => setInspectingRoom(null)}
                style={{ padding: '0.35rem', color: 'var(--text-muted)', minHeight: '44px', minWidth: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ height: 'clamp(140px, 30vw, 180px)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '1.25rem' }}>
              <img
                src={getRoomImage(inspectingRoom.roomType)}
                alt="Room View"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Floor Location:</span>
                <b>Floor {inspectingRoom.floor}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Total Bed Sanction:</span>
                <b>{inspectingRoom.totalBeds} Beds</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Occupied:</span>
                <b>{inspectingRoom.occupiedBeds} Beds</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Available Right Now:</span>
                <b style={{ color: 'var(--success)' }}>{inspectingRoom.availableBeds} remaining</b>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                onClick={() => setInspectingRoom(null)}
                className="btn-secondary"
                style={{ flex: '1 1 120px' }}
              >
                Back to Listing
              </button>
              <button
                onClick={() => {
                  if (hasAllocation) {
                    alert('You already have a hostel room allocation.');
                    return;
                  }
                  setConfirmingRoom(inspectingRoom);
                  setInspectingRoom(null);
                }}
                disabled={hasAllocation || inspectingRoom.availableBeds <= 0}
                className="btn-primary"
                style={{ flex: '1 1 160px' }}
              >
                Proceed to Reserve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CUSTOM BOOKING CONFIRMATION MODAL */}
      {confirmingRoom && (
        <div className="modal-overlay" onClick={() => !bookingLoading && setConfirmingRoom(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem'
              }}>
                <BedDouble size={26} />
              </div>
              <h3 className="font-serif" style={{ fontSize: 'clamp(1.4rem, 3vw, 1.65rem)', color: 'var(--primary)', fontWeight: '400', marginBottom: '0.35rem' }}>
                Reserve Room {confirmingRoom.roomNumber}?
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                You are about to reserve one available bed in this room.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Floor:</span>
                <b>Floor {confirmingRoom.floor}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Type:</span>
                <b>{confirmingRoom.roomType}</b>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Current Vacancy:</span>
                <b style={{ color: 'var(--success)' }}>{confirmingRoom.availableBeds} beds remaining</b>
              </div>
            </div>

            {bookingError && (
              <div className="alert-error" style={{ marginBottom: '1.25rem' }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{bookingError}</span>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setConfirmingRoom(null)}
                disabled={bookingLoading}
                className="btn-secondary"
                style={{ flex: '1 1 100px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBooking}
                disabled={bookingLoading}
                className="btn-primary"
                style={{ flex: '1 1 180px' }}
              >
                {bookingLoading ? 'Reserving...' : 'Confirm Reservation'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentDashboard;
