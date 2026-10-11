import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  MailIcon,
  LockIcon,
  EyeIcon,
  EyeOffIcon,
  UserIcon,
  SchoolIcon,
  ChevronDownIcon,
  CheckIcon,
  CapIcon,
  BuildingIcon,
  ClipboardIcon,
  ShieldUserIcon,
  SparkleIcon
} from './authIcons';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ACADEMIC_PROGRAMS = [
  { value: 'BSIT', label: 'BS Information Technology (BSIT - 486 hrs)' },
  { value: 'BSCS', label: 'BS Computer Science (BSCS - 486 hrs)' },
  { value: 'BSECE', label: 'BS Electronics Engineering (BSECE - 486 hrs)' },
  { value: 'BSIS', label: 'BS Information Systems (BSIS - 486 hrs)' }
];

const ACCOUNT_ROLES = [
  { value: 'Student', title: 'OJT Student', subtitle: 'Seeking Placement', Icon: CapIcon },
  { value: 'IndustryPartner', title: 'Industry Partner', subtitle: 'Hiring Interns', Icon: BuildingIcon }
];

const DEMO_PASSWORD = 'Password123!';

const DEMO_ACCOUNTS = [
  { email: 'student1@ojterm.test', title: 'Student 1', subtitle: 'OJT Student · BSIT', Icon: CapIcon, tone: 'blue' },
  { email: 'student2@ojterm.test', title: 'Student 2', subtitle: 'OJT Student · BSCS', Icon: CapIcon, tone: 'indigo' },
  { email: 'partner1@ojterm.test', title: 'Company A', subtitle: 'Partner · Verified', Icon: BuildingIcon, tone: 'green' },
  { email: 'partner2@ojterm.test', title: 'Company B', subtitle: 'Partner · Pending', Icon: BuildingIcon, tone: 'amber' },
  { email: 'coordinator@ojterm.test', title: 'Prof. A. Reyes', subtitle: 'OJT Coordinator', Icon: ClipboardIcon, tone: 'violet' },
  { email: 'admin@ojterm.test', title: 'System Admin', subtitle: 'School Administrator', Icon: ShieldUserIcon, tone: 'sky' }
];

