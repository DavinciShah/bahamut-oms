function UserCard({ user }) {
  const initials = (user.name || user.email || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const isAdmin = user.role === 'admin';

  return (
    <div className="user-card">
      <div className="avatar">{initials}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: '600', fontSize: 'var(--font-size-sm)', marginBottom: '0.125rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {user.name || '—'}
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '0.25rem' }}>
          {user.email}
        </p>
        <span
          style={{
            fontSize: '0.65rem',
            fontWeight: '700',
            padding: '0.1rem 0.4rem',
            borderRadius: 'var(--border-radius-full)',
            backgroundColor: isAdmin ? '#dbeafe' : '#f1f5f9',
            color: isAdmin ? '#1e40af' : '#475569',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          {user.role || 'user'}
        </span>
      </div>
    </div>
  );
}

export default UserCard;
