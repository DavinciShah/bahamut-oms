import Header from '../components/Common/Header';
import Sidebar from '../components/Common/Sidebar';
import Footer from '../components/Common/Footer';
import AdminPanel from '../components/Admin/AdminPanel';
import ReportsPanel from '../components/Admin/ReportsPanel';
import Charts from '../components/Dashboard/Charts';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorAlert from '../components/Common/ErrorAlert';
import { useFetch } from '../hooks/useFetch';
import { adminService } from '../services/adminService';

function AdminDashboardPage() {
  const { data: stats, loading, error } = useFetch(() => adminService.getStats(), []);

  return (
    <div className="app-container">
      <Header />
      <div className="app-body">
        <div className="sidebar-wrapper"><Sidebar /></div>
        <main className="main-content">
          <div className="page-header">
            <h2 className="page-title">Admin Dashboard</h2>
          </div>

          {error && <ErrorAlert message={error} />}

          {loading ? <LoadingSpinner /> : (
            <>
              <AdminPanel stats={stats} />
              <div style={{ marginTop: '1.5rem' }}>
                <Charts data={stats?.chart_data} type="line" title="Orders Over Time" />
              </div>
            </>
          )}

          <div style={{ marginTop: '1.5rem' }}>
            <ReportsPanel />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default AdminDashboardPage;
