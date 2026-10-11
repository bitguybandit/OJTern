import React, { useState, useEffect } from 'react';
import { getPlacementReportApi, downloadPlacementReportCsv } from '../../api/report.api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';

const PlacementReport = () => {
  const { showToast } = useToast();

  const currentDate = new Date();
  const [month, setMonth] = useState(String(currentDate.getMonth() + 1));
  const [year, setYear] = useState(String(currentDate.getFullYear()));

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const fetchReport = async (m, y) => {
    setLoading(true);
    try {
      const data = await getPlacementReportApi({ month: m, year: y });
      setReportData(data);
    } catch (err) {
      showToast(err.message || 'Failed to generate placement report.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(month, year);
  }, []);

  const handleGenerate = (e) => {
    e.preventDefault();
    fetchReport(month, year);
  };

  const handleDownloadCsv = async () => {
    setDownloading(true);
    try {
      await downloadPlacementReportCsv({ month, year });
      showToast('Report CSV downloaded successfully.', 'success');
    } catch (err) {
      showToast('Failed to download CSV.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const monthOptions = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Monthly OJT Placement Report</h1>
          <p className="page-description">
            Aggregate approved and placed candidates grouped by Host Company and Academic Degree Program (FR-12).
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleDownloadCsv}
          disabled={downloading || !reportData}
        >
          {downloading ? 'Downloading...' : '⬇ Export CSV Report'}
        </button>
      </div>

      {/* Date Filter Card */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <form onSubmit={handleGenerate} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '180px' }}>
            <label className="form-label">Report Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="form-control"
            >
              {monthOptions.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: '140px' }}>
            <label className="form-label">Year</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="form-control"
            />
          </div>

          <button type="submit" className="btn btn-secondary" disabled={loading}>
            {loading ? 'Generating...' : 'Apply Filter'}
          </button>
        </form>
      </div>

      {loading ? (
        <LoadingSpinner text="Compiling monthly aggregates..." />
      ) : !reportData ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No report data returned.</p>
        </div>
      ) : (
        <>
          {/* Total Placements Summary Tile */}
          <div className="kpi-grid" style={{ marginBottom: '24px' }}>
            <div className="kpi-card">
              <div className="kpi-icon kpi-success">📊</div>
              <div className="kpi-info-box">
                <span className="kpi-value">{reportData.total}</span>
                <span className="kpi-label">
                  Total Approved & Placed Interns ({monthOptions.find(m => m.value === String(reportData.month))?.label} {reportData.year})
                </span>
              </div>
            </div>
          </div>

          {/* Tables Grid */}
          <div className="grid-2">
            {/* By Company Table */}
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '4px' }}>🏢 Placements by Industry Partner</h3>
              <p className="card-subtitle" style={{ marginBottom: '16px' }}>
                Distribution across accredited host training establishments
              </p>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Company Name</th>
                      <th style={{ textAlign: 'right' }}>Placements / Endorsements</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.byCompany && reportData.byCompany.length > 0 ? (
                      reportData.byCompany.map((c, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{c.company}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--primary)' }}>
                            {c.count}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                          No company placements recorded for this period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* By Academic Program Table */}
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: '4px' }}>🎓 Placements by Academic Program</h3>
              <p className="card-subtitle" style={{ marginBottom: '16px' }}>
                Distribution across college degree programs
              </p>

              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Degree Program</th>
                      <th style={{ textAlign: 'right' }}>Student Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.byProgram && reportData.byProgram.length > 0 ? (
                      reportData.byProgram.map((p, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{p.program}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success-text)' }}>
                            {p.count}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                          No program placements recorded for this period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PlacementReport;
