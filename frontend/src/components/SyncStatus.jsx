import React from 'react';

export default function SyncStatus({ status }) {
  if (!status) return <div style={{ color: '#6b7280' }}>No sync data available.</div>;
  const { overall, integrations = [], lastSync, errorCount } = status;
  const healthColor = overall === 'healthy' ? '#22c55e' : overall === 'warning' ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: healthColor, display: 'inline-block' }} />
        <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{overall || 'unknown'}</span>
        {lastSync && <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 'auto' }}>Last: {new Date(lastSync).toLocaleString()}</span>}
      </div>
      {errorCount > 0 && <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 8 }}>{errorCount} error(s) detected</div>}
      {integrations.map((intg) => (
        <div key={intg.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', borderTop: '1px solid #f3f4f6' }}>
          <span>{intg.name}</span>
          <span style={{ color: intg.status === 'connected' ? '#22c55e' : '#9ca3af' }}>{intg.status}</span>
        </div>
      ))}
    </div>
  );
}
