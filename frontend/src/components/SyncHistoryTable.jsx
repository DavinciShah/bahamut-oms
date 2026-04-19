import React from 'react';

export default function SyncHistoryTable({ logs = [], onRetry, loading }) {
  if (loading) return <div style={{ padding: 16 }}>Loading...</div>;
  if (!logs.length) return <div style={{ padding: 16, color: '#6b7280' }}>No sync history found.</div>;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#f9fafb' }}>
            {['Date', 'Type', 'Integration', 'Status', 'Records', 'Error', 'Action'].map((h) => (
              <th key={h} style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
              <td style={{ padding: '8px 12px' }}>{log.syncedAt ? new Date(log.syncedAt).toLocaleString() : '—'}</td>
              <td style={{ padding: '8px 12px', textTransform: 'capitalize' }}>{log.syncType}</td>
              <td style={{ padding: '8px 12px' }}>{log.integrationName || log.integrationId}</td>
              <td style={{ padding: '8px 12px' }}>
                <span style={{ color: log.status === 'success' ? '#22c55e' : log.status === 'failed' ? '#ef4444' : '#f59e0b', fontWeight: 500, textTransform: 'capitalize' }}>
                  {log.status}
                </span>
              </td>
              <td style={{ padding: '8px 12px' }}>{log.recordsSynced ?? '—'}</td>
              <td style={{ padding: '8px 12px', color: '#ef4444', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.errorMessage || '—'}</td>
              <td style={{ padding: '8px 12px' }}>
                {log.status === 'failed' && onRetry && (
                  <button onClick={() => onRetry(log.id)} style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', fontSize: 12 }}>
                    Retry
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
