import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyApplicationsApi } from '../../api/student.api';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocUrl, setSelectedDocUrl] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const list = await getMyApplicationsApi();
        setApplications(list);
      } catch (err) {
        console.error('Failed to load applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading your applications..." />;
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My OJT Applications</h1>
          <p className="page-description">
            Track your internship submissions, endorsement documents, and coordinator approval statuses.
          </p>
        </div>
        <Link to="/student/recommendations" className="btn btn-primary">
          Browse More Matches
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📂</div>
          <h3>No Applications Submitted Yet</h3>
          <p style={{ color: 'var(--text-muted)', margin: '8px 0 24px' }}>
            Explore your recommended internships and apply with your endorsement document.
          </p>
          <Link to="/student/recommendations" className="btn btn-primary">
            View Recommendations
          </Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Internship Role & Company</th>
                <th>Date Submitted</th>
                <th>Status</th>
                <th>Coordinator Feedback</th>
                <th>Partner Decision</th>
                <th>Endorsement Doc</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.ApplicationID}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {app.posting?.Title}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                      🏢 {app.posting?.company?.CompanyName} • 📍 {app.posting?.Location}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '13px' }}>
                      {new Date(app.DateSubmitted).toLocaleDateString()}
                    </span>
                  </td>
                  <td>
                    <Badge status={app.Status} />
                  </td>
                  <td>
                    {app.FeedbackComment ? (
                      <span style={{ fontSize: '13px', color: 'var(--text-main)' }}>
                        "{app.FeedbackComment}"
                      </span>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {app.Status === 'Pending' ? 'Awaiting review' : 'No comments'}
                      </span>
                    )}
                  </td>
                  <td>
                    {app.PartnerDecision === 'Accepted' && (
                      <span className="badge badge-success">Accepted (Placed)</span>
                    )}
                    {app.PartnerDecision === 'Rejected' && (
                      <span className="badge badge-danger">Not Selected</span>
                    )}
                    {app.PartnerDecision === 'None' && (
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {app.Status === 'Approved' ? 'In Partner Review' : '—'}
                      </span>
                    )}
                  </td>
                  <td>
                    {app.endorsementDocument ? (
                      <button
                        type="button"
                        onClick={() => setSelectedDocUrl(`/api/applications/${app.ApplicationID}/document`)}
                        className="btn btn-outline btn-sm"
                      >
                        📄 View Document
                      </button>
                    ) : (
                      <span style={{ color: 'var(--danger)', fontSize: '12px' }}>Missing Document</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Document Preview Modal */}
      <Modal
        isOpen={!!selectedDocUrl}
        onClose={() => setSelectedDocUrl(null)}
        title="Endorsement Document Preview"
        footer={
          <button className="btn btn-secondary" onClick={() => setSelectedDocUrl(null)}>
            Close Preview
          </button>
        }
      >
        {selectedDocUrl && (
          <div className="doc-preview-card">
            <div className="doc-preview-toolbar">
              <span>Official Document Viewer</span>
              <a
                href={selectedDocUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline btn-sm"
                style={{ color: 'white', borderColor: '#475569' }}
              >
                Open in New Tab ↗
              </a>
            </div>
            <iframe
              src={selectedDocUrl}
              title="Endorsement Preview"
              className="doc-preview-frame"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyApplications;
