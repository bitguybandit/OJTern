import React, { useState, useEffect } from 'react';
import { getStudentProfileApi, saveStudentProfileApi, getSkillsApi } from '../../api/student.api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const ProfileBuilder = () => {
  const { refreshUser } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    academicProgram: 'BSIT',
    yearLevel: 'Year 3',
    preferredLocation: '',
    interests: '',
    resumePath: ''
  });

  const [availableSkills, setAvailableSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [skills, profile] = await Promise.all([
          getSkillsApi().catch(() => []),
          getStudentProfileApi().catch(() => null)
        ]);

        setAvailableSkills(skills);

        if (profile) {
          setFormData({
            academicProgram: profile.AcademicProgram || 'BSIT',
            yearLevel: profile.YearLevel || 'Year 3',
            preferredLocation: profile.PreferredLocation || '',
            interests: profile.Interests || '',
            resumePath: profile.ResumePath || ''
          });
          if (profile.skills) {
            setSelectedSkills(profile.skills.map((s) => s.SkillName));
          }
        }
      } catch (err) {
        console.error('Failed to load profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const toggleSkill = (skillName) => {
    setSelectedSkills((prev) => {
      const next = prev.includes(skillName)
        ? prev.filter((s) => s !== skillName)
        : [...prev, skillName];
      if (next.length > 0 && errors.skills) {
        setErrors((errs) => ({ ...errs, skills: '' }));
      }
      return next;
    });
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    const trimmed = newSkillInput.trim();
    if (!trimmed) return;
    if (!selectedSkills.includes(trimmed)) {
      setSelectedSkills((prev) => [...prev, trimmed]);
      if (errors.skills) setErrors((errs) => ({ ...errs, skills: '' }));
    }
    setNewSkillInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.academicProgram.trim()) {
      newErrors.academicProgram = 'Academic program is required.';
    }
    if (!formData.preferredLocation.trim()) {
      newErrors.preferredLocation = 'Preferred location is required.';
    }
    if (selectedSkills.length === 0) {
      newErrors.skills = 'Please select at least one skill.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please correct the highlighted form errors.', 'error');
      return;
    }

    setSaving(true);
    try {
      await saveStudentProfileApi({
        ...formData,
        skills: selectedSkills
      });
      await refreshUser();
      showToast('Student profile saved successfully!', 'success');
      setErrors({});
    } catch (err) {
      if (err.details) {
        setErrors(err.details);
      }
      showToast(err.message || 'Failed to save profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading profile details..." />;
  }

  return (
    <div className="container-narrow">
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Profile Builder</h1>
          <p className="page-description">
            Complete your academic details, skills, and interests to receive ranked internship matches.
          </p>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} noValidate>
          {/* Academic Program */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">
                Academic Program <span className="required-star">*</span>
              </label>
              <select
                name="academicProgram"
                value={formData.academicProgram}
                onChange={handleChange}
                className={`form-control ${errors.academicProgram ? 'is-invalid' : ''}`}
              >
                <option value="BSIT">BS Information Technology (BSIT)</option>
                <option value="BSCS">BS Computer Science (BSCS)</option>
                <option value="BSIS">BS Information Systems (BSIS)</option>
                <option value="BSECE">BS Electronics Engineering (BSECE)</option>
              </select>
              {errors.academicProgram && <span className="form-error-msg">{errors.academicProgram}</span>}
            </div>

            {/* Year Level */}
            <div className="form-group">
              <label className="form-label">
                Year Level <span className="required-star">*</span>
              </label>
              <select
                name="yearLevel"
                value={formData.yearLevel}
                onChange={handleChange}
                className="form-control"
              >
                <option value="Year 3">Year 3 (Junior)</option>
                <option value="Year 4">Year 4 (Senior)</option>
              </select>
            </div>
          </div>

          {/* Preferred Location */}
          <div className="form-group">
            <label className="form-label">
              Preferred Location <span className="required-star">*</span>
            </label>
            <input
              type="text"
              name="preferredLocation"
              value={formData.preferredLocation}
              onChange={handleChange}
              placeholder="e.g., Iloilo City, Mandurriao, Remote"
              className={`form-control ${errors.preferredLocation ? 'is-invalid' : ''}`}
            />
            <span className="form-hint">Used by the recommendation engine (+20 points for match).</span>
            {errors.preferredLocation && <span className="form-error-msg">{errors.preferredLocation}</span>}
          </div>

          {/* Interests */}
          <div className="form-group">
            <label className="form-label">Interests & Career Objectives</label>
            <textarea
              name="interests"
              rows="3"
              value={formData.interests}
              onChange={handleChange}
              placeholder="e.g., Frontend, Web, UI/UX, Data Science, Cloud Infrastructure"
              className="form-control"
            />
            <span className="form-hint">
              Keywords from your interests add +10 points to recommendation scores when matching job descriptions.
            </span>
          </div>

          {/* Skills Section */}
          <div className="form-group">
            <label className="form-label">
              Technical Skills <span className="required-star">*</span> ({selectedSkills.length} selected)
            </label>
            <p className="form-hint" style={{ marginBottom: '10px' }}>
              Click to select/unselect skills from the platform catalogue:
            </p>

            <div className="skill-chips-container" style={{ marginBottom: '16px' }}>
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

            {/* Add Custom Skill */}
            <div style={{ display: 'flex', gap: '8px', maxWidth: '420px' }}>
              <input
                type="text"
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                placeholder="Or add another skill..."
                className="form-control"
              />
              <button type="button" onClick={handleAddCustomSkill} className="btn btn-secondary btn-sm">
                Add
              </button>
            </div>

            {errors.skills && <span className="form-error-msg">{errors.skills}</span>}
          </div>

          <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving Profile...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileBuilder;