/* ── Sign In panel ── */
const SignInPanel = () => {
  const { login, getDefaultRouteForRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};

    if (!form.email.trim()) {
      nextErrors.email = 'Email address is required.';
    } else if (!EMAIL_PATTERN.test(form.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (!form.password) {
      nextErrors.password = 'Password is required.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      const user = await login(form.email.trim(), form.password, remember);
      showToast(`Welcome back, ${user.Name}!`, 'success');
      navigate(getDefaultRouteForRole(user.Role));
    } catch (err) {
      if (err.details) {
        setErrors(err.details);
      } else {
        showToast(err.message || 'Login failed. Please check your credentials.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demo) => {
    setForm({ email: demo.email, password: DEMO_PASSWORD });
    setErrors({});
    setLoading(true);
    try {
      const user = await login(demo.email, DEMO_PASSWORD, remember);
      showToast(`Logged in as ${user.Role} (${user.Name})`, 'success');
      navigate(getDefaultRouteForRole(user.Role));
    } catch (err) {
      showToast(err.message || 'Quick login failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    showToast('Password resets are handled by your OJT coordinator or school administrator.', 'info');
  };

  return (
    <>
      <form onSubmit={handleSubmit} noValidate>
        <div className="auth-field">
          <label className="auth-label" htmlFor="signin-email">Email Address</label>
          <div className="auth-input-wrap">
            <MailIcon className="auth-input-icon" width={17} height={17} />
            <input
              id="signin-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={`auth-input ${errors.email ? 'has-error' : ''}`}
              placeholder="student@university.edu.ph"
              autoComplete="email"
            />
          </div>
          {errors.email && <span className="auth-error">{errors.email}</span>}
        </div>

        <div className="auth-field">
          <div className="auth-label-row">
            <label className="auth-label" htmlFor="signin-password">Password</label>
            <button type="button" className="auth-inline-link" onClick={handleForgotPassword}>
              Forgot password?
            </button>
          </div>
          <div className="auth-input-wrap">
            <LockIcon className="auth-input-icon" width={17} height={17} />
            <input
              id="signin-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              className={`auth-input has-eye ${errors.password ? 'has-error' : ''}`}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="auth-eye"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon width={17} height={17} /> : <EyeIcon width={17} height={17} />}
            </button>
          </div>
          {errors.password && <span className="auth-error">{errors.password}</span>}
        </div>

        <div className="auth-meta-row">
          <label className="auth-check">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span>Remember this session</span>
          </label>
          <span className="auth-meta-note">Secure OAuth2/JWT Ready</span>
        </div>

        <button type="submit" className="auth-submit" disabled={loading}>
          {loading ? (
            'Signing in…'
          ) : (
            <>
              Sign In to Dashboard
              <ArrowRightIcon width={16} height={16} />
            </>
          )}
        </button>
      </form>

      {/* Quick demo access */}
      <section className="auth-demo">
        <div className="auth-demo-head">
          <span className="auth-demo-title">Fast Demo Access (1-Click Login)</span>
          <span className="auth-demo-note">Instant Persona Switch</span>
        </div>
        <div className="auth-demo-grid">
          {DEMO_ACCOUNTS.map((demo) => {
            const DemoIcon = demo.Icon;
            return (
              <button
                key={demo.email}
                type="button"
                className="auth-demo-card"
                onClick={() => handleQuickLogin(demo)}
                disabled={loading}
                title={`Sign in as ${demo.email}`}
              >
                <span className={`auth-demo-icon tone-${demo.tone}`}>
                  <DemoIcon width={16} height={16} />
                </span>
                <span className="auth-demo-text">
                  <strong>{demo.title}</strong>
                  <small>{demo.subtitle}</small>
                </span>
              </button>
            );
          })}
        </div>
        <p className="auth-demo-password">
          Shared password for all demo accounts: <strong>{DEMO_PASSWORD}</strong>
        </p>
      </section>
    </>
  );
};

/* ── Create Account panel ── */
const CreateAccountPanel = () => {
  const { signup, getDefaultRouteForRole } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    role: 'Student',
    name: '',
    email: '',
    academicProgram: ACADEMIC_PROGRAMS[0].value,
    password: '',
    confirmPassword: ''
  });
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const isStudent = form.role === 'Student';

  const requirements = [
    { key: 'length', label: '8+ characters', met: form.password.length >= 8 },
    { key: 'uppercase', label: '1 uppercase letter', met: /[A-Z]/.test(form.password) },
    { key: 'number', label: '1 number', met: /\d/.test(form.password) },
    { key: 'match', label: 'Passwords match', met: form.password.length > 0 && form.password === form.confirmPassword }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleRoleSelect = (role) => {
    setForm((prev) => ({ ...prev, role }));
    if (errors.role) setErrors((prev) => ({ ...prev, role: '' }));
  };

  const handleAgreeChange = (e) => {
    setAgreed(e.target.checked);
    if (errors.agree) setErrors((prev) => ({ ...prev, agree: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = 'Full name is required.';
    }
    if (!form.email.trim()) {
      nextErrors.email = 'Email address is required.';
    } else if (!EMAIL_PATTERN.test(form.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (isStudent && !form.academicProgram) {
      nextErrors.academicProgram = 'Please select your academic degree program.';
    }
    if (!form.password) {
      nextErrors.password = 'Password is required.';
    } else if (form.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters.';
    } else if (!/[A-Z]/.test(form.password)) {
      nextErrors.password = 'Include at least 1 uppercase letter.';
    } else if (!/\d/.test(form.password)) {
      nextErrors.password = 'Include at least 1 number.';
    }
    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.';
    }
    if (!agreed) {
      nextErrors.agree = 'Please acknowledge the university policies to continue.';
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    try {
      const user = await signup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
        academicProgram: isStudent ? form.academicProgram : undefined
      });
      showToast(`Account created! Welcome, ${user.Name}`, 'success');
      navigate(getDefaultRouteForRole(user.Role));
    } catch (err) {
      if (err.details) {
        setErrors(err.details);
      } else {
        showToast(err.message || 'Registration failed. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="auth-field">
        <span className="auth-label">Select Your Account Role</span>
        <div className={`auth-role-grid ${errors.role ? 'has-error' : ''}`}>
          {ACCOUNT_ROLES.map((role) => {
            const RoleIcon = role.Icon;
            const selected = form.role === role.value;
            return (
              <button
                key={role.value}
                type="button"
                className={`auth-role-card ${selected ? 'is-selected' : ''}`}
                onClick={() => handleRoleSelect(role.value)}
                aria-pressed={selected}
              >
                <span className="auth-role-icon">
                  <RoleIcon width={17} height={17} />
                </span>
                <span className="auth-role-text">
                  <strong>{role.title}</strong>
                  <small>{role.subtitle}</small>
                </span>
              </button>
            );
          })}
        </div>
        {errors.role && <span className="auth-error">{errors.role}</span>}
      </div>

      <div className="auth-grid-2">
        <div className="auth-field">
          <label className="auth-label" htmlFor="signup-name">Full Name</label>
          <div className="auth-input-wrap">
            <UserIcon className="auth-input-icon" width={17} height={17} />
            <input
              id="signup-name"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`auth-input ${errors.name ? 'has-error' : ''}`}
              placeholder="e.g. Maria Santos"
              autoComplete="name"
            />
          </div>
          {errors.name && <span className="auth-error">{errors.name}</span>}
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="signup-email">Email Address</label>
          <div className="auth-input-wrap">
            <MailIcon className="auth-input-icon" width={17} height={17} />
            <input
              id="signup-email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={`auth-input ${errors.email ? 'has-error' : ''}`}
              placeholder="maria@student.edu.ph"
              autoComplete="email"
            />
          </div>
          {errors.email && <span className="auth-error">{errors.email}</span>}
        </div>
      </div>

      {isStudent && (
        <div className="auth-field">
          <label className="auth-label" htmlFor="signup-program">Academic Degree Program</label>
          <div className="auth-input-wrap">
            <SchoolIcon className="auth-input-icon" width={17} height={17} />
            <select
              id="signup-program"
              name="academicProgram"
              value={form.academicProgram}
              onChange={handleChange}
              className={`auth-input auth-select ${errors.academicProgram ? 'has-error' : ''}`}
            >
              {ACADEMIC_PROGRAMS.map((program) => (
                <option key={program.value} value={program.value}>
                  {program.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="auth-select-chevron" width={17} height={17} />
          </div>
          {errors.academicProgram && <span className="auth-error">{errors.academicProgram}</span>}
        </div>
      )}

      <div className="auth-grid-2">
        <div className="auth-field">
          <label className="auth-label" htmlFor="signup-password">Password</label>
          <div className="auth-input-wrap">
            <LockIcon className="auth-input-icon" width={17} height={17} />
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              className={`auth-input has-eye ${errors.password ? 'has-error' : ''}`}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="auth-eye"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOffIcon width={17} height={17} /> : <EyeIcon width={17} height={17} />}
            </button>
          </div>
          {errors.password && <span className="auth-error">{errors.password}</span>}
        </div>

        <div className="auth-field">
          <label className="auth-label" htmlFor="signup-confirm">Confirm Password</label>
          <div className="auth-input-wrap">
            <LockIcon className="auth-input-icon" width={17} height={17} />
            <input
              id="signup-confirm"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className={`auth-input has-eye ${errors.confirmPassword ? 'has-error' : ''}`}
              placeholder="Re-enter password"
              autoComplete="new-password"
            />
            <button
              type="button"
              className="auth-eye"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOffIcon width={17} height={17} /> : <EyeIcon width={17} height={17} />}
            </button>
          </div>
          {errors.confirmPassword && <span className="auth-error">{errors.confirmPassword}</span>}
        </div>
      </div>

      <div className="auth-requirements">
        <span className="auth-requirements-title">Security Requirements:</span>
        <ul className="auth-requirements-grid">
          {requirements.map((req) => (
            <li key={req.key} className={req.met ? 'is-met' : ''}>
              <CheckIcon width={13} height={13} />
              <span>{req.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <label className="auth-check auth-check-block">
        <input type="checkbox" checked={agreed} onChange={handleAgreeChange} />
        <span>
          I acknowledge and agree to the <span className="auth-accent-text">University OJT Guidelines</span>,{' '}
          <span className="auth-accent-text">Code of Conduct</span>, and{' '}
          <span className="auth-accent-text">Data Privacy Act</span> policies.
        </span>
      </label>
      {errors.agree && <span className="auth-error">{errors.agree}</span>}

      <button type="submit" className="auth-submit" style={{ marginTop: '16px' }} disabled={loading}>
        {loading ? (
          'Creating account…'
        ) : (
          <>
            Create Account &amp; Access Portal
            <ArrowRightIcon width={16} height={16} />
          </>
        )}
      </button>
    </form>
  );
};

/* ── Auth shell (header + tabs) ── */
const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isSignUp = location.pathname === '/signup';

  const goTo = (path) => {
    if (path !== location.pathname) navigate(path);
  };

  return (
    <div className="auth-page">
      <span className="auth-glow auth-glow-top" aria-hidden="true" />
      <span className="auth-glow auth-glow-bottom" aria-hidden="true" />

      <div className={`auth-shell ${isSignUp ? 'is-wide' : ''}`}>
        <div className="auth-header">
          <button
            type="button"
            className="auth-back"
            onClick={() => navigate('/')}
            aria-label="Back to landing page"
          >
            <ArrowLeftIcon width={20} height={20} />
          </button>

          <div className="auth-logo">
            <SparkleIcon width={26} height={26} />
          </div>
          <div className="auth-wordmark">
            <span className="auth-wordmark-text">OJTerm</span>
            <span className="auth-badge">Enterprise</span>
          </div>
          <p className="auth-tagline">
            On-the-Job Training &amp; Internship Placement Management Platform
          </p>
        </div>

        <div className="auth-card">
          <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
            <button
              type="button"
              role="tab"
              aria-selected={!isSignUp}
              className={`auth-tab ${!isSignUp ? 'is-active' : ''}`}
              onClick={() => goTo('/login')}
            >
              Sign In
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isSignUp}
              className={`auth-tab ${isSignUp ? 'is-active' : ''}`}
              onClick={() => goTo('/signup')}
            >
              Create Account
            </button>
          </div>

          {isSignUp ? <CreateAccountPanel /> : <SignInPanel />}
        </div>

        <p className="auth-footer">
          Office of Career Services &amp; Industry Linkages • University OJT Portal
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
