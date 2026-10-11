import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStatsApi, getCoordinatorApplicationsApi } from '../../api/coordinator.api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';

const Dashboard = () => {
  const [stats, setStats] = useState({
    pendingApplications: 0,
    approvedApplications: 0,
    placedApplications: 0,
    activePostings: 0,
    pendingCompanies: 0,
    verifiedCompanies: 0
  });
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, appsData] = await Promise.all([
          getDashboardStatsApi(),
          getCoordinatorApplicationsApi('Pending')
        ]);
        setStats(statsData);
        setRecentApps(appsData.slice(0, 5));
      } catch (err) {
        console.error('Failed to load coordinator stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading Coordinator Dashboard..." />;
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">OJT Coordinator Dashboard</h1>
          <p className="page-description">
            Monitor institutional placement metrics, review student endorsement documents, and verify industry partners.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/coordinator/applications" className="btn btn-primary">
            Review Applications Queue
          </Link>
          <Link to="/coordinator/report" className="btn btn-outline">
            Generate Report
          </Link>
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon kpi-warning">⏳</div>
          <div className="kpi-info-box">
            <span className="kpi-value">{stats.pendingApplications}</span>
            <span className="kpi-label">Pending Reviews</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon kpi-primary">📄</div>
          <div className="kpi-info-box">
            <span className="kpi-value">{stats.approvedApplications}</span>
            <span className="kpi-label">Approved & Endorsed</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon kpi-success">🎓</div>
          <div className="kpi-info-box">
            <span className="kpi-value">{stats.placedApplications}</span>
            <span className="kpi-label">Confirmed Placements</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon kpi-info">🏢</div>
          <div className="kpi-info-box">
            <span className="kpi-value">{stats.pendingCompanies}</span>
            <span className="kpi-label">Pending Partner Verifications</span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid-2" style={{ marginBottom: '32px' }}>
        <div className="card">
          <h3 className="card-title">Pending Student Applications</h3>
          <p className="card-subtitle">
            Students awaiting document verification and institutional endorsement
          </p>

          <div style={{ marginTop: '16px' }}>
            {recentApps.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '16px 0' }}>
                ✓ No pending applications. All submissions reviewed!
              </p>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Target Role</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentApps.map((app) => (
                      <tr key={app.ApplicationID}>
                        <td>
                          <strong>{app.studentProfile?.user?.Name}</strong>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {app.studentProfile?.AcademicProgram}
                          </div>
                        </td>
                        <td>{app.posting?.Title}</td>
                        <td>
                          <Link
                            to={`/coordinator/applications/${app.ApplicationID}`}
                            className="btn btn-primary btn-sm"
                          >
                            Review
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={{ marginTop: '16px', textAlign: 'right' }}>
            <Link to="/coordinator/applications" style={{ fontSize: '13px', fontWeight: 600 }}>
              View Complete Queue →
            </Link>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Quick Administrative Actions</h3>
          <p className="card-subtitle">Standard coordinator workflows</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
            <Link
              to="/coordinator/applications?status=Pending"
              className="card"
              style={{ padding: '16px', background: 'var(--bg-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <strong style={{ fontSize: '14px' }}>Review Pending Applications</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Inspect mandatory endorsement PDFs and approve or return for correction.
                </p>
              </div>
              <span style={{ fontSize: '18px' }}>→</span>
            </Link>

            <Link
              to="/coordinator/companies"
              className="card"
              style={{ padding: '16px', background: 'var(--bg-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <strong style={{ fontSize: '14px' }}>Verify Industry Partners ({stats.pendingCompanies} Pending)</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Accredit host establishments to allow posting internship slots.
                </p>
              </div>
              <span style={{ fontSize: '18px' }}>→</span>
            </Link>

            <Link
              to="/coordinator/report"
              className="card"
              style={{ padding: '16px', background: 'var(--bg-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div>
                <strong style={{ fontSize: '14px' }}>Generate Monthly Placement Report</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Aggregate placement counts grouped by company and program with CSV download.
                </p>
              </div>
              <span style={{ fontSize: '18px' }}>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
