import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPostingDetailApi } from '../../api/partner.api';
import { applyToPostingApi } from '../../api/student.api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const Apply = () => {
  const { postingId } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [posting, setPosting] = useState(null);
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [loadingPosting, setLoadingPosting] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchPosting = async () => {
      try {
        const data = await getPostingDetailApi(postingId);
        setPosting(data);
      } catch (err) {
        showToast('Internship posting not found.', 'error');
        navigate('/student/recommendations');
      } finally {
        setLoadingPosting(false);
      }
    };

    fetchPosting();
  }, [postingId, navigate, showToast]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFileError('');

    if (!selectedFile) {
      setFile(null);
      return;
    }

    // Validate mime type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(selectedFile.type)) {
      setFile(null);
      setFileError('Invalid file format. Only PDF, JPEG, and PNG files are accepted.');
      return;
    }

    // Validate size (10 MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      setFile(null);
      setFileError('File size exceeds the 10 MB limit.');
      return;
    }

    setFile(selectedFile);
  };

  const handleUseSamplePdf = async () => {
    try {
      // Create a mock blob from sample PDF string
      const pdfContent = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer\n<< /Size 4 /Root 1 0 R >>\nstartxref\n180\n%%EOF`;
      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const sampleFile = new File([blob], 'sample_endorsement.pdf', { type: 'application/pdf' });
      setFile(sampleFile);
      setFileError('');
      showToast('Sample endorsement PDF attached.', 'info');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // BR-01: Endorsement document is strictly required
    if (!file) {
      setFileError('Endorsement document is required before submission.');
      showToast('Endorsement document is required before submission.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('postingId', postingId);
      formData.append('document', file);

      await applyToPostingApi(formData);
      showToast('Application submitted successfully! Your endorsement document is pending review.', 'success');
      navigate('/student/applications');
    } catch (err) {
      if (err.details && err.details.document) {
        setFileError(err.details.document);
      } else {
        setFileError(err.message || 'Submission failed.');
      }
      showToast(err.message || 'Failed to submit application.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPosting) {
    return <LoadingSpinner text="Loading application requirements..." />;
  }

  return (
    <div className="container-narrow">
      <div style={{ marginBottom: '20px' }}>
        <Link to={`/student/postings/${postingId}`} className="btn btn-outline btn-sm">
          ← Back to Details
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '8px' }}>
              Official OJT Application
            </span>
            <h1 style={{ fontSize: '22px' }}>Apply for: {posting?.Title}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>
              Host Company: <strong>{posting?.company?.CompanyName}</strong> ({posting?.Location})
            </p>
          </div>
        </div>

        {/* BR-01 Policy Notice Banner */}
        <div style={{ background: '#fef3c7', border: '1px solid #fde68a', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>⚠️</span>
            <div>
              <h4 style={{ fontSize: '14px', color: '#92400e', marginBottom: '2px' }}>
                Business Rule BR-01: Mandatory Endorsement Document
              </h4>
              <p style={{ fontSize: '13px', color: '#b45309', lineHeight: '1.4' }}>
                In accordance with OJT guidelines, an application <strong>cannot be approved</strong> by the OJT Coordinator without a valid endorsement document (PDF, JPEG, or PNG up to 10 MB).
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">
              Upload Official Endorsement Document <span className="required-star">*</span>
            </label>

            <div
              style={{
                border: `2px dashed ${fileError ? 'var(--danger)' : 'var(--border-light)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '28px 20px',
                textAlign: 'center',
                background: 'var(--bg-subtle)',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={handleFileChange}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: 'pointer',
                  width: '100%',
                  height: '100%'
                }}
              />
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>📄</div>
              {file ? (
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '15px' }}>
                    {file.name}
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {(file.size / 1024).toFixed(1)} KB • Click to change document
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ fontWeight: 600, fontSize: '15px', color: 'var(--text-main)' }}>
                    Click or drag endorsement document here
                  </p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Accepted formats: PDF, JPEG, PNG (Maximum 10 MB)
                  </p>
                </div>
              )}
            </div>

            {fileError && <span className="form-error-msg">{fileError}</span>}

            {/* Quick Demo Attachment Button */}
            <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleUseSamplePdf}
                title="Attach pre-generated sample endorsement letter for demo testing"
              >
                📎 Attach Sample Demo Endorsement PDF
              </button>
            </div>
          </div>

          <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to={`/student/postings/${postingId}`} className="btn btn-secondary">
              Cancel
            </Link>

            <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
              {submitting ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Apply;
