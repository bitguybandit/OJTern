import React from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="landing-page">
      {/* ── Landing Navbar ── */}
      <header className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-brand">
            <div className="brand-logo-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L1 7l11 5 9-4.09V17h2V7L12 2zm0 8.9L4.24 7.5 12 4l7.76 3.5L12 10.9zm0 3.1L3 9v8l9 5 9-5V9l-9 5z" />
              </svg>
            </div>
            <span className="landing-brand-title">OJTern</span>
          </Link>
          <nav className="landing-nav-links">
            <Link to="/login" className="landing-nav-signin">Sign In</Link>
            <Link to="/signup" className="landing-nav-cta">Get Started</Link>
          </nav>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section className="landing-hero">
        {/* Ambient glow effects */}
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />

        <div className="hero-content">
          <div className="hero-badge">
            <span className="hero-badge-icon">🚀</span>
            <span>The Next-Gen OJT Platform</span>
          </div>

          <h1 className="hero-heading">
            Bridge the Gap Between{' '}
            <span className="hero-gradient-text">Campus and Career</span>
          </h1>

          <p className="hero-sub">
            Seamlessly connect students, university coordinators, and industry
            partners in one unified internship management ecosystem.
          </p>

          <div className="hero-actions">
            <Link to="/login" className="hero-btn hero-btn-primary">
              Join as Student
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
            <Link to="/login" className="hero-btn hero-btn-secondary">
              Partner with us
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section className="landing-features">
        <div className="features-grid">
          {/* Card 1 – Students */}
          <div className="feature-card">
            <div className="feature-icon feature-icon-student">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c0 1.657 2.686 3 6 3s6-1.343 6-3v-5" />
              </svg>
            </div>
            <h3 className="feature-title">For Students</h3>
            <p className="feature-desc">
              Find the perfect internship that matches your skills and track your OJT hours effortlessly.
            </p>
          </div>

          {/* Card 2 – Partners */}
          <div className="feature-card">
            <div className="feature-icon feature-icon-partner">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
                <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
                <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
                <path d="M10 6h4" /><path d="M10 10h4" /><path d="M10 14h4" /><path d="M10 18h4" />
              </svg>
            </div>
            <h3 className="feature-title">For Partners</h3>
            <p className="feature-desc">
              Discover top university talent and manage applications through a streamlined dashboard.
            </p>
          </div>

          {/* Card 3 – Coordinators */}
          <div className="feature-card">
            <div className="feature-icon feature-icon-coordinator">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
            <h3 className="feature-title">For Coordinators</h3>
            <p className="feature-desc">
              Monitor student progress, verify endorsements, and generate comprehensive placement reports.
            </p>
          </div>
        </div>
      </section>

      {/* ── What is OJTern Section ── */}
      <section className="landing-about">
        <div className="about-card">
          <div className="about-header">
            <span className="about-icon-wrap">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4" /><path d="M12 8h.01" />
              </svg>
            </span>
            <h2 className="about-title">What is OJTern?</h2>
          </div>

          <p className="about-description">
            OJTern is a centralized On-the-Job Training (OJT) and internship platform built specifically to
            eliminate the friction between university programs and industry demands.
          </p>

          <ul className="about-features">
            <li>
              <span className="about-check">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </span>
              <span>
                <strong>Automated Matching:</strong> Intelligent skill-based recommendations pair the right students with the right company roles.
              </span>
            </li>
            <li>
              <span className="about-check">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </span>
              <span>
                <strong>Unified Workflow:</strong> From endorsement validation to final evaluations, everything is tracked transparently in real-time.
              </span>
            </li>
            <li>
              <span className="about-check">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </span>
              <span>
                <strong>Compliance First:</strong> Designed with university guidelines in mind, ensuring all internships meet academic requirements and hours.
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <p>© 2026 OJTern — Team DUTERTECH, Section 1 · ITPD4 Software Engineering Prefinal</p>
      </footer>
    </div>
  );
};

export default Landing;
