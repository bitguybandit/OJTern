import React, { useState, useEffect } from 'react';
import { getAuditLogsApi } from '../../api/admin.api';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';

const AuditLogs = () => {
  const { showToast } = useToast();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await getAuditLogsApi();
        setLogs(data);
      } catch (err) {
        showToast(err.message || 'Failed to fetch audit trail.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading system audit trail..." />;
  }

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Platform Audit Trail</h1>
          <p className="page-description">
            Complete traceability of user actions, authorization events, role-gating checks, and status changes.
          </p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No audit logs recorded yet.</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor / User</th>
                <th>Action Taken</th>
                <th>Entity Affected</th>
                <th>Entity ID</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.AuditID}>
                  <td style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>
                    {new Date(log.Timestamp || log.createdAt).toLocaleString()}
                  </td>
                  <td>
                    {log.user ? (
                      <div>
                        <div style={{ fontWeight: 600 }}>{log.user.Name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {log.user.Role} ({log.user.Email})
                        </div>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>System / Anonymous</span>
                    )}
                  </td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        background: '#f1f5f9',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#0f172a'
                      }}
                    >
                      {log.Action}
                    </span>
                  </td>
                  <td>
                    <strong>{log.EntityAffected}</strong>
                  </td>
                  <td style={{ fontSize: '13px' }}>
                    {log.EntityID ? `#${log.EntityID}` : '—'}
                  </td>
                  <td>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setSelectedLog(log)}
                    >
                      Inspect Diff
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Audit Detail Modal */}
      <Modal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        title={`Audit Event Details: ${selectedLog?.Action}`}
        footer={
          <button className="btn btn-secondary" onClick={() => setSelectedLog(null)}>
            Close
          </button>
        }
      >
        {selectedLog && (
          <div>
            <div style={{ marginBottom: '16px', fontSize: '13px' }}>
              <p><strong>Actor:</strong> {selectedLog.user ? `${selectedLog.user.Name} (${selectedLog.user.Role})` : 'System'}</p>
              <p><strong>Entity Affected:</strong> {selectedLog.EntityAffected} {selectedLog.EntityID ? `(ID: ${selectedLog.EntityID})` : ''}</p>
              <p><strong>Timestamp:</strong> {new Date(selectedLog.Timestamp).toLocaleString()}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <h5 style={{ fontSize: '13px', marginBottom: '6px', color: '#991b1b' }}>Previous State (OldValue):</h5>
                <pre
                  style={{
                    background: '#1e293b',
                    color: '#f8fafc',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    maxHeight: '220px',
                    overflowY: 'auto'
                  }}
                >
                  {selectedLog.OldValue ? JSON.stringify(selectedLog.OldValue, null, 2) : 'null (None)'}
                </pre>
              </div>

              <div>
                <h5 style={{ fontSize: '13px', marginBottom: '6px', color: '#065f46' }}>New State (NewValue):</h5>
                <pre
                  style={{
                    background: '#1e293b',
                    color: '#f8fafc',
                    padding: '12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    maxHeight: '220px',
                    overflowY: 'auto'
                  }}
                >
                  {selectedLog.NewValue ? JSON.stringify(selectedLog.NewValue, null, 2) : 'null (None)'}
                </pre>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogs;
