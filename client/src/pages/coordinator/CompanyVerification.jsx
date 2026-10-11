import React, { useState, useEffect } from 'react';
import { getCompaniesQueueApi, verifyCompanyApi } from '../../api/coordinator.api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';

const CompanyVerification = () => {
  const { showToast } = useToast();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [processingId, setProcessingId] = useState(null);

  const loadCompanies = async (statusFilter) => {
    setLoading(true);
    try {
      const data = await getCompaniesQueueApi(statusFilter === 'All' ? '' : statusFilter);
      setCompanies(data);
    } catch (err) {
      showToast(err.message || 'Failed to load company verification queue.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies(filter);
  }, [filter]);

  const handleVerify = async (companyId, status) => {
    setProcessingId(companyId);
    try {
      await verifyCompanyApi(companyId, status);
      showToast(`Company verification updated: ${status}`, status === 'Verified' ? 'success' : 'warning');
      await loadCompanies(filter);
    } catch (err) {
      showToast(err.message || 'Verification update failed.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Industry Partner Accreditations</h1>
          <p className="page-description">
            Review and verify host training establishments before they can post student internship slots.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['All', 'Pending', 'Verified', 'Rejected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`btn btn-sm ${filter === status ? 'btn-primary' : 'btn-outline'}`}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading partner requests..." />
      ) : companies.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No companies found with status "{filter}".</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Company Name & Industry</th>
                <th>Office Address</th>
                <th>Contact Representative</th>
                <th>Registered Account</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((comp) => (
                <tr key={comp.CompanyID}>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{comp.CompanyName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{comp.Industry}</div>
                  </td>
                  <td style={{ fontSize: '13px' }}>{comp.OfficeAddress}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{comp.ContactPerson}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{comp.ContactEmail}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '13px' }}>{comp.user?.Name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{comp.user?.Email}</div>
                  </td>
                  <td>
                    <Badge status={comp.VerificationStatus} />
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {comp.VerificationStatus !== 'Verified' && (
                        <button
                          className="btn btn-success btn-sm"
                          disabled={processingId === comp.CompanyID}
                          onClick={() => handleVerify(comp.CompanyID, 'Verified')}
                        >
                          ✓ Verify
                        </button>
                      )}
                      {comp.VerificationStatus !== 'Rejected' && (
                        <button
                          className="btn btn-danger btn-sm"
                          disabled={processingId === comp.CompanyID}
                          onClick={() => handleVerify(comp.CompanyID, 'Rejected')}
                        >
                          ✕ Reject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CompanyVerification;
