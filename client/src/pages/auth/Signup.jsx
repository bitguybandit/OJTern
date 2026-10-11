import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const Signup = () => {
  const { signup, getDefaultRouteForRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Student'
  });
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

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!formData.role) {
      newErrors.role = 'Please select your role.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const user = await signup(formData);
      showToast(`Account created successfully! Welcome, ${user.Name}`, 'success');
      navigate(getDefaultRouteForRole(user.Role));
    } catch (err) {
      if (err.details) {
        setErrors(err.details);
      } else {
        showToast(err.message || 'Registration failed.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-narrow" style={{ paddingTop: '40px', paddingBottom: '60px' }}>
      <div className="card" style={{ maxWidth: '520px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h2 style={{ fontSize: '24px' }}>Create an Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
            Register as a Student, Industry Partner, or Coordinator
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">
              Full Name <span className="required-star">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              placeholder="e.g., Juan Dela Cruz"
            />
            {errors.name && <span className="form-error-msg">{errors.name}</span>}
          </div>

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
              placeholder="e.g., juan@example.com"
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
              placeholder="Minimum 6 characters"
            />
            {errors.password && <span className="form-error-msg">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Select Role <span className="required-star">*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={`form-control ${errors.role ? 'is-invalid' : ''}`}
            >
              <option value="Student">Student (OJT Trainee)</option>
              <option value="IndustryPartner">Industry Partner (Host Training Establishment)</option>
              <option value="OJTCoordinator">OJT Coordinator (Faculty / School Reviewer)</option>
              <option value="SchoolAdministrator">School Administrator</option>
            </select>
            {errors.role && <span className="form-error-msg">{errors.role}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '12px' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
