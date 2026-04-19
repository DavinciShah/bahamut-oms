import { Link } from 'react-router-dom';
import StatsCard from '../Dashboard/StatsCard';
import { formatCurrency } from '../../utils/formatters';

function AdminPanel({ stats }) {
  const cards = [
    { title: 'Total Orders', value: stats?.total_orders ?? '—', icon: '📦', color: '#2563eb' },
    { title: 'Revenue', value: formatCurrency(stats?.total_revenue), icon: '💰', color: '#16a34a' },
    { title: 'Products', value: stats?.total_products ?? '—', icon: '🗃️', color: '#d97706' },
    { title: 'Users', value: stats?.total_users ?? '—', icon: '👥', color: '#7c3aed' },
  ];

  const quickActions = [
    { label: 'Manage Orders', to: '/orders' },
    { label: 'Manage Inventory', to: '/inventory' },
    { label: 'Manage Users', to: '/users' },
    { label: 'View Reports', to: '/admin' },
  ];

  return (
    <div>
      <div
        className="stats-grid"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}
      >
        {cards.map((card) => (
          <StatsCard key={card.title} {...card} />
        ))}
      </div>

      <div className="card">
        <div className="card-header">Quick Actions</div>
        <div className="card-body" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {quickActions.map(({ label, to }) => (
            <Link key={to} to={to} className="btn btn-secondary">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
