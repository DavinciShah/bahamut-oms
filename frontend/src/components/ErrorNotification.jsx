import React from 'react';

export default function ErrorNotification({ errors = [], onRetry, onDismiss }) {
  if (!errors.length) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {errors.map((err) => (
        <div key={err.id} style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ fontSize: 18, marginTop: 1 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 13, color: '#dc2626' }}>{err.integrationName} — Sync Error</div>
            <div style={{ fontSize: 12, color: '#7f1d1d', marginTop: 2 }}>{err.message}</div>
            {err.timestamp && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{new Date(err.timestamp).toLocaleString()}</div>}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {onRetry && <button onClick={() => onRetry(err.id)} style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', fontSize: 11 }}>Retry</button>}
            {onDismiss && <button onClick={() => onDismiss(err.id)} style={{ background: 'transparent', border: '1px solid #fca5a5', borderRadius: 4, padding: '3px 8px', cursor: 'pointer', fontSize: 11, color: '#dc2626' }}>Dismiss</button>}
          </div>
        </div>
      ))}
    </div>
  );
}
