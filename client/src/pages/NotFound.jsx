import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="container" style={{ textAlign: 'center', padding: '100px 20px' }}>
      <div className="card" style={{ maxWidth: '460px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: '48px', color: 'var(--primary)', marginBottom: '8px' }}>404</h1>
        <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
          The requested OJTerm page does not exist or may have been moved.
        </p>
        <Link to="/" className="btn btn-primary">
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
