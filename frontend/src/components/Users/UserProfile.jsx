import { useState } from 'react';
import { usersService } from '../../services/usersService';
import ErrorAlert from '../Common/ErrorAlert';
import SuccessMessage from '../Common/SuccessMessage';

function UserProfile({ user, onUpdated }) {
  const [editing, setEditing] = useState(false);
  const [values, setValues] = useState({ name: user?.name || '', email: user?.email || '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!user) return null;

  const initials = (user.name || user.email || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await usersService.updateUser(user.id, values);
      setSuccess('Profile updated successfully.');
      setEditing(false);
      onUpdated?.(values);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 480 }}>
      <div className="card-body">
        <ErrorAlert message={error} />
        <SuccessMessage message={success} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div
            className="avatar"
            style={{ width: '4rem', height: '4rem', fontSize: '1.5rem', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0 }}
          >
            {initials}
          </div>
          <div>
            <h3 style={{ margin: 0 }}>{user.name}</h3>
            <p style={{ color: 'var(--gray-500)', fontSize: 'var(--font-size-sm)', margin: 0 }}>{user.email}</p>
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
          </div>
        </div>

        {editing ? (
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                className="form-control"
                value={values.name}
                onChange={(e) => setValues((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={values.email}
                onChange={(e) => setValues((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn btn-primary btn-sm" disabled={loading}>
                {loading ? 'Saving…' : 'Save'}
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}

export default UserProfile;
