import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/OrdersPage';
import CreateOrderPage from './pages/CreateOrderPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import InventoryPage from './pages/InventoryPage';
import CreateProductPage from './pages/CreateProductPage';
import UsersPage from './pages/UsersPage';
import UserProfilePage from './pages/UserProfilePage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import InventoryDashboard from './pages/InventoryDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import ReportBuilder from './pages/ReportBuilder';
import BillingPage from './pages/BillingPage';
import ShippingPage from './pages/ShippingPage';
import SupportDashboard from './pages/SupportDashboard';
import TicketDetail from './pages/TicketDetail';
import BIPortal from './pages/BIPortal';
import TenantSettings from './pages/TenantSettings';
import TeamManagement from './pages/TeamManagement';
import NotificationBell from './components/NotificationBell';

function NavBar() {
  return (
    <nav style={{ background: '#1e293b', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
      <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: 20, marginRight: 16 }}>Bahamut OMS</span>
      {[
        ['/dashboard', 'Dashboard'],
        ['/orders', 'Orders'],
        ['/inventory', 'Inventory'],
        ['/analytics', 'Analytics'],
        ['/reports', 'Reports'],
        ['/billing', 'Billing'],
        ['/shipping', 'Shipping'],
        ['/support', 'Support'],
        ['/bi', 'BI'],
        ['/settings/tenant', 'Settings'],
      ].map(([path, label]) => (
        <Link key={path} to={path} style={{ color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>{label}</Link>
      ))}
      <div style={{ marginLeft: 'auto' }}>
        <NotificationBell />
      </div>
    </nav>
  );
}

export default function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register' || location.pathname === '/unauthorized';

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>
      {!isAuthPage && <NavBar />}
      <div>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/create"
            element={
              <ProtectedRoute>
                <CreateOrderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:id"
            element={
              <ProtectedRoute>
                <OrderDetailsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <InventoryDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/products"
            element={
              <ProtectedRoute>
                <InventoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory/create"
            element={
              <ProtectedRoute requiredRole="admin">
                <CreateProductPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UserProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportBuilder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <BillingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shipping"
            element={
              <ProtectedRoute>
                <ShippingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support"
            element={
              <ProtectedRoute>
                <SupportDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/support/tickets/:id"
            element={
              <ProtectedRoute>
                <TicketDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bi"
            element={
              <ProtectedRoute>
                <BIPortal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/tenant"
            element={
              <ProtectedRoute>
                <TenantSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/team"
            element={
              <ProtectedRoute>
                <TeamManagement />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  );
}
