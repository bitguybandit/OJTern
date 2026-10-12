import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNotificationsApi, getUnreadCountApi, markNotificationReadApi } from '../api/notification.api';

const navLinkClass = ({ isActive }) =>
  `block px-4 py-3 rounded-lg text-sm font-medium transition ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-100'}`;

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  // Hide the app navbar on the landing page (it has its own nav) and on the
  // auth pages (they render their own branded header).
  // Keep this below all hooks so the hook order stays stable across renders.
  const hideNavbarOn = ['/', '/login', '/signup'];
  if (hideNavbarOn.includes(location.pathname) && !isAuthenticated) {
    return null;
  }

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
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 flex flex-col justify-between z-50 overflow-y-auto">
      <div className="flex flex-col">
        {/* Brand */}
        <div className="px-6 h-16 border-b border-slate-200 flex items-center space-x-2">
          <Link to="/" className="navbar-brand">
            <div className="brand-logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L1 7l11 5 9-4.09V17h2V7L12 2zm0 8.9L4.24 7.5 12 4l7.76 3.5L12 10.9zm0 3.1L3 9v8l9 5 9-5V9l-9 5z" />
              </svg>
            </div>
            <span className="brand-title">OJTerm</span>
            <span className="brand-badge">Prefinal</span>
          </Link>
        </div>

        {/* Navigation links */}
        <nav className="p-4 space-y-1">
          {isAuthenticated ? (
            <>
              {user.Role === 'Student' && (
                <>
                  <NavLink to="/student/recommendations" className={navLinkClass}>
                    Matched Internships
                  </NavLink>
                  <NavLink to="/student/applications" className={navLinkClass}>
                    My Applications
                  </NavLink>
                  <NavLink to="/student/profile" className={navLinkClass}>
                    Student Profile
                  </NavLink>
                </>
              )}

              {user.Role === 'IndustryPartner' && (
                <>
                  <NavLink to="/partner/postings" className={navLinkClass}>
                    Internship Postings
                  </NavLink>
                  <NavLink to="/partner/company" className={navLinkClass}>
                    Company Profile
                  </NavLink>
                </>
              )}

              {user.Role === 'OJTCoordinator' && (
                <>
                  <NavLink to="/coordinator/dashboard" className={navLinkClass}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/coordinator/applications" className={navLinkClass}>
                    Applications Queue
                  </NavLink>
                  <NavLink to="/coordinator/companies" className={navLinkClass}>
                    Verify Partners
                  </NavLink>
                  <NavLink to="/coordinator/report" className={navLinkClass}>
                    Placement Report
                  </NavLink>
                </>
              )}

              {user.Role === 'SchoolAdministrator' && (
                <>
                  <NavLink to="/admin/users" className={navLinkClass}>
                    User Management
                  </NavLink>
                  <NavLink to="/admin/reports" className={navLinkClass}>
                    Placement Reports
                  </NavLink>
                  <NavLink to="/admin/audit-logs" className={navLinkClass}>
                    Audit Trail
                  </NavLink>
                </>
              )}
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Sign In
              </NavLink>
              <NavLink to="/signup" className={navLinkClass}>
                Register
              </NavLink>
            </>
          )}
        </nav>
      </div>

      {/* User Actions & Notification Badge */}
      {isAuthenticated && (
        <div className="p-4 border-t border-slate-200 space-y-4">
          {/* Notification Bell */}
          <div className="notif-wrapper" ref={notifRef}>
            <button
              className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm text-slate-700 transition"
              onClick={toggleNotifications}
              title="View notifications"
              aria-label="Notifications"
            >
              <span className="notif-label">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span>Notifications</span>
              </span>
              {unreadCount > 0 && <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </button>

            {/* Dropdown Menu */}
            {showNotifDropdown && (
              <div className="notif-dropdown bottom-full left-0 mb-2">
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
          <div className="user-profile-chip w-full">
            <div className="user-avatar">{user.Name ? user.Name.charAt(0).toUpperCase() : 'U'}</div>
            <div className="user-info-text">
              <span className="user-display-name">{user.Name}</span>
              <span className="user-role-tag">{user.Role}</span>
            </div>
          </div>

          {/* Logout */}
          <button className="btn btn-outline btn-sm w-full" onClick={handleLogout} title="Sign Out">
            Logout
          </button>
        </div>
      )}
    </aside>
  );
};

export default Navbar;
