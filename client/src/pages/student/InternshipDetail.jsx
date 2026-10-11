import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPostingDetailApi } from '../../api/partner.api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';

const InternshipDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [posting, setPosting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchPosting = async () => {
      try {
        const data = await getPostingDetailApi(id);
        setPosting(data);
      } catch (err) {
        setErrorMsg(err.message || 'Failed to load internship details.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosting();
  }, [id]);

  if (loading) {
    return <LoadingSpinner text="Loading internship details..." />;
  }

  if (errorMsg || !posting) {
    return (
      <div className="container-narrow">
        <div className="card" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h3>Internship Not Found</h3>
          <p style={{ color: 'var(--text-muted)', margin: '12px 0 20px' }}>
            {errorMsg || 'The requested internship posting is unavailable.'}
          </p>
          <Link to="/student/recommendations" className="btn btn-secondary">
            Back to Recommendations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-narrow">
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline btn-sm">
          ← Back
        </button>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              <Badge status={posting.Status} />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Posted on {new Date(posting.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 style={{ fontSize: '24px' }}>{posting.Title}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginTop: '4px' }}>
              🏢 {posting.company?.CompanyName} • 📍 {posting.Location}
            </p>
          </div>

          <Link to={`/student/apply/${posting.PostingID}`} className="btn btn-primary btn-lg">
            Apply Now
          </Link>
        </div>

        {/* Company Details Box */}
        <div style={{ background: 'var(--bg-subtle)', padding: '16px 20px', borderRadius: 'var(--radius-md)', margin: '20px 0' }}>
          <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>About the Host Company</h4>
          <p style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '4px' }}>
            <strong>Industry:</strong> {posting.company?.Industry}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-main)', marginBottom: '4px' }}>
            <strong>Office Address:</strong> {posting.company?.OfficeAddress}
          </p>
          <p style={{ fontSize: '13px', color: 'var(--text-main)' }}>
            <strong>Contact:</strong> {posting.company?.ContactPerson} ({posting.company?.ContactEmail})
          </p>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Internship Description & Scope</h3>
          <p style={{ fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
            {posting.Description}
          </p>
        </div>

        {/* Requirements Grid */}
        <div className="grid-2" style={{ marginBottom: '28px' }}>
          <div style={{ border: '1px solid var(--border-light)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Academic Program
            </span>
            <p style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>
              {posting.RequiredProgram}
            </p>
          </div>

          <div style={{ border: '1px solid var(--border-light)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Available Slots
            </span>
            <p style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>
              {posting.Slots} Trainee Slots
            </p>
          </div>

          <div style={{ border: '1px solid var(--border-light)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Location / Setup
            </span>
            <p style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>
              {posting.Location}
            </p>
          </div>

          <div style={{ border: '1px solid var(--border-light)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Application Deadline
            </span>
            <p style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px' }}>
              {posting.ApplicationDeadline}
            </p>
          </div>
        </div>

        {/* Required Skills */}
        {posting.skills && posting.skills.length > 0 && (
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Required Technical Skills</h3>
            <div className="skill-chips-container">
              {posting.skills.map((s) => (
                <span key={s.SkillID} className="badge badge-default" style={{ padding: '6px 12px', fontSize: '13px' }}>
                  {s.SkillName}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <Link to={`/student/apply/${posting.PostingID}`} className="btn btn-primary btn-lg">
            Proceed to Application Form
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InternshipDetail;
