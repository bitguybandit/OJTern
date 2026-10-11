import React, { useState, useEffect } from 'react';
import { getCompanyProfileApi, saveCompanyProfileApi } from '../../api/partner.api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';

const CompanyProfile = () => {
  const { refreshUser } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    companyName: '',
    industry: '',
    officeAddress: '',
    contactPerson: '',
    contactEmail: ''
  });
  const [verificationStatus, setVerificationStatus] = useState('Pending');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getCompanyProfileApi();
        if (profile) {
          setFormData({
            companyName: profile.CompanyName || '',
            industry: profile.Industry || '',
            officeAddress: profile.OfficeAddress || '',
            contactPerson: profile.ContactPerson || '',
            contactEmail: profile.ContactEmail || ''
          });
          setVerificationStatus(profile.VerificationStatus || 'Pending');
        }
      } catch (err) {
        // Normal if profile not created yet
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required.';
    if (!formData.industry.trim()) newErrors.industry = 'Industry is required.';
    if (!formData.officeAddress.trim()) newErrors.officeAddress = 'Office address is required.';
    if (!formData.contactPerson.trim()) newErrors.contactPerson = 'Contact person is required.';
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'Contact email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail.trim())) {
      newErrors.contactEmail = 'Please enter a valid email address.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('Please fix the highlighted fields.', 'error');
      return;
    }

    setSaving(true);
    try {
      const saved = await saveCompanyProfileApi(formData);
      setVerificationStatus(saved.VerificationStatus);
      await refreshUser();
      showToast('Company profile saved successfully!', 'success');
      setErrors({});
    } catch (err) {
      if (err.details) {
        setErrors(err.details);
      }
      showToast(err.message || 'Failed to save company profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading company profile..." />;
  }

  return (
    <div className="container-narrow">
      <div className="page-header">
        <div>
          <h1 className="page-title">Company Profile</h1>
          <p className="page-description">
            Register your company details as an accredited Host Training Establishment (HTE).
          </p>
        </div>
        <div>
          <span style={{ fontSize: '13px', marginRight: '8px', color: 'var(--text-muted)' }}>Status:</span>
          <Badge status={verificationStatus} text={`Verification: ${verificationStatus}`} />
        </div>
      </div>

      {verificationStatus === 'Pending' && (
        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
          <p style={{ color: '#92400e', fontSize: '14px', lineHeight: '1.4' }}>
            ℹ️ <strong>Account Status: Pending Verification.</strong> An OJT Coordinator will review and verify your company credentials before you can post internship slots.
          </p>
        </div>
      )}

      {verificationStatus === 'Verified' && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px' }}>
          <p style={{ color: '#065f46', fontSize: '14px', lineHeight: '1.4' }}>
            ✓ <strong>Verified Industry Partner.</strong> Your company is verified! You can publish internship postings and screen endorsed student trainees.
          </p>
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">
              Company Name <span className="required-star">*</span>
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              placeholder="e.g., Company A Tech Innovations"
              className={`form-control ${errors.companyName ? 'is-invalid' : ''}`}
            />
            {errors.companyName && <span className="form-error-msg">{errors.companyName}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Industry Sector <span className="required-star">*</span>
            </label>
            <input
              type="text"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              placeholder="e.g., Information Technology & Software Development"
              className={`form-control ${errors.industry ? 'is-invalid' : ''}`}
            />
            {errors.industry && <span className="form-error-msg">{errors.industry}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Headquarters / Office Address <span className="required-star">*</span>
            </label>
            <input
              type="text"
              name="officeAddress"
              value={formData.officeAddress}
              onChange={handleChange}
              placeholder="e.g., Diversion Road, Mandurriao, Iloilo City"
              className={`form-control ${errors.officeAddress ? 'is-invalid' : ''}`}
            />
            {errors.officeAddress && <span className="form-error-msg">{errors.officeAddress}</span>}
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">
                Contact Person <span className="required-star">*</span>
              </label>
              <input
                type="text"
                name="contactPerson"
                value={formData.contactPerson}
                onChange={handleChange}
                placeholder="e.g., John Smith (HR Manager)"
                className={`form-control ${errors.contactPerson ? 'is-invalid' : ''}`}
              />
              {errors.contactPerson && <span className="form-error-msg">{errors.contactPerson}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">
                Contact Email <span className="required-star">*</span>
              </label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                placeholder="e.g., hr@companya.test"
                className={`form-control ${errors.contactEmail ? 'is-invalid' : ''}`}
              />
              {errors.contactEmail && <span className="form-error-msg">{errors.contactEmail}</span>}
            </div>
          </div>

          <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving Profile...' : 'Save Company Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanyProfile;
