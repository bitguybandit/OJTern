import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyPostingsApi, createPostingApi, getCompanyProfileApi } from '../../api/partner.api';
import { getSkillsApi } from '../../api/student.api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';

const PostingList = () => {
  const { showToast } = useToast();

  const [postings, setPostings] = useState([]);
  const [company, setCompany] = useState(null);
  const [availableSkills, setAvailableSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal & Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    slots: 2,
    requiredProgram: 'BSIT',
    location: '',
    applicationDeadline: '',
    skills: []
  });
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const [postingsData, profileData, skillsData] = await Promise.all([
        getMyPostingsApi().catch(() => []),
        getCompanyProfileApi().catch(() => null),
        getSkillsApi().catch(() => [])
      ]);
      setPostings(postingsData);
      setCompany(profileData);
      setAvailableSkills(skillsData);
      if (profileData && profileData.OfficeAddress) {
        setFormData((prev) => ({ ...prev, location: profileData.OfficeAddress }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const toggleSkill = (skillName) => {
    setSelectedSkills((prev) =>
      prev.includes(skillName) ? prev.filter((s) => s !== skillName) : [...prev, skillName]
    );
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!formData.title.trim()) errors.title = 'Title is required.';
    if (!formData.description.trim()) errors.description = 'Description is required.';
    const slotsNum = parseInt(formData.slots, 10);
    if (isNaN(slotsNum) || slotsNum <= 0) errors.slots = 'Slots must be at least 1.';
    if (!formData.requiredProgram.trim()) errors.requiredProgram = 'Required program is required.';
    if (!formData.location.trim()) errors.location = 'Location is required.';
    if (!formData.applicationDeadline) {
      errors.applicationDeadline = 'Application deadline is required.';
    } else {
      const dl = new Date(formData.applicationDeadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isNaN(dl.getTime()) || dl <= today) {
        errors.applicationDeadline = 'Application deadline must be a future date.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      await createPostingApi({
        ...formData,
        slots: slotsNum,
        skills: selectedSkills
      });
      showToast('Internship opportunity published successfully!', 'success');
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        slots: 2,
        requiredProgram: 'BSIT',
        location: company?.OfficeAddress || '',
        applicationDeadline: '',
        skills: []
      });
      setSelectedSkills([]);
      await loadData();
    } catch (err) {
      if (err.details) {
        setFormErrors(err.details);
      }
      showToast(err.message || 'Failed to create posting.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading internship postings..." />;
  }

  const isVerified = company?.VerificationStatus === 'Verified';

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Internship Postings</h1>
          <p className="page-description">
            Manage your company's active openings and screen coordinator-approved applicants.
          </p>
        </div>

        <div>
          <button
            className="btn btn-primary"
            onClick={() => setShowCreateModal(true)}
            disabled={!isVerified}
            title={!isVerified ? 'Your company must be verified by a coordinator before posting' : ''}
          >
            + Post New Internship Slot
          </button>
        </div>
      </div>

      {!isVerified && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
          <p style={{ color: '#92400e', fontSize: '14px' }}>
            🔒 <strong>Posting Locked:</strong> Your company verification status is <strong>{company?.VerificationStatus || 'Unregistered'}</strong>. Postings can only be published once approved by the OJT Coordinator.
          </p>
        </div>
      )}

      {postings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
          <h3>No Internship Postings Yet</h3>
          <p style={{ color: 'var(--text-muted)', margin: '8px 0 20px' }}>
            {isVerified
              ? 'Publish your first opening to start receiving endorsed applications.'
              : 'Once verified by the school coordinator, you can create internship slots here.'}
          </p>
          {isVerified && (
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
              Create Your First Posting
            </button>
          )}
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Title & Program</th>
                <th>Slots</th>
                <th>Location</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {postings.map((p) => (
                <tr key={p.PostingID}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{p.Title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Target Program: <strong>{p.RequiredProgram}</strong>
                    </div>
                  </td>
                  <td>
                    <strong>{p.Slots}</strong> slots
                  </td>
                  <td>{p.Location}</td>
                  <td>{p.ApplicationDeadline}</td>
                  <td>
                    <Badge status={p.Status} />
                  </td>
                  <td>
                    <Link
                      to={`/partner/postings/${p.PostingID}/screen`}
                      className="btn btn-primary btn-sm"
                    >
                      👥 Screen Applicants
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Posting Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Post New Internship Opportunity"
      >
        <form onSubmit={handleCreateSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">
              Internship Title <span className="required-star">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Junior Full Stack Developer Intern"
              className={`form-control ${formErrors.title ? 'is-invalid' : ''}`}
            />
            {formErrors.title && <span className="form-error-msg">{formErrors.title}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Description & Tasks <span className="required-star">*</span>
            </label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the roles, responsibilities, learning outcomes, and technical exposure..."
              className={`form-control ${formErrors.description ? 'is-invalid' : ''}`}
            />
            {formErrors.description && <span className="form-error-msg">{formErrors.description}</span>}
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">
                Available Slots <span className="required-star">*</span>
              </label>
              <input
                type="number"
                min="1"
                name="slots"
                value={formData.slots}
                onChange={handleInputChange}
                className={`form-control ${formErrors.slots ? 'is-invalid' : ''}`}
              />
              {formErrors.slots && <span className="form-error-msg">{formErrors.slots}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Required Academic Program <span className="required-star">*</span>
              </label>
              <select
                name="requiredProgram"
                value={formData.requiredProgram}
                onChange={handleInputChange}
                className={`form-control ${formErrors.requiredProgram ? 'is-invalid' : ''}`}
              >
                <option value="BSIT">BS Information Technology (BSIT)</option>
                <option value="BSCS">BS Computer Science (BSCS)</option>
                <option value="BSIS">BS Information Systems (BSIS)</option>
                <option value="BSECE">BS Electronics Engineering (BSECE)</option>
              </select>
              {formErrors.requiredProgram && <span className="form-error-msg">{formErrors.requiredProgram}</span>}
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">
                Location / Work Arrangement <span className="required-star">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Iloilo City / Onsite"
                className={`form-control ${formErrors.location ? 'is-invalid' : ''}`}
              />
              {formErrors.location && <span className="form-error-msg">{formErrors.location}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Application Deadline <span className="required-star">*</span>
              </label>
              <input
                type="date"
                name="applicationDeadline"
                value={formData.applicationDeadline}
                onChange={handleInputChange}
                className={`form-control ${formErrors.applicationDeadline ? 'is-invalid' : ''}`}
              />
              {formErrors.applicationDeadline && <span className="form-error-msg">{formErrors.applicationDeadline}</span>}
            </div>
          </div>

          {/* Skill Tag Selection */}
          <div className="form-group">
            <label className="form-label">Required Prerequisite Skills</label>
            <div className="skill-chips-container">
              {availableSkills.map((s) => {
                const isSelected = selectedSkills.includes(s.SkillName);
                return (
                  <button
                    key={s.SkillID}
                    type="button"
                    className={`skill-chip ${isSelected ? 'selected' : ''}`}
                    onClick={() => toggleSkill(s.SkillName)}
                  >
                    <span>{isSelected ? '✓ ' : '+ '}</span>
                    {s.SkillName}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowCreateModal(false)}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Publishing...' : 'Publish Internship Slot'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PostingList;
