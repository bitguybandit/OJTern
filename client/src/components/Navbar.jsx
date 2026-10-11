import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNotificationsApi, getUnreadCountApi, markNotificationReadApi } from '../api/notification.api';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Hide the app navbar on the landing page (it has its own nav)
  if (location.pathname === '/' && !isAuthenticated) {
    return null;
  }

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const notifRef = useRef(null);

  // Fetch unread count periodically or when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchCount = async () => {
      try {
        const res = await getUnreadCountApi();
        setUnreadCount(res.unreadCount || 0);
      } catch (err) {
        // Silently handle polling errors
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleNotifications = async () => {
    if (!showNotifDropdown) {
      setLoadingNotifs(true);
      setShowNotifDropdown(true);
      try {
        const list = await getNotificationsApi();
        setNotifications(list);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setLoadingNotifs(false);
      }
    } else {
      setShowNotifDropdown(false);
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif.IsRead) {
      try {
        await markNotificationReadApi(notif.NotificationID);
        setNotifications((prev) =>
          prev.map((n) => (n.NotificationID === notif.NotificationID ? { ...n, IsRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to mark read:', err);
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <div className="brand-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L1 7l11 5 9-4.09V17h2V7L12 2zm0 8.9L4.24 7.5 12 4l7.76 3.5L12 10.9zm0 3.1L3 9v8l9 5 9-5V9l-9 5z" />
            </svg>
          </div>
          <span className="brand-title">OJTerm</span>
          <span className="brand-badge">Prefinal</span>
        </Link>

        {/* Navigation links */}
        <nav className="navbar-nav">
          {isAuthenticated ? (
            <>
              {user.Role === 'Student' && (
                <>
                  <NavLink
                    to="/student/recommendations"
                    className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  >
                    Matched Internships
                  </NavLink>
                  <NavLink
                    to="/student/applications"
                    className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  >
                    My Applications
                  </NavLink>
                  <NavLink
                    to="/student/profile"
                    className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  >
                    Student Profile
                  </NavLink>
                </>
              )}

              {user.Role === 'IndustryPartner' && (
                <>
                  <NavLink
                    to="/partner/postings"
                    className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  >
                    Internship Postings
                  </NavLink>
                  <NavLink
                    to="/partner/company"
                    className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  >
                    Company Profile
                  </NavLink>
                </>
              )}

              {user.Role === 'OJTCoordinator' && (
                <>
                  <NavLink
                    to="/coordinator/dashboard"
                    className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  >
                    Dashboard
                  </NavLink>
                  <NavLink
                    to="/coordinator/applications"
                    className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  >
                    Applications Queue
                  </NavLink>
                  <NavLink
                    to="/coordinator/companies"
                    className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  >
                    Verify Partners
                  </NavLink>
                  <NavLink
                    to="/coordinator/report"
                    className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  >
                    Placement Report
                  </NavLink>
                </>
              )}

              {user.Role === 'SchoolAdministrator' && (
                <>
                  <NavLink
                    to="/admin/users"
                    className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  >
                    User Management
                  </NavLink>
                  <NavLink
                    to="/admin/reports"
                    className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  >
                    Placement Reports
                  </NavLink>
                  <NavLink
                    to="/admin/audit-logs"
                    className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                  >
                    Audit Trail
                  </NavLink>
                </>
              )}
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Sign In
              </NavLink>
              <NavLink to="/signup" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
                Register
              </NavLink>
            </>
          )}
        </nav>

        {/* User Actions & Notification Badge */}
        {isAuthenticated && (
          <div className="navbar-actions">
            {/* Notification Bell */}
            <div className="notif-wrapper" ref={notifRef}>
              <button
                className="notif-btn"
                onClick={toggleNotifications}
                title="View notifications"
                aria-label="Notifications"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
              </button>

              {/* Dropdown Menu */}
              {showNotifDropdown && (
                <div className="notif-dropdown">
                  <div className="notif-dropdown-header">
                    <h4>Notifications</h4>
                    {unreadCount > 0 && <span className="badge badge-attention">{unreadCount} unread</span>}
                  </div>
                  <div className="notif-dropdown-body">
                    {loadingNotifs ? (
                      <p className="notif-empty">Loading notifications...</p>
                    ) : notifications.length === 0 ? (
                      <p className="notif-empty">No notifications yet.</p>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.NotificationID}
                          className={`notif-item ${!n.IsRead ? 'unread' : ''}`}
                          onClick={() => handleNotificationClick(n)}
                        >
                          <div className={`notif-indicator notif-type-${n.Type}`} />
                          <div className="notif-content">
                            <p className="notif-msg">{n.Message}</p>
                            <span className="notif-time">
                              {new Date(n.DateSent || n.createdAt).toLocaleString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Chip */}
            <div className="user-profile-chip">
              <div className="user-avatar">{user.Name ? user.Name.charAt(0).toUpperCase() : 'U'}</div>
              <div className="user-info-text">
                <span className="user-display-name">{user.Name}</span>
                <span className="user-role-tag">{user.Role}</span>
              </div>
            </div>

            {/* Logout */}
            <button className="btn btn-outline btn-sm" onClick={handleLogout} title="Sign Out">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
