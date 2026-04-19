import React from 'react';

const STATUS_COLORS = { connected: '#22c55e', disconnected: '#9ca3af', error: '#ef4444' };

export default function IntegrationCard({ integration, onTest, onSync, onSettings, onDisconnect }) {
  const { id, name, type, status, lastSyncAt, recordsSynced } = integration;
  const ICONS = { tally: '📊', mybillbook: '📒', zoho: '🌐', quickbooks: '💼', wave: '🌊', generic: '🔗' };
  const icon = ICONS[type] || '🔗';
  const color = STATUS_COLORS[status] || '#9ca3af';

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, background: '#fff', display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 28 }}>{icon}</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
            <span style={{ color, textTransform: 'capitalize' }}>{status || 'disconnected'}</span>
          </div>
        </div>
      </div>
      {lastSyncAt && (
        <div style={{ fontSize: 12, color: '#6b7280' }}>Last sync: {new Date(lastSyncAt).toLocaleString()}</div>
      )}
      {recordsSynced != null && (
        <div style={{ fontSize: 12, color: '#6b7280' }}>Records synced: {recordsSynced}</div>
      )}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
        {onTest && <button onClick={() => onTest(id)} style={btnStyle('#3b82f6')}>Test</button>}
        {onSync && <button onClick={() => onSync(id)} style={btnStyle('#10b981')}>Sync</button>}
        {onSettings && <button onClick={() => onSettings(id)} style={btnStyle('#6366f1')}>Settings</button>}
        {onDisconnect && <button onClick={() => onDisconnect(id)} style={btnStyle('#ef4444')}>Disconnect</button>}
      </div>
    </div>
  );
}

function btnStyle(bg) {
  return { background: bg, color: '#fff', border: 'none', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontSize: 12 };
}
