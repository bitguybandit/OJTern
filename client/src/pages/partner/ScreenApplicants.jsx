import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getApprovedApplicantsApi, decideApplicantApi, getPostingDetailApi } from '../../api/partner.api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';

const ScreenApplicants = () => {
  const { id } = useParams();
  const { showToast } = useToast();

  const [posting, setPosting] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [selectedDocUrl, setSelectedDocUrl] = useState(null);

  const loadApplicants = async () => {
    try {
      const [postingData, list] = await Promise.all([
        getPostingDetailApi(id),
        getApprovedApplicantsApi(id)
      ]);
      setPosting(postingData);
      setApplicants(list);
    } catch (err) {
      showToast(err.message || 'Failed to load approved applicants.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplicants();
  }, [id]);

  const handleDecision = async (applicationId, decision) => {
    setProcessingId(applicationId);
    try {
      await decideApplicantApi(applicationId, decision);
      showToast(
        decision === 'Accept'
          ? 'Applicant ACCEPTED and placed successfully!'
          : 'Applicant decision updated.',
        decision === 'Accept' ? 'success' : 'info'
      );
      await loadApplicants();
    } catch (err) {
      showToast(err.message || 'Failed to submit decision.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading endorsed candidates..." />;
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '16px' }}>
        <Link to="/partner/postings" className="btn btn-outline btn-sm">
          ← Back to All Postings
        </Link>
      </div>

      <div className="page-header">
        <div>
          <h1 className="page-title">Candidate Screening: {posting?.Title}</h1>
          <p className="page-description">
            Available Slots: <strong>{posting?.Slots}</strong> • Target: <strong>{posting?.RequiredProgram}</strong>
          </p>
        </div>
      </div>

      {/* BR-03 Notice */}
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '14px 18px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
        <p style={{ color: '#166534', fontSize: '13px' }}>
          🔒 <strong>Business Rule BR-03 Enforced:</strong> Industry partners only view applicants whose endorsement documents and eligibility have been verified and approved by the OJT Coordinator. Raw unverified submissions are automatically shielded.
        </p>
      </div>

      {applicants.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>👥</div>
          <h3>No Coordinator-Approved Applicants Yet</h3>
          <p style={{ color: 'var(--text-muted)', margin: '8px 0 0' }}>
            When students submit applications with endorsement letters and the OJT Coordinator approves them, they will appear here for your interview and acceptance decision.
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Student Candidate</th>
                <th>Academic Program</th>
                <th>Technical Skills</th>
                <th>Date Endorsed</th>
                <th>Status / Decision</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((app) => {
                const student = app.studentProfile;
                const user = student?.user;
                const isDecided = app.Status === 'Placed' || app.Status === 'RejectedByPartner';

                return (
                  <tr key={app.ApplicationID}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {user?.Name || 'Student Trainee'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        {user?.Email} • {student?.PreferredLocation}
                      </div>
                    </td>
                    <td>
                      <strong>{student?.AcademicProgram}</strong> ({student?.YearLevel})
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '240px' }}>
                        {student?.skills && student.skills.length > 0 ? (
                          student.skills.map((s) => (
                            <span key={s.SkillID} className="badge badge-default" style={{ fontSize: '11px', padding: '2px 8px' }}>
                              {s.SkillName}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>—</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px' }}>
                        {new Date(app.DateReviewed || app.DateSubmitted).toLocaleDateString()}
                      </span>
                    </td>
                    <td>
                      <Badge status={app.Status} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        {app.endorsementDocument && (
                          <button
                            type="button"
                            onClick={() => setSelectedDocUrl(`/api/applications/${app.ApplicationID}/document`)}
                            className="btn btn-outline btn-sm"
                            title="Inspect official endorsement document"
                          >
                            📄 Doc
                          </button>
                        )}

                        {!isDecided ? (
                          <>
                            <button
                              className="btn btn-success btn-sm"
                              disabled={processingId === app.ApplicationID}
                              onClick={() => handleDecision(app.ApplicationID, 'Accept')}
                            >
                              ✓ Accept (Place)
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              disabled={processingId === app.ApplicationID}
                              onClick={() => handleDecision(app.ApplicationID, 'Reject')}
                            >
                              ✕ Reject
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            Decision: {app.PartnerDecision}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Document Preview Modal */}
      <Modal
        isOpen={!!selectedDocUrl}
        onClose={() => setSelectedDocUrl(null)}
        title="Student Endorsement Document Preview"
        footer={
          <button className="btn btn-secondary" onClick={() => setSelectedDocUrl(null)}>
            Close Viewer
          </button>
        }
      >
        {selectedDocUrl && (
          <div className="doc-preview-card">
            <div className="doc-preview-toolbar">
              <span>Verified Endorsement Document</span>
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
              title="Endorsement Document"
              className="doc-preview-frame"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ScreenApplicants;
