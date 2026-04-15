import { useState, useEffect, useCallback } from 'react';
import { usersService } from '../../services/usersService';
import UsersList from '../Users/UsersList';
import SearchBar from '../Common/SearchBar';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorAlert from '../Common/ErrorAlert';
import SuccessMessage from '../Common/SuccessMessage';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadUsers = useCallback(async (search = '') => {
    setLoading(true);
    setError('');
    try {
      let result;
      if (search) {
        result = await usersService.searchUsers(search);
      } else {
        result = await usersService.getUsers();
      }
      setUsers(result.users || result || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.name || user.email}"? This cannot be undone.`)) return;
    try {
      await usersService.deleteUser(user.id);
      setSuccess(`User "${user.name || user.email}" deleted.`);
      loadUsers();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <span>User Management</span>
        <SearchBar onSearch={loadUsers} placeholder="Search users…" />
      </div>
      <div className="card-body">
        <SuccessMessage message={success} />
        <ErrorAlert message={error} />
        {loading ? <LoadingSpinner /> : (
          <UsersList users={users} onDelete={handleDelete} />
        )}
      </div>
    </div>
  );
}

export default UserManagement;
