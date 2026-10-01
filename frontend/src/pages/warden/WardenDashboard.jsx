import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Layers,
  PlusCircle,
  FileCheck2,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Building2,
  Bed,
  CheckCircle2,
  AlertCircle,
  Search,
  Trash2,
  Eye,
  X,
  Menu,
  Bell,
  ChevronRight,
  Filter,
  ArrowUpRight,
  Calendar,
  Check,
  ChevronLeft,
  ChevronDown,
  UserCheck,
  BedDouble,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import OccupancyDots from '../../components/OccupancyDots';
import { SkeletonTableRow, SkeletonStat } from '../../components/SkeletonLoader';

const WardenDashboard = () => {
  const { user, token, API_BASE, logout } = useAuth();

  // Navigation & UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Statistics State
  const [stats, setStats] = useState({
    totalRooms: 0,
    totalBeds: 0,
    occupiedBeds: 0,
    availableBeds: 0,
    fullRooms: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Rooms Inventory State
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');
  const [floorFilter, setFloorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Add Room Form State
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newFloor, setNewFloor] = useState('1');
  const [newRoomType, setNewRoomType] = useState('AC');
  const [newTotalBeds, setNewTotalBeds] = useState('3');
  const [addRoomError, setAddRoomError] = useState('');
  const [addRoomSuccess, setAddRoomSuccess] = useState('');
  const [addRoomLoading, setAddRoomLoading] = useState(false);

  // Allocations State
  const [allocations, setAllocations] = useState([]);
  const [loadingAllocations, setLoadingAllocations] = useState(false);
  const [allocSearch, setAllocSearch] = useState('');

  // Students Directory State
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [studentAllocFilter, setStudentAllocFilter] = useState('all');

  // Resident Modal for "View Residents"
  const [viewingRoomResidents, setViewingRoomResidents] = useState(null);
  const [roomResidentsList, setRoomResidentsList] = useState([]);
  const [loadingResidentsModal, setLoadingResidentsModal] = useState(false);

  // Hovered or tapped room tooltip in occupancy matrix
  const [selectedMatrixRoom, setSelectedMatrixRoom] = useState(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Lock scroll when mobile drawer or modal is open
  useEffect(() => {
    if (mobileDrawerOpen || viewingRoomResidents) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [mobileDrawerOpen, viewingRoomResidents]);

  // 1. Fetch Stats from MongoDB
  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await fetch(`${API_BASE}/rooms/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // 2. Fetch Rooms Inventory from MongoDB
  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const params = new URLSearchParams();
      if (searchFilter) params.append('search', searchFilter);
      if (floorFilter !== '') params.append('floor', floorFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('roomType', typeFilter);

      const res = await fetch(`${API_BASE}/rooms?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setRooms(data.rooms || []);
      }
    } catch (err) {
      console.error('Failed to fetch rooms inventory:', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  // 3. Fetch All Allocations
  const fetchAllocations = async () => {
    setLoadingAllocations(true);
    try {
      const res = await fetch(`${API_BASE}/allocations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAllocations(data.allocations || []);
      }
    } catch (err) {
      console.error('Failed to fetch allocations:', err);
    } finally {
      setLoadingAllocations(false);
    }
  };

  // 4. Fetch Registered Students
  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const params = new URLSearchParams();
      if (studentSearch) params.append('search', studentSearch);

      const res = await fetch(`${API_BASE}/students?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setStudents(data.students || []);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStats();
      fetchRooms();
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'inventory') {
      fetchRooms();
      fetchStats();
    } else if (activeTab === 'allocations') {
      fetchAllocations();
    } else if (activeTab === 'students') {
      fetchStudents();
    }
  }, [activeTab, searchFilter, floorFilter, statusFilter, typeFilter, studentSearch]);

  // Handle Add Room Submission
  const handleAddRoom = async (e) => {
    e.preventDefault();
    setAddRoomError('');
    setAddRoomSuccess('');

    const beds = parseInt(newTotalBeds, 10);
    const flr = parseInt(newFloor, 10);

    if (isNaN(beds) || beds < 1) {
      setAddRoomError('Total bed capacity must be at least 1.');
      return;
    }

    if (isNaN(flr) || flr < 0) {
      setAddRoomError('Floor must be 0 (Ground) or higher.');
      return;
    }

    setAddRoomLoading(true);

    try {
      const res = await fetch(`${API_BASE}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomNumber: newRoomNumber,
          floor: flr,
          roomType: newRoomType,
          totalBeds: beds,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create room.');
      }

      setAddRoomSuccess(`Room ${data.room.roomNumber} created successfully!`);
      showToast(`Room ${data.room.roomNumber} added to inventory.`);
      setNewRoomNumber('');
      fetchStats();
      fetchRooms();
    } catch (err) {
      setAddRoomError(err.message || 'Error occurred while creating room.');
    } finally {
      setAddRoomLoading(false);
    }
  };

  // Handle Room Deletion (Only if occupiedBeds === 0)
  const handleDeleteRoom = async (roomId, roomNumber, occupied) => {
    if (occupied > 0) {
      alert(`Cannot delete Room ${roomNumber}. It currently has ${occupied} active resident(s).`);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete empty Room ${roomNumber} from database?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/rooms/${roomId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to delete room.');
      }

      showToast(`Room ${roomNumber} deleted successfully.`);
      fetchRooms();
      fetchStats();
    } catch (err) {
      alert(err.message);
    }
  };

  // Open View Residents Modal
  const handleOpenResidentsModal = async (room) => {
    setViewingRoomResidents(room);
    setLoadingResidentsModal(true);
    try {
      const res = await fetch(`${API_BASE}/rooms/${room._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setRoomResidentsList(data.residents || []);
      }
    } catch (err) {
      console.error('Failed to load resident details:', err);
    } finally {
      setLoadingResidentsModal(false);
    }
  };

  // Cancel/Deallocate Resident
  const handleCancelAllocation = async (allocationId, studentName) => {
    if (!window.confirm(`Deallocate ${studentName} from this room? This will free up 1 bed.`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/allocations/cancel/${allocationId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Deallocated ${studentName}. Bed freed successfully.`);
        if (viewingRoomResidents) {
          handleOpenResidentsModal(viewingRoomResidents);
        }
        fetchRooms();
        fetchStats();
        if (activeTab === 'allocations') fetchAllocations();
      }
    } catch (err) {
      alert('Failed to deallocate student.');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  };

  const roomsByFloor = rooms.reduce((acc, room) => {
    const flr = room.floor !== undefined ? room.floor : 0;
    if (!acc[flr]) acc[flr] = [];
    acc[flr].push(room);
    return acc;
  }, {});

  const occupancyPercentage = stats.totalBeds > 0
    ? Math.round((stats.occupiedBeds / stats.totalBeds) * 100)
    : 0;

  const filteredStudents = students.filter(student => {
    if (studentAllocFilter === 'allocated') return student.isAllocated;
    if (studentAllocFilter === 'unallocated') return !student.isAllocated;
    return true;
  });

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'inventory', label: 'Room Inventory', icon: Layers },
    { id: 'addRoom', label: 'Add Room', icon: PlusCircle },
    { id: 'allocations', label: 'Allocations', icon: FileCheck2 },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)', width: '100%', overflowX: 'hidden' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notice">
          <Check size={18} color="var(--accent)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MOBILE DRAWER OVERLAY (< 1024px) */}
      {mobileDrawerOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* WARDEN SIDEBAR (Desktop sticky, Mobile off-canvas drawer) - Light Mode matching theme */}
      <aside
        className={mobileDrawerOpen ? 'mobile-drawer' : 'hide-tablet-mobile'}
        style={{
          width: sidebarCollapsed ? '78px' : '260px',
          backgroundColor: 'var(--bg-sidebar)',
          color: 'var(--text-main)',
          borderRight: '1px solid var(--border-color)',
          display: mobileDrawerOpen ? 'flex' : undefined,
          flexDirection: 'column',
          position: mobileDrawerOpen ? 'fixed' : 'sticky',
          top: 0,
          height: '100vh',
          boxShadow: 'var(--shadow-subtle)',
          transition: 'width 250ms cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 45,
          flexShrink: 0
        }}
      >
        {/* Brand Header */}
        <div style={{
          padding: sidebarCollapsed ? '1.25rem 0.75rem' : '1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarCollapsed ? 'center' : 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
            <div style={{
              width: '36px',
              height: '36px',
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              borderRadius: 'var(--radius-xs)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '1.1rem',
              flexShrink: 0,
              boxShadow: '0 2px 4px rgba(23, 50, 77, 0.15)'
            }}>
              H
            </div>
            {(!sidebarCollapsed || mobileDrawerOpen) && (
              <div>
                <div style={{ fontWeight: '800', fontSize: '0.9rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--primary)', lineHeight: 1.2 }}>
                  Hostel Admin
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', letterSpacing: '0.02em', fontWeight: '500' }}>
                  Warden Management
                </div>
              </div>
            )}
          </div>

          {mobileDrawerOpen && (
            <button
              onClick={() => setMobileDrawerOpen(false)}
              style={{ color: 'var(--text-muted)', padding: '0.4rem', minHeight: '44px', minWidth: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-xs)' }}
              aria-label="Close drawer"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Nav Items */}
        <nav style={{ padding: '1rem 0.65rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileDrawerOpen(false);
                }}
                title={sidebarCollapsed ? item.label : undefined}
                className={`warden-nav-btn ${isActive ? 'active' : ''}`}
                style={{
                  padding: sidebarCollapsed ? '0.75rem 0' : '0.65rem 0.85rem',
                  justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                  borderLeft: isActive && !sidebarCollapsed ? '3px solid var(--accent)' : '3px solid transparent'
                }}
              >
                <Icon size={18} color={isActive ? 'var(--accent)' : 'var(--secondary)'} style={{ flexShrink: 0 }} />
                {(!sidebarCollapsed || mobileDrawerOpen) && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{
          padding: sidebarCollapsed ? '0.75rem 0.5rem' : '1rem',
          borderTop: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-main)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}>
          {(!sidebarCollapsed || mobileDrawerOpen) && (
            <div style={{ padding: '0.35rem 0.5rem', marginBottom: '0.15rem' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: '700', color: 'var(--primary)' }}>{user?.name || 'Chief Warden'}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user?.email}</div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="warden-sidebar-collapse-btn hide-tablet-mobile"
            >
              {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            <button
              onClick={logout}
              title="Logout session"
              className="warden-sidebar-logout-btn"
              style={{
                flex: mobileDrawerOpen ? 1 : undefined
              }}
            >
              <LogOut size={14} /> {(!sidebarCollapsed || mobileDrawerOpen) && 'Logout'}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, width: '100%' }}>
        
        {/* WARDEN TOP BAR */}
        <header style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid var(--border-color)',
          padding: '0.85rem clamp(1rem, 3vw, 2rem)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-subtle)',
          position: 'sticky',
          top: 0,
          zIndex: 30,
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Mobile Hamburger to trigger Drawer */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="show-tablet-mobile hide-on-desktop"
              style={{
                color: 'var(--primary)',
                padding: '0.4rem',
                minHeight: '44px',
                minWidth: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              aria-label="Open sidebar drawer"
            >
              <Menu size={22} />
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>Dashboard</span>
                <ChevronRight size={11} />
                <span style={{ color: 'var(--primary)', fontWeight: '600', textTransform: 'capitalize' }}>
                  {activeTab}
                </span>
              </div>
              <h1 style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.25rem)', fontWeight: '700', color: 'var(--primary)', marginTop: '2px' }}>
                {activeTab === 'overview' && 'Administration Overview'}
                {activeTab === 'inventory' && 'Room Inventory'}
                {activeTab === 'addRoom' && 'Configure New Room'}
                {activeTab === 'allocations' && 'Allocations Ledger'}
                {activeTab === 'students' && 'Student Directory'}
                {activeTab === 'reports' && 'Facility Reports'}
                {activeTab === 'settings' && 'System Policies'}
              </h1>
            </div>
          </div>

          {/* Top Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <button
              onClick={() => fetchStats()}
              title="Refresh live MongoDB data"
              style={{
                padding: '0.45rem',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '38px',
                minWidth: '38px'
              }}
            >
              <RefreshCw size={15} />
            </button>

            {/* Profile Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.65rem',
                  backgroundColor: 'var(--bg-main)',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-color)',
                  minHeight: '38px'
                }}
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '700'
                }}>
                  W
                </div>
                <div className="hide-on-mobile" style={{ textAlign: 'left', lineHeight: 1.1 }}>
                  <div style={{ fontSize: '0.775rem', fontWeight: '700', color: 'var(--primary)' }}>
                    Warden Desk
                  </div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--accent)', fontWeight: '600' }}>
                    Administrator
                  </div>
                </div>
                <ChevronDown size={13} color="var(--text-muted)" />
              </button>

              {profileDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '120%',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: 'var(--shadow-elevated)',
                  border: '1px solid var(--border-color)',
                  width: '170px',
                  padding: '0.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  zIndex: 50
                }}>
                  <button onClick={() => { setActiveTab('overview'); setProfileDropdownOpen(false); }} style={{ padding: '0.45rem 0.65rem', textAlign: 'left', fontSize: '0.825rem', borderRadius: '4px' }}>
                    Dashboard
                  </button>
                  <button onClick={() => { setActiveTab('settings'); setProfileDropdownOpen(false); }} style={{ padding: '0.45rem 0.65rem', textAlign: 'left', fontSize: '0.825rem', borderRadius: '4px' }}>
                    Settings
                  </button>
                  <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '0.25rem 0' }} />
                  <button onClick={logout} style={{ padding: '0.45rem 0.65rem', textAlign: 'left', fontSize: '0.825rem', color: 'var(--danger)', fontWeight: '600', borderRadius: '4px' }}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main style={{ flex: 1, padding: 'clamp(1rem, 3vw, 2rem)', overflowY: 'auto', width: '100%' }}>
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div>
              {/* Dynamic Greeting */}
              <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '0.85rem' }}>
                <div>
                  <h2 className="font-serif" style={{ fontSize: 'clamp(1.5rem, 3vw, 1.85rem)', color: 'var(--primary)', fontWeight: '400', marginBottom: '0.25rem' }}>
                    Good morning, Warden
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Here's what's happening across the hostel campus today.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.775rem', color: 'var(--text-secondary)', backgroundColor: '#FFFFFF', padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <Calendar size={14} color="var(--primary)" />
                  <span>Thursday, October 1, 2026</span>
                </div>
              </div>

              {/* Statistics Grid (Responsive 2x2 on Mobile, 4-Col Desktop) */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                {/* Total Rooms */}
                <div className="panel-card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--primary)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.725rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                      Total Configured Rooms
                    </div>
                    <div className="font-serif" style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', color: 'var(--primary)', marginTop: '0.35rem', lineHeight: 1 }}>
                      {loadingStats ? '...' : stats.totalRooms}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <CheckCircle2 size={13} color="var(--success)" />
                    <span>Live MongoDB sync</span>
                  </div>
                </div>

                {/* Available Beds */}
                <div className="panel-card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--success)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.725rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                        Available Beds
                      </span>
                      <span className="inst-badge" style={{ fontSize: '0.625rem', padding: '0.15rem 0.4rem' }}>
                        <span className="live-indicator" /> Live
                      </span>
                    </div>
                    <div className="font-serif" style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', color: 'var(--success)', marginTop: '0.35rem', lineHeight: 1 }}>
                      {loadingStats ? '...' : stats.availableBeds}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                    Ready for allotment
                  </div>
                </div>

                {/* Occupied Beds */}
                <div className="panel-card" style={{ padding: '1.25rem', borderLeft: '4px solid var(--secondary)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.725rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                      Occupied Beds
                    </div>
                    <div className="font-serif" style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', color: 'var(--secondary)', marginTop: '0.35rem', lineHeight: 1 }}>
                      {loadingStats ? '...' : stats.occupiedBeds}
                    </div>
                  </div>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
                    Of {stats.totalBeds} total beds
                  </div>
                </div>

                {/* Occupancy Donut */}
                <div className="panel-card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid var(--accent)' }}>
                  <div>
                    <div style={{ fontSize: '0.725rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                      Hostel Occupancy
                    </div>
                    <div className="font-serif" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.2rem)', color: 'var(--primary)', marginTop: '0.35rem', lineHeight: 1 }}>
                      {occupancyPercentage}%
                    </div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                      {stats.fullRooms} full room(s)
                    </div>
                  </div>

                  <div style={{ position: 'relative', width: '56px', height: '56px', flexShrink: 0 }}>
                    <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="#E2E6E3"
                        strokeWidth="3.5"
                      />
                      <path
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        stroke="var(--accent)"
                        strokeDasharray={`${occupancyPercentage}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* ROOM OCCUPANCY MATRIX */}
              <div className="panel-card" style={{ padding: 'clamp(1.25rem, 3vw, 1.75rem)', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', color: 'var(--primary)', fontWeight: '700' }}>
                      Floor & Room Occupancy Matrix
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Tap or hover over any room to inspect occupancy details.
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span className="dot-bed occupied" /> <span>Occupied</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span className="dot-bed available" /> <span>Available</span>
                    </div>
                  </div>
                </div>

                {Object.keys(roomsByFloor).length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No rooms configured yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {Object.entries(roomsByFloor)
                      .sort(([a], [b]) => Number(a) - Number(b))
                      .map(([floorNum, floorRooms]) => (
                        <div key={floorNum} style={{
                          backgroundColor: 'var(--bg-main)',
                          padding: '1rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)'
                        }}>
                          <div style={{ fontSize: '0.775rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--secondary)', marginBottom: '0.75rem' }}>
                            Floor {floorNum}
                          </div>

                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                            {floorRooms.map((room) => {
                              const isSelected = selectedMatrixRoom?._id === room._id;
                              return (
                                <div
                                  key={room._id}
                                  onClick={() => setSelectedMatrixRoom(isSelected ? null : room)}
                                  style={{
                                    backgroundColor: '#FFFFFF',
                                    border: isSelected ? '1.5px solid var(--accent)' : '1px solid var(--border-color)',
                                    borderRadius: 'var(--radius-xs)',
                                    padding: '0.55rem 0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    cursor: 'pointer',
                                    boxShadow: isSelected ? 'var(--shadow-card)' : 'var(--shadow-subtle)',
                                    position: 'relative',
                                  }}
                                >
                                  <div>
                                    <div style={{ fontWeight: '700', fontSize: '0.85rem', color: 'var(--primary)' }}>
                                      {room.roomNumber}
                                    </div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                      {room.roomType}
                                    </div>
                                  </div>

                                  <OccupancyDots totalBeds={room.totalBeds} occupiedBeds={room.occupiedBeds} />

                                  {isSelected && (
                                    <div style={{
                                      position: 'absolute',
                                      bottom: '115%',
                                      left: '50%',
                                      transform: 'translateX(-50%)',
                                      backgroundColor: 'var(--bg-dark)',
                                      color: '#FFFFFF',
                                      padding: '0.5rem 0.75rem',
                                      borderRadius: 'var(--radius-xs)',
                                      fontSize: '0.725rem',
                                      whiteSpace: 'nowrap',
                                      zIndex: 20,
                                      boxShadow: 'var(--shadow-card)',
                                      textAlign: 'center'
                                    }}>
                                      <div style={{ fontWeight: '700' }}>Room {room.roomNumber} • {room.roomType}</div>
                                      <div style={{ opacity: 0.85, marginTop: '2px' }}>
                                        {room.occupiedBeds}/{room.totalBeds} occupied • <b>{room.availableBeds} free</b>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Quick Actions Bar */}
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className="btn-primary"
                  style={{ fontSize: '0.85rem', flex: '1 1 auto', minWidth: '160px' }}
                >
                  <Layers size={15} /> Room Inventory
                </button>
                <button
                  onClick={() => setActiveTab('addRoom')}
                  className="btn-secondary"
                  style={{ fontSize: '0.85rem', flex: '1 1 auto', minWidth: '160px' }}
                >
                  <PlusCircle size={15} /> Add New Room
                </button>
                <button
                  onClick={() => setActiveTab('allocations')}
                  className="btn-secondary"
                  style={{ fontSize: '0.85rem', flex: '1 1 auto', minWidth: '160px' }}
                >
                  <FileCheck2 size={15} /> Allocations Ledger
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ROOM INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="panel-card" style={{ padding: 'clamp(1rem, 3vw, 1.75rem)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', fontWeight: '700' }}>
                    Room Inventory Directory
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    Complete database of campus rooms, status, and assigned residents
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', width: '100%', maxWidth: '640px' }}>
                  <div style={{ position: 'relative', flex: '1 1 160px' }}>
                    <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                    <input
                      type="text"
                      placeholder="Search room..."
                      className="form-input"
                      style={{ paddingLeft: '2.1rem', minHeight: '40px', fontSize: '0.85rem' }}
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                    />
                  </div>

                  <select
                    className="form-select"
                    style={{ flex: '1 1 110px', minHeight: '40px', fontSize: '0.85rem' }}
                    value={floorFilter}
                    onChange={(e) => setFloorFilter(e.target.value)}
                  >
                    <option value="">All Floors</option>
                    <option value="1">Floor 1</option>
                    <option value="2">Floor 2</option>
                    <option value="3">Floor 3</option>
                  </select>

                  <select
                    className="form-select"
                    style={{ flex: '1 1 110px', minHeight: '40px', fontSize: '0.85rem' }}
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="AC">AC</option>
                    <option value="Non-AC">Non-AC</option>
                  </select>

                  <select
                    className="form-select"
                    style={{ flex: '1 1 110px', minHeight: '40px', fontSize: '0.85rem' }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="Available">Available</option>
                    <option value="Full">Full</option>
                  </select>
                </div>
              </div>

              {/* Responsive Table Wrapper */}
              <div className="responsive-table-wrapper">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '2px solid var(--border-color)', color: 'var(--primary)' }}>
                      <th style={{ padding: '0.75rem 0.85rem', fontWeight: '700' }}>Room</th>
                      <th style={{ padding: '0.75rem 0.85rem', fontWeight: '700' }}>Floor</th>
                      <th style={{ padding: '0.75rem 0.85rem', fontWeight: '700' }}>Type</th>
                      <th style={{ padding: '0.75rem 0.85rem', fontWeight: '700' }}>Capacity</th>
                      <th style={{ padding: '0.75rem 0.85rem', fontWeight: '700' }}>Occupied</th>
                      <th style={{ padding: '0.75rem 0.85rem', fontWeight: '700' }}>Available</th>
                      <th style={{ padding: '0.75rem 0.85rem', fontWeight: '700' }}>Status</th>
                      <th style={{ padding: '0.75rem 0.85rem', fontWeight: '700' }}>Residents</th>
                      <th style={{ padding: '0.75rem 0.85rem', fontWeight: '700', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingRooms ? (
                      Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} columns={9} />)
                    ) : rooms.length === 0 ? (
                      <tr>
                        <td colSpan="9" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                          No rooms match your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      rooms.map((room) => {
                        const residentSummary = room.residents && room.residents.length > 0
                          ? room.residents.map(r => r.name?.split(' ')[0]).join(', ')
                          : 'None';

                        return (
                          <tr key={room._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '0.85rem', fontWeight: '700', color: 'var(--primary)' }}>
                              Room {room.roomNumber}
                            </td>
                            <td style={{ padding: '0.85rem', color: 'var(--text-muted)' }}>
                              Floor {room.floor}
                            </td>
                            <td style={{ padding: '0.85rem' }}>
                              <span className={`status-pill ${room.roomType === 'AC' ? 'ac' : 'non-ac'}`}>
                                {room.roomType}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem', fontWeight: '600' }}>
                              {room.totalBeds}
                            </td>
                            <td style={{ padding: '0.85rem', fontWeight: '600', color: 'var(--secondary)' }}>
                              {room.occupiedBeds}
                            </td>
                            <td style={{ padding: '0.85rem', fontWeight: '700', color: 'var(--success)' }}>
                              {room.availableBeds}
                            </td>
                            <td style={{ padding: '0.85rem' }}>
                              <span className={`status-pill ${room.status === 'Available' ? 'available' : 'full'}`}>
                                {room.status}
                              </span>
                            </td>
                            <td style={{ padding: '0.85rem', color: 'var(--text-muted)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {residentSummary}
                            </td>
                            <td style={{ padding: '0.85rem', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => handleOpenResidentsModal(room)}
                                  className="btn-secondary"
                                  style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', minHeight: '34px' }}
                                  title="View Residents"
                                >
                                  <Eye size={13} /> Residents
                                </button>

                                <button
                                  onClick={() => handleDeleteRoom(room._id, room.roomNumber, room.occupiedBeds)}
                                  disabled={room.occupiedBeds > 0}
                                  className="btn-danger"
                                  style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', minHeight: '34px' }}
                                  title={room.occupiedBeds > 0 ? "Cannot delete room with active residents" : "Delete eligible empty room"}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ADD ROOM */}
          {activeTab === 'addRoom' && (
            <div className="panel-card" style={{ maxWidth: '620px', margin: '0 auto', padding: 'clamp(1.5rem, 4vw, 2.25rem)' }}>
              <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <h3 className="font-serif" style={{ fontSize: 'clamp(1.4rem, 3vw, 1.65rem)', color: 'var(--primary)', fontWeight: '400' }}>
                  Add a new room
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Add a room to the hostel inventory and define its capacity.
                </p>
              </div>

              {addRoomError && (
                <div className="alert-error" style={{ marginBottom: '1.25rem' }}>
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span>{addRoomError}</span>
                </div>
              )}

              {addRoomSuccess && (
                <div className="alert-success" style={{ marginBottom: '1.25rem' }}>
                  <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
                  <span>{addRoomSuccess}</span>
                </div>
              )}

              <form onSubmit={handleAddRoom}>
                <div className="form-group">
                  <label className="form-label">Room Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 101, 204"
                    className="form-input"
                    value={newRoomNumber}
                    onChange={(e) => setNewRoomNumber(e.target.value)}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                    Must be unique across all wings.
                  </span>
                </div>

                <div className="grid-2col-responsive" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label">Floor</label>
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="e.g. 1"
                      className="form-input"
                      value={newFloor}
                      onChange={(e) => setNewFloor(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Room Type</label>
                    <select
                      className="form-select"
                      value={newRoomType}
                      onChange={(e) => setNewRoomType(e.target.value)}
                    >
                      <option value="AC">AC (Climate Controlled)</option>
                      <option value="Non-AC">Non-AC (Natural)</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Bed Capacity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="Minimum 1"
                    className="form-input"
                    value={newTotalBeds}
                    onChange={(e) => setNewTotalBeds(e.target.value)}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-light)' }}>
                    Positive number of sanctioned beds. Zero or negative rejected by business logic.
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="submit"
                    disabled={addRoomLoading}
                    className="btn-primary"
                    style={{ flex: '1 1 180px', padding: '0.75rem' }}
                  >
                    {addRoomLoading ? 'Registering Room...' : 'Add Room'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('inventory')}
                    className="btn-secondary"
                    style={{ flex: '1 1 120px', padding: '0.75rem' }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: ALLOCATIONS */}
          {activeTab === 'allocations' && (
            <div className="panel-card" style={{ padding: 'clamp(1rem, 3vw, 1.75rem)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', fontWeight: '700' }}>
                    Student Allocations Ledger
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    Central record of all bed reservations and current residency permits
                  </p>
                </div>

                <div style={{ position: 'relative', width: '100%', maxWidth: '240px' }}>
                  <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                  <input
                    type="text"
                    placeholder="Filter allocations..."
                    className="form-input"
                    style={{ paddingLeft: '2.1rem', minHeight: '40px', fontSize: '0.85rem' }}
                    value={allocSearch}
                    onChange={(e) => setAllocSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="responsive-table-wrapper">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '2px solid var(--border-color)', color: 'var(--primary)' }}>
                      <th style={{ padding: '0.75rem 0.85rem' }}>Student Name</th>
                      <th style={{ padding: '0.75rem 0.85rem' }}>Student ID</th>
                      <th style={{ padding: '0.75rem 0.85rem' }}>Room</th>
                      <th style={{ padding: '0.75rem 0.85rem' }}>Floor & Type</th>
                      <th style={{ padding: '0.75rem 0.85rem' }}>Allocation Date</th>
                      <th style={{ padding: '0.75rem 0.85rem' }}>Status</th>
                      <th style={{ padding: '0.75rem 0.85rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingAllocations ? (
                      Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} columns={7} />)
                    ) : allocations.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                          No active allocations found in database.
                        </td>
                      </tr>
                    ) : (
                      allocations.map((alloc) => (
                        <tr key={alloc._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.85rem', fontWeight: '600', color: 'var(--primary)' }}>
                            {alloc.student?.name || 'N/A'}
                          </td>
                          <td style={{ padding: '0.85rem', color: 'var(--text-muted)' }}>
                            {alloc.student?.studentId || 'N/A'}
                          </td>
                          <td style={{ padding: '0.85rem', fontWeight: '700', color: 'var(--primary)' }}>
                            Room {alloc.room?.roomNumber || 'N/A'}
                          </td>
                          <td style={{ padding: '0.85rem' }}>
                            Floor {alloc.room?.floor} • {alloc.room?.roomType}
                          </td>
                          <td style={{ padding: '0.85rem', color: 'var(--text-muted)' }}>
                            {formatDate(alloc.allocationDate)}
                          </td>
                          <td style={{ padding: '0.85rem' }}>
                            <span className={`status-pill ${alloc.status === 'Active' ? 'available' : 'full'}`}>
                              {alloc.status}
                            </span>
                          </td>
                          <td style={{ padding: '0.85rem', textAlign: 'right' }}>
                            {alloc.status === 'Active' && (
                              <button
                                onClick={() => handleCancelAllocation(alloc._id, alloc.student?.name)}
                                className="btn-danger"
                                style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', minHeight: '34px' }}
                              >
                                Deallocate Bed
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: STUDENTS DIRECTORY */}
          {activeTab === 'students' && (
            <div className="panel-card" style={{ padding: 'clamp(1rem, 3vw, 1.75rem)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)', fontWeight: '700' }}>
                    Registered Students
                  </h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
                    Student records enrolled in the accommodation portal
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', flexWrap: 'wrap', width: '100%', maxWidth: '440px' }}>
                  <div style={{ display: 'flex', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-xs)', padding: '2px', border: '1px solid var(--border-color)' }}>
                    <button
                      onClick={() => setStudentAllocFilter('all')}
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', fontWeight: '600', backgroundColor: studentAllocFilter === 'all' ? '#FFFFFF' : 'transparent', color: studentAllocFilter === 'all' ? 'var(--primary)' : 'var(--text-muted)', borderRadius: '4px' }}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setStudentAllocFilter('allocated')}
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', fontWeight: '600', backgroundColor: studentAllocFilter === 'allocated' ? '#FFFFFF' : 'transparent', color: studentAllocFilter === 'allocated' ? 'var(--primary)' : 'var(--text-muted)', borderRadius: '4px' }}
                    >
                      Allocated
                    </button>
                    <button
                      onClick={() => setStudentAllocFilter('unallocated')}
                      style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', fontWeight: '600', backgroundColor: studentAllocFilter === 'unallocated' ? '#FFFFFF' : 'transparent', color: studentAllocFilter === 'unallocated' ? 'var(--primary)' : 'var(--text-muted)', borderRadius: '4px' }}
                    >
                      Unallocated
                    </button>
                  </div>

                  <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)' }} />
                    <input
                      type="text"
                      placeholder="Search students..."
                      className="form-input"
                      style={{ paddingLeft: '2.1rem', minHeight: '40px', fontSize: '0.85rem' }}
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="responsive-table-wrapper">
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '2px solid var(--border-color)', color: 'var(--primary)' }}>
                      <th style={{ padding: '0.75rem 0.85rem' }}>Name</th>
                      <th style={{ padding: '0.75rem 0.85rem' }}>Student ID</th>
                      <th style={{ padding: '0.75rem 0.85rem' }}>Email</th>
                      <th style={{ padding: '0.75rem 0.85rem' }}>Course</th>
                      <th style={{ padding: '0.75rem 0.85rem' }}>Year</th>
                      <th style={{ padding: '0.75rem 0.85rem' }}>Assigned Room</th>
                      <th style={{ padding: '0.75rem 0.85rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingStudents ? (
                      Array.from({ length: 5 }).map((_, i) => <SkeletonTableRow key={i} columns={7} />)
                    ) : filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan="7" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                          No students match the selected filter.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((st) => (
                        <tr key={st._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.85rem', fontWeight: '600', color: 'var(--primary)' }}>
                            {st.name}
                          </td>
                          <td style={{ padding: '0.85rem', color: 'var(--text-muted)' }}>
                            {st.studentId}
                          </td>
                          <td style={{ padding: '0.85rem', color: 'var(--text-muted)' }}>
                            {st.email}
                          </td>
                          <td style={{ padding: '0.85rem' }}>
                            {st.course || 'N/A'}
                          </td>
                          <td style={{ padding: '0.85rem' }}>
                            {st.year || 'N/A'}
                          </td>
                          <td style={{ padding: '0.85rem', fontWeight: '600', color: st.isAllocated ? 'var(--primary)' : 'var(--text-muted)' }}>
                            {st.isAllocated ? `Room ${st.allocation?.room?.roomNumber}` : '—'}
                          </td>
                          <td style={{ padding: '0.85rem' }}>
                            <span className={`status-pill ${st.isAllocated ? 'available' : 'non-ac'}`}>
                              {st.isAllocated ? 'Allocated' : 'Unallocated'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 6: REPORTS */}
          {activeTab === 'reports' && (
            <div className="panel-card" style={{ padding: 'clamp(1.5rem, 4vw, 2rem)' }}>
              <div style={{ marginBottom: '1.75rem' }}>
                <h3 className="font-serif" style={{ fontSize: 'clamp(1.4rem, 3vw, 1.75rem)', color: 'var(--primary)', fontWeight: '400' }}>
                  Hostel Capacity & Utilization Analytics
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  Institutional metrics calculated directly from database models
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
                <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.775rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Total Sanctioned Capacity
                  </div>
                  <div className="font-serif" style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', color: 'var(--primary)', margin: '0.35rem 0' }}>
                    {stats.totalBeds} Beds
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Spread across {stats.totalRooms} configured residential suites
                  </div>
                </div>

                <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '0.775rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                    Occupancy Ratio
                  </div>
                  <div className="font-serif" style={{ fontSize: 'clamp(2rem, 4vw, 2.5rem)', color: 'var(--accent)', margin: '0.35rem 0' }}>
                    {occupancyPercentage}%
                  </div>
                  <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E6E3', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${occupancyPercentage}%`, height: '100%', backgroundColor: 'var(--accent)' }} />
                  </div>
                </div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: 'var(--primary-light)', border: '1px solid var(--primary-border)', borderRadius: 'var(--radius-sm)', fontSize: '0.825rem', color: 'var(--primary)' }}>
                ✓ Database Invariant: <b>Occupied Beds ({stats.occupiedBeds}) + Available Beds ({stats.availableBeds}) = Total Capacity ({stats.totalBeds})</b>
              </div>
            </div>
          )}

          {/* TAB 7: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="panel-card" style={{ maxWidth: '680px', margin: '0 auto', padding: 'clamp(1.5rem, 4vw, 2rem)' }}>
              <h3 className="font-serif" style={{ fontSize: 'clamp(1.4rem, 3vw, 1.75rem)', color: 'var(--primary)', fontWeight: '400', marginBottom: '0.5rem' }}>
                Hostel Governance & System Policies
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.75rem' }}>
                Operational rules enforced at the database and application tiers
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.875rem' }}>
                    Rule 1: Unique Room Numbers
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Duplicate room numbers across all campus wings are automatically rejected.
                  </div>
                </div>

                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.875rem' }}>
                    Rule 3: Single Allocation Guarantee
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Compound MongoDB indexing enforces exactly one active allocation per student ID.
                  </div>
                </div>

                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '0.875rem' }}>
                    Rule 5: Atomic Bed Reservation
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Concurrency guard condition (availableBeds &gt; 0) prevents race conditions and overbooking.
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* VIEW RESIDENTS MODAL */}
      {viewingRoomResidents && (
        <div className="modal-overlay" onClick={() => setViewingRoomResidents(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)', fontWeight: '700' }}>
                  Residents in Room {viewingRoomResidents.roomNumber}
                </h3>
                <p style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                  Floor {viewingRoomResidents.floor} • {viewingRoomResidents.roomType} • Capacity: {viewingRoomResidents.occupiedBeds}/{viewingRoomResidents.totalBeds} Beds
                </p>
              </div>
              <button
                onClick={() => setViewingRoomResidents(null)}
                style={{ padding: '0.35rem', color: 'var(--text-muted)', minHeight: '44px', minWidth: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            {loadingResidentsModal ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Retrieving active resident records...
              </div>
            ) : roomResidentsList.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No active residents assigned to this room yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {roomResidentsList.map((res, index) => (
                  <div key={index} style={{
                    padding: '1rem',
                    backgroundColor: 'var(--bg-main)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.75rem'
                  }}>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.925rem', color: 'var(--primary)' }}>
                        {res.name}
                      </div>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                        ID: <b>{res.studentId}</b> • {res.email}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {res.course || 'Course N/A'} • {res.year || 'Year N/A'}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--secondary)', marginTop: '4px' }}>
                        Allotted: {formatDate(res.allocationDate)}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCancelAllocation(res.allocationId, res.name)}
                      className="btn-danger"
                    >
                      Deallocate
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button onClick={() => setViewingRoomResidents(null)} className="btn-secondary" style={{ width: '100%', maxWidth: '140px' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default WardenDashboard;
