import useNotifications from '../hooks/useNotifications';

export default function NotificationCenter({ onClose }) {
  const { notifications, markRead, markAllRead, deleteNotification } = useNotifications();

  return (
    <div style={{
      position: 'absolute', right: 0, top: '100%', width: 360,
      background: '#fff', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      zIndex: 1000, maxHeight: 480, display: 'flex', flexDirection: 'column'
    }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>Notifications</strong>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={markAllRead} style={{ fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6' }}>Mark all read</button>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>
      </div>
      <div style={{ overflow: 'auto', flex: 1 }}>
        {notifications.length === 0 && (
          <div style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No notifications</div>
        )}
        {notifications.map(n => (
          <div key={n.id} style={{
            padding: '12px 16px', borderBottom: '1px solid #f1f5f9',
            background: n.read ? '#fff' : '#eff6ff',
            display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'
          }}>
            <div style={{ flex: 1 }} onClick={() => !n.read && markRead(n.id)} role="button" style={{ cursor: 'pointer', flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: n.read ? 400 : 600 }}>{n.title || n.message}</div>
              {n.body && <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{n.body}</div>}
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>
                {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
              </div>
            </div>
            <button
              onClick={() => deleteNotification(n.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 16, paddingLeft: 8 }}
            >×</button>
          </div>
        ))}
      </div>
    </div>
  );
}
