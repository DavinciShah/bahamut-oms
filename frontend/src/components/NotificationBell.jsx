import { useState } from 'react';
import useNotifications from '../hooks/useNotifications';
import NotificationCenter from './NotificationCenter';

export default function NotificationBell() {
  const { unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(prev => !prev)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, position: 'relative' }}
        aria-label="Notifications"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f8fafc" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0,
            background: '#ef4444', color: '#fff',
            borderRadius: '50%', fontSize: 10,
            width: 18, height: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700
          }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {open && <NotificationCenter onClose={() => setOpen(false)} />}
    </div>
  );
}
