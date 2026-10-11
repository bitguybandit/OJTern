import React, { useState, useEffect } from 'react';
import { getPlacementReportApi, downloadPlacementReportCsv } from '../../api/report.api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const Reports = () => {
  const { showToast } = useToast();

  const currentDate = new Date();
  const [month, setMonth] = useState(String(currentDate.getMonth() + 1));
  const [year, setYear] = useState(String(currentDate.getFullYear()));
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async (m, y) => {
    setLoading(true);
    try {
      const data = await getPlacementReportApi({ month: m, year: y });
      setReportData(data);
    } catch (err) {
      showToast(err.message || 'Failed to fetch platform reports.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(month, year);
  }, []);

  const handleDownload = async () => {
    try {
      await downloadPlacementReportCsv({ month, year });
      showToast('CSV downloaded.', 'success');
    } catch (e) {
      showToast('Download failed.', 'error');
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Platform Placement Analytics & Reports</h1>
          <p className="page-description">
            Institutional overview of active placements across departments and partner companies.
          </p>
        </div>
        <button className="btn btn-primary" onClick={handleDownload} disabled={!reportData}>
          ⬇ Export Report CSV
        </button>
      </div>

      {loading ? (
        <LoadingSpinner text="Compiling platform-wide metrics..." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon kpi-primary">📈</div>
              <div className="kpi-info-box">
                <span className="kpi-value">{reportData?.total || 0}</span>
                <span className="kpi-label">Total Verified Placements</span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon kpi-info">🏢</div>
              <div className="kpi-info-box">
                <span className="kpi-value">{reportData?.byCompany?.length || 0}</span>
                <span className="kpi-label">Active Host Companies</span>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon kpi-success">🎓</div>
              <div className="kpi-info-box">
                <span className="kpi-value">{reportData?.byProgram?.length || 0}</span>
                <span className="kpi-label">Participating Academic Programs</span>
              </div>
            </div>
          </div>

          <div className="grid-2">
            <div className="card">
              <h3 className="card-title">Placement Distribution by Company</h3>
              <div className="table-responsive" style={{ marginTop: '16px' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Partner Company</th>
                      <th style={{ textAlign: 'right' }}>Placements</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData?.byCompany?.map((c, i) => (
                      <tr key={i}>
                        <td>{c.company}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{c.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h3 className="card-title">Placement Distribution by Program</h3>
              <div className="table-responsive" style={{ marginTop: '16px' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Academic Program</th>
                      <th style={{ textAlign: 'right' }}>Students</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData?.byProgram?.map((p, i) => (
                      <tr key={i}>
                        <td>{p.program}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700 }}>{p.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
