import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getApplicationDetailApi, reviewApplicationApi } from '../../api/coordinator.api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';

const ApplicationReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  // Review Action Modal
  const [activeModalAction, setActiveModalAction] = useState(null); // 'Approve' | 'Reject' | 'ReturnForCorrection'
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadDetail = async () => {
    try {
      const data = await getApplicationDetailApi(id);
      setApplication(data);
    } catch (err) {
      showToast(err.message || 'Failed to load application detail.', 'error');
      navigate('/coordinator/applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  const handleOpenActionModal = (action) => {
    setActiveModalAction(action);
    setReviewComment('');
  };

  const handleSubmitDecision = async () => {
    if (!activeModalAction) return;

    // BR-01 Client check
    if (activeModalAction === 'Approve' && !application?.endorsementDocument) {
      showToast('Cannot approve application: Endorsement document is missing (BR-01).', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      await reviewApplicationApi(id, {
        action: activeModalAction,
        comment: reviewComment.trim()
      });

      showToast(`Application successfully updated: ${activeModalAction}`, 'success');
      setActiveModalAction(null);
      await loadDetail();
    } catch (err) {
      showToast(err.message || 'Failed to update application review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading candidate application details..." />;
  }

  if (!application) {
    return null;
  }

  const student = application.studentProfile;
  const posting = application.posting;
  const doc = application.endorsementDocument;
  const hasDoc = !!doc;
  const docUrl = `/api/applications/${application.ApplicationID}/document`;

  return (
    <div className="container">
      <div style={{ marginBottom: '16px' }}>
        <Link to="/coordinator/applications" className="btn btn-outline btn-sm">
          ← Back to Queue
        </Link>
      </div>

      <div className="page-header">
        <div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
            <Badge status={application.Status} />
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Submitted on {new Date(application.DateSubmitted).toLocaleDateString()}
            </span>
          </div>
          <h1 className="page-title">Application #{application.ApplicationID}: {student?.user?.Name}</h1>
          <p className="page-description">
            Applying for <strong>{posting?.Title}</strong> at <strong>{posting?.company?.CompanyName}</strong>
          </p>
        </div>

        {/* Action Buttons Toolbar */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className="btn btn-warning"
            onClick={() => handleOpenActionModal('ReturnForCorrection')}
          >
            ↺ Return for Correction
          </button>
          <button
            className="btn btn-danger"
            onClick={() => handleOpenActionModal('Reject')}
          >
            ✕ Reject
          </button>
          <button
            className="btn btn-success"
            onClick={() => handleOpenActionModal('Approve')}
            disabled={!hasDoc}
            title={!hasDoc ? 'BR-01: Endorsement document is mandatory to approve' : 'Approve application'}
          >
            ✓ Approve Application
          </button>
        </div>
      </div>

      {/* BR-01 Warning Alert if document is missing */}
      {!hasDoc && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
          <p style={{ color: '#991b1b', fontSize: '14px' }}>
            ⛔ <strong>Business Rule BR-01 Enforcement:</strong> This application has no uploaded endorsement document. The <strong>Approve</strong> button has been disabled. You may Return for Correction or Reject.
          </p>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid-2" style={{ marginBottom: '28px' }}>
        {/* Student Profile Overview */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '16px' }}>🎓 Student Trainee Profile</h3>
          <p style={{ fontSize: '14px', marginBottom: '6px' }}>
            <strong>Full Name:</strong> {student?.user?.Name}
          </p>
          <p style={{ fontSize: '14px', marginBottom: '6px' }}>
            <strong>Email:</strong> {student?.user?.Email}
          </p>
          <p style={{ fontSize: '14px', marginBottom: '6px' }}>
            <strong>Academic Program:</strong> {student?.AcademicProgram} ({student?.YearLevel})
          </p>
          <p style={{ fontSize: '14px', marginBottom: '6px' }}>
            <strong>Preferred Location:</strong> {student?.PreferredLocation}
          </p>
          {student?.Interests && (
            <p style={{ fontSize: '14px', marginBottom: '12px' }}>
              <strong>Career Interests:</strong> {student?.Interests}
            </p>
          )}

          <div style={{ marginTop: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Student Skills:</span>
            <div className="skill-chips-container" style={{ marginTop: '6px' }}>
              {student?.skills && student.skills.length > 0 ? (
                student.skills.map((s) => (
                  <span key={s.SkillID} className="badge badge-default">
                    {s.SkillName}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No skills listed</span>
              )}
            </div>
          </div>
        </div>

        {/* Internship Posting Overview */}
        <div className="card">
          <h3 className="card-title" style={{ marginBottom: '16px' }}>🏢 Internship Opportunity Details</h3>
          <p style={{ fontSize: '14px', marginBottom: '6px' }}>
            <strong>Role:</strong> {posting?.Title}
          </p>
          <p style={{ fontSize: '14px', marginBottom: '6px' }}>
            <strong>Host Company:</strong> {posting?.company?.CompanyName}
          </p>
          <p style={{ fontSize: '14px', marginBottom: '6px' }}>
            <strong>Target Program:</strong> {posting?.RequiredProgram}
          </p>
          <p style={{ fontSize: '14px', marginBottom: '6px' }}>
            <strong>Location:</strong> {posting?.Location}
          </p>
          <p style={{ fontSize: '14px', marginBottom: '12px' }}>
            <strong>Slots:</strong> {posting?.Slots} Trainees • Deadline: {posting?.ApplicationDeadline}
          </p>

          <div style={{ marginTop: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Prerequisite Skills:</span>
            <div className="skill-chips-container" style={{ marginTop: '6px' }}>
              {posting?.skills && posting.skills.length > 0 ? (
                posting.skills.map((s) => (
                  <span key={s.SkillID} className="badge badge-default">
                    {s.SkillName}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>None specified</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Endorsement Document Embedded Preview */}
      <div className="card" style={{ marginBottom: '32px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">📄 Official Endorsement Document</h3>
            <p className="card-subtitle">
              Verify the student's endorsement letter issued by the college before approving.
            </p>
          </div>
          {hasDoc && (
            <a
              href={docUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-outline btn-sm"
            >
              Open in New Window ↗
            </a>
          )}
        </div>

        {hasDoc ? (
          <div className="doc-preview-card">
            <div className="doc-preview-toolbar">
              <span>File: {doc.FileName} ({(doc.FileSize / 1024).toFixed(1)} KB)</span>
              <span>Uploaded: {new Date(doc.UploadDate).toLocaleString()}</span>
            </div>
            <iframe
              src={docUrl}
              title="Official Endorsement Letter"
              className="doc-preview-frame"
            />
          </div>
        ) : (
          <div style={{ padding: '36px', textAlign: 'center', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
            <p style={{ color: 'var(--danger)', fontWeight: 600 }}>
              No endorsement document attached to this application.
            </p>
          </div>
        )}
      </div>

      {/* Decision Modal */}
      <Modal
        isOpen={!!activeModalAction}
        onClose={() => setActiveModalAction(null)}
        title={`Confirm Decision: ${activeModalAction}`}
        footer={
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-secondary" onClick={() => setActiveModalAction(null)}>
              Cancel
            </button>
            <button
              className={`btn ${activeModalAction === 'Approve' ? 'btn-success' : activeModalAction === 'Reject' ? 'btn-danger' : 'btn-warning'}`}
              onClick={handleSubmitDecision}
              disabled={submittingReview}
            >
              {submittingReview ? 'Processing...' : `Confirm ${activeModalAction}`}
            </button>
          </div>
        }
      >
        <p style={{ fontSize: '14px', marginBottom: '16px' }}>
          {activeModalAction === 'Approve' &&
            'Approving this application will endorse the student to the industry partner for candidate screening.'}
          {activeModalAction === 'Reject' &&
            'Rejecting will mark the application as rejected and notify the student.'}
          {activeModalAction === 'ReturnForCorrection' &&
            'Returning for correction will notify the student to resubmit their endorsement document.'}
        </p>

        <div className="form-group">
          <label className="form-label">
            Coordinator Remarks / Feedback {activeModalAction !== 'Approve' && <span className="required-star">*</span>}
          </label>
          <textarea
            rows="3"
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Add comments or instructions for the student..."
            className="form-control"
          />
        </div>
      </Modal>
    </div>
  );
};

export default ApplicationReview;
