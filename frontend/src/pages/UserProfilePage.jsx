import Header from '../components/Common/Header';
import Sidebar from '../components/Common/Sidebar';
import Footer from '../components/Common/Footer';
import UserProfile from '../components/Users/UserProfile';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorAlert from '../components/Common/ErrorAlert';
import { useFetch } from '../hooks/useFetch';
import { useAuth } from '../hooks/useAuth';
import authService from '../services/authService';

function UserProfilePage() {
  const { user: authUser, login, token } = useAuth();

  const { data, loading, error } = useFetch(() => authService.getProfile(), []);
  const user = data?.user || data || authUser;

  const handleUpdated = (updatedFields) => {
    if (authUser && token) {
      login({ ...authUser, ...updatedFields }, token);
    }
  };

  return (
    <div className="app-container">
      <Header />
      <div className="app-body">
        <div className="sidebar-wrapper"><Sidebar /></div>
        <main className="main-content">
          <div className="page-header">
            <h2 className="page-title">My Profile</h2>
          </div>

          {error && <ErrorAlert message={error} />}
          {loading ? <LoadingSpinner /> : (
            <UserProfile user={user} onUpdated={handleUpdated} />
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default UserProfilePage;
