import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Login = () => {
  const { login, getDefaultRouteForRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const user = await login(formData.email.trim(), formData.password);
      showToast(`Welcome back, ${user.Name}!`, 'success');
      navigate(getDefaultRouteForRole(user.Role));
    } catch (err) {
      if (err.details) {
        setErrors(err.details);
      } else {
        showToast(err.message || 'Login failed. Please check credentials.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (email, password = 'Password123!') => {
    setFormData({ email, password });
    setErrors({});
    setLoading(true);
    try {
      const user = await login(email, password);
      showToast(`Logged in as ${user.Role} (${user.Name})`, 'success');
      navigate(getDefaultRouteForRole(user.Role));
    } catch (err) {
      showToast(err.message || 'Quick login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-narrow" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div className="card" style={{ maxWidth: '480px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="brand-logo-icon" style={{ margin: '0 auto 12px', width: '48px', height: '48px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L1 7l11 5 9-4.09V17h2V7L12 2zm0 8.9L4.24 7.5 12 4l7.76 3.5L12 10.9zm0 3.1L3 9v8l9 5 9-5V9l-9 5z" />
            </svg>
          </div>
          <h2 style={{ fontSize: '24px' }}>Sign in to OJTerm</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Smart OJT Matching & Recommendation Platform
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">
              Email Address <span className="required-star">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="e.g., student1@ojterm.test"
              autoComplete="email"
            />
            {errors.email && <span className="form-error-msg">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Password <span className="required-star">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            {errors.password && <span className="form-error-msg">{errors.password}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/signup" style={{ fontWeight: 600 }}>
            Create one here
          </Link>
        </div>

        {/* Demo Quick Logins for Instant Evaluation */}
        <div style={{ marginTop: '32px', paddingTop: '20px', borderTop: '1px solid var(--border-light)' }}>
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', textAlign: 'center' }}>
            Quick Demo Logins (Password: Password123!)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('student1@ojterm.test')}
            >
              🎓 Student 1 (BSIT)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('student2@ojterm.test')}
            >
              🎓 Student 2 (BSCS)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('partner1@ojterm.test')}
            >
              🏢 Company A (Verified)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('partner2@ojterm.test')}
            >
              🏢 Company B (Pending)
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('coordinator@ojterm.test')}
            >
              📋 OJT Coordinator
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => handleQuickLogin('admin@ojterm.test')}
            >
              ⚙️ Administrator
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
