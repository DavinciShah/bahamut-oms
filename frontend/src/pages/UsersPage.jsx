import { useState, useCallback } from 'react';
import Header from '../components/Common/Header';
import Sidebar from '../components/Common/Sidebar';
import Footer from '../components/Common/Footer';
import UsersList from '../components/Users/UsersList';
import SearchBar from '../components/Common/SearchBar';
import Pagination from '../components/Common/Pagination';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorAlert from '../components/Common/ErrorAlert';
import SuccessMessage from '../components/Common/SuccessMessage';
import { useFetch } from '../hooks/useFetch';
import { usersService } from '../services/usersService';
import { ITEMS_PER_PAGE } from '../utils/constants';

function UsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState('');

  const fetchUsers = useCallback(
    () => usersService.getUsers({ page, limit: ITEMS_PER_PAGE, search }),
    [page, search]
  );

  const { data, loading, error, refetch } = useFetch(fetchUsers, [page, search]);

  const users = data?.users || data || [];
  const total = data?.total || users.length;
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete "${user.name || user.email}"?`)) return;
    setDeleteError('');
    try {
      await usersService.deleteUser(user.id);
      setDeleteSuccess(`User deleted.`);
      refetch();
    } catch (err) {
      setDeleteError(err?.response?.data?.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="app-container">
      <Header />
      <div className="app-body">
        <div className="sidebar-wrapper"><Sidebar /></div>
        <main className="main-content">
          <div className="page-header">
            <h2 className="page-title">Users</h2>
            <SearchBar onSearch={(q) => { setSearch(q); setPage(1); }} placeholder="Search users…" />
          </div>

          <SuccessMessage message={deleteSuccess} />
          {(error || deleteError) && <ErrorAlert message={error || deleteError} />}
          {loading ? <LoadingSpinner /> : (
            <UsersList users={users} onDelete={handleDelete} />
          )}

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={total}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default UsersPage;
