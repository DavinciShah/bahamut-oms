import Header from '../components/Common/Header';
import Sidebar from '../components/Common/Sidebar';
import Footer from '../components/Common/Footer';
import StatsCard from '../components/Dashboard/StatsCard';
import RecentOrders from '../components/Dashboard/RecentOrders';
import Charts from '../components/Dashboard/Charts';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import ErrorAlert from '../components/Common/ErrorAlert';
import { useFetch } from '../hooks/useFetch';
import { adminService } from '../services/adminService';
import { ordersService } from '../services/ordersService';
import { formatCurrency } from '../utils/formatters';

function DashboardPage() {
  const { data: stats, loading: statsLoading, error: statsError } = useFetch(
    () => adminService.getStats(),
    []
  );

  const { data: ordersData, loading: ordersLoading } = useFetch(
    () => ordersService.getOrders({ limit: 10 }),
    []
  );

  const orders = ordersData?.orders || ordersData || [];

  return (
    <div className="app-container">
      <Header />
      <div className="app-body">
        <div className="sidebar-wrapper"><Sidebar /></div>
        <main className="main-content">
          <div className="page-header">
            <h2 className="page-title">Dashboard</h2>
          </div>

          {statsError && <ErrorAlert message={statsError} />}

          {statsLoading ? (
            <LoadingSpinner />
          ) : (
            <div
              className="stats-grid"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}
            >
              <StatsCard
                title="Total Orders"
                value={stats?.total_orders ?? 0}
                icon="📦"
                color="#2563eb"
              />
              <StatsCard
                title="Total Revenue"
                value={formatCurrency(stats?.total_revenue)}
                icon="💰"
                color="#16a34a"
              />
              <StatsCard
                title="Products"
                value={stats?.total_products ?? 0}
                icon="🗃️"
                color="#d97706"
              />
              <StatsCard
                title="Users"
                value={stats?.total_users ?? 0}
                icon="👥"
                color="#7c3aed"
              />
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <Charts
              data={stats?.chart_data}
              type="line"
              title="Orders Over Time"
            />
            <Charts
              data={stats?.revenue_chart}
              type="bar"
              title="Revenue Over Time"
            />
          </div>

          {ordersLoading ? <LoadingSpinner /> : <RecentOrders orders={orders} />}
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default DashboardPage;
