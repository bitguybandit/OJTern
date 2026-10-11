import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStudentProfileApi, getRecommendationsApi } from '../../api/student.api';
import LoadingSpinner from '../../components/LoadingSpinner';

const Recommendations = () => {
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const studentProfile = await getStudentProfileApi();
        setProfile(studentProfile);

        if (studentProfile && studentProfile.ProfileID) {
          const recs = await getRecommendationsApi(studentProfile.ProfileID);
          setRecommendations(recs);
        }
      } catch (err) {
        if (err.code === 'PROFILE_NOT_FOUND') {
          setErrorMsg('PROFILE_REQUIRED');
        } else {
          setErrorMsg(err.message || 'Failed to compute recommendations.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Computing rule-based recommendations..." />;
  }

  if (errorMsg === 'PROFILE_REQUIRED' || !profile) {
    return (
      <div className="container-narrow">
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
          <h2 style={{ fontSize: '22px', marginBottom: '8px' }}>Build Your Student Profile First</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', maxWidth: '440px', margin: '0 auto 24px' }}>
            To generate personalized, rule-based recommendations based on your academic program, skills, and preferred location, please complete your profile.
          </p>
          <Link to="/student/profile" className="btn btn-primary">
            Complete Profile Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ranked Internship Recommendations</h1>
          <p className="page-description">
            Rule-based matches scored deterministically for <strong>{profile.AcademicProgram}</strong> ({profile.PreferredLocation})
          </p>
        </div>
        <Link to="/student/profile" className="btn btn-outline btn-sm">
          Update Skills & Location
        </Link>
      </div>

      {recommendations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            No active internship postings met the minimum recommendation threshold (20% score) for your current profile.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
            Try adding more skills or updating your preferred location in your profile.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {recommendations.map(({ posting, score, reasons }, idx) => {
            const scoreClass =
              score >= 80 ? 'match-score-high' : score >= 50 ? 'match-score-medium' : 'match-score-low';

            return (
              <div key={posting.PostingID} className="card" style={{ position: 'relative' }}>
                <div className="card-header" style={{ marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
                        #{idx + 1} Best Match
                      </span>
                      <span className={`match-score-badge ${scoreClass}`}>
                        ★ {score}% Match
                      </span>
                    </div>
                    <h2 style={{ fontSize: '20px' }}>{posting.Title}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '2px' }}>
                      🏢 {posting.company ? posting.company.CompanyName : 'Industry Partner'} • 📍 {posting.Location}
                    </p>
                  </div>

                  <Link to={`/student/postings/${posting.PostingID}`} className="btn btn-primary">
                    View & Apply
                  </Link>
                </div>

                <p style={{ fontSize: '14px', color: 'var(--text-main)', marginBottom: '16px', lineHeight: '1.5' }}>
                  {posting.Description}
                </p>

                {/* Match Reasons Breakdown (FR-04) */}
                <div style={{ background: 'var(--bg-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    Match Reasons Breakdown:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {reasons.map((r, i) => (
                      <span
                        key={i}
                        style={{
                          background: 'white',
                          border: '1px solid var(--border-light)',
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#334155'
                        }}
                      >
                        ✓ {r}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Posting Metadata Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <div>
                    <span>Available Slots: <strong>{posting.Slots}</strong></span> •{' '}
                    <span>Required Program: <strong>{posting.RequiredProgram}</strong></span> •{' '}
                    <span>Deadline: <strong>{posting.ApplicationDeadline}</strong></span>
                  </div>

                  {posting.skills && posting.skills.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px' }}>Required Skills:</span>
                      {posting.skills.map((sk) => (
                        <span key={sk.SkillID} className="badge badge-default">
                          {sk.SkillName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
