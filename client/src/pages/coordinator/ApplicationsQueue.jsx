import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getCoordinatorApplicationsApi } from '../../api/coordinator.api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Badge from '../../components/Badge';
import Modal from '../../components/Modal';

const ApplicationsQueue = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'All';

  const [currentFilter, setCurrentFilter] = useState(initialStatus);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocUrl, setSelectedDocUrl] = useState(null);

  const fetchQueue = async (filterStatus) => {
    setLoading(true);
    try {
      const data = await getCoordinatorApplicationsApi(filterStatus === 'All' ? '' : filterStatus);
      setApplications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue(currentFilter);
  }, [currentFilter]);

  const handleFilterChange = (status) => {
    setCurrentFilter(status);
    setSearchParams(status === 'All' ? {} : { status });
  };

  const filterTabs = [
    { key: 'All', label: 'All Applications' },
    { key: 'Pending', label: 'Pending Review' },
    { key: 'Approved', label: 'Approved (Endorsed)' },
    { key: 'ReturnedForCorrection', label: 'Returned for Correction' },
    { key: 'Placed', label: 'Placed' },
    { key: 'Rejected', label: 'Rejected' }
  ];

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Applications Review Queue</h1>
          <p className="page-description">
            Verify student endorsement documents and determine institutional eligibility.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleFilterChange(tab.key)}
            className={`btn btn-sm ${currentFilter === tab.key ? 'btn-primary' : 'btn-outline'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner text="Fetching applications queue..." />
      ) : applications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
            No applications found matching the filter "{currentFilter}".
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Student Trainee</th>
                <th>Academic Program</th>
                <th>Target Company & Internship</th>
                <th>Date Submitted</th>
                <th>Endorsement Doc</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.ApplicationID}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{app.studentProfile?.user?.Name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {app.studentProfile?.user?.Email}
                    </div>
                  </td>
                  <td>
                    <strong>{app.studentProfile?.AcademicProgram}</strong> ({app.studentProfile?.YearLevel})
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{app.posting?.Title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      🏢 {app.posting?.company?.CompanyName}
                    </div>
                  </td>
                  <td>{new Date(app.DateSubmitted).toLocaleDateString()}</td>
                  <td>
                    {app.endorsementDocument ? (
                      <button
                        type="button"
                        onClick={() => setSelectedDocUrl(`/api/applications/${app.ApplicationID}/document`)}
                        className="btn btn-outline btn-sm"
                      >
                        📄 {app.endorsementDocument.FileName}
                      </button>
                    ) : (
                      <span className="badge badge-danger">Missing</span>
                    )}
                  </td>
                  <td>
                    <Badge status={app.Status} />
                  </td>
                  <td>
                    <Link
                      to={`/coordinator/applications/${app.ApplicationID}`}
                      className="btn btn-primary btn-sm"
                    >
                      Inspect & Review →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Document Quick Viewer Modal */}
      <Modal
        isOpen={!!selectedDocUrl}
        onClose={() => setSelectedDocUrl(null)}
        title="Endorsement Document Verification"
        footer={
          <button className="btn btn-secondary" onClick={() => setSelectedDocUrl(null)}>
            Close
          </button>
        }
      >
        {selectedDocUrl && (
          <div className="doc-preview-card">
            <div className="doc-preview-toolbar">
              <span>Attached Student Document</span>
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

export default ApplicationsQueue;
