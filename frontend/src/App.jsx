import { Routes, Route, Navigate, Link } from 'react-router-dom';
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
        ['/', 'Dashboard'],
        ['/orders', 'Orders'],
        ['/products', 'Products'],
        ['/inventory', 'Inventory'],
        ['/warehouses', 'Warehouses'],
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

function Dashboard() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <p>Welcome to Bahamut OMS. Use the navigation to explore modules.</p>
    </div>
  );
}

function PlaceholderPage({ title }) {
  return <div style={{ padding: 24 }}><h2>{title}</h2></div>;
}

export default function App() {
  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>
      <NavBar />
      <div style={{ padding: 0 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/login" element={<PlaceholderPage title="Login" />} />
          <Route path="/register" element={<PlaceholderPage title="Register" />} />
          <Route path="/orders" element={<PlaceholderPage title="Orders" />} />
          <Route path="/products" element={<PlaceholderPage title="Products" />} />
          <Route path="/inventory" element={<InventoryDashboard />} />
          <Route path="/warehouses" element={<PlaceholderPage title="Warehouses" />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/reports" element={<ReportBuilder />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/support" element={<SupportDashboard />} />
          <Route path="/support/tickets/:id" element={<TicketDetail />} />
          <Route path="/bi" element={<BIPortal />} />
          <Route path="/settings/tenant" element={<TenantSettings />} />
          <Route path="/settings/team" element={<TeamManagement />} />
          <Route path="/notifications" element={<PlaceholderPage title="Notifications" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
