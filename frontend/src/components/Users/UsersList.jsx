import { formatDate } from '../../utils/formatters';
import ErrorAlert from '../Common/ErrorAlert';

function UsersList({ users = [], onDelete, error }) {
  if (users.length === 0) {
    return (
      <div className="empty-state">
        <h3>No users found</h3>
      </div>
    );
  }

  return (
    <div>
      {error && <ErrorAlert message={error} />}
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td style={{ fontWeight: '500' }}>{user.name || '—'}</td>
                <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-600)' }}>{user.email}</td>
                <td>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      padding: '0.1rem 0.5rem',
                      borderRadius: 'var(--border-radius-full)',
                      backgroundColor: user.role === 'admin' ? '#dbeafe' : '#f1f5f9',
                      color: user.role === 'admin' ? '#1e40af' : '#475569',
                      textTransform: 'uppercase',
                    }}
                  >
                    {user.role || 'user'}
                  </span>
                </td>
                <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)' }}>
                  {formatDate(user.created_at || user.createdAt)}
                </td>
                <td>
                  {onDelete && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => onDelete(user)}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsersList;
