import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated, getDefaultRouteForRole } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner text="Authenticating session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.Role)) {
    return (
      <div className="container" style={{ paddingTop: '80px', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Access Restricted</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
            Your account role (<strong>{user.Role}</strong>) does not have permission to view this page.
          </p>
          <Link to={getDefaultRouteForRole(user.Role)} className="btn btn-primary">
            Return to Authorized Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
