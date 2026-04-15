import { Link } from 'react-router-dom';
import OrderStatusBadge from '../Orders/OrderStatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

function RecentOrders({ orders = [] }) {
  const recent = orders.slice(0, 5);

  return (
    <div className="card">
      <div className="card-header">
        <span>Recent Orders</span>
        <Link to="/orders" className="btn btn-secondary btn-sm">View All</Link>
      </div>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {recent.length === 0 ? (
              <tr><td colSpan={4} className="table-empty">No recent orders.</td></tr>
            ) : (
              recent.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link to={`/orders/${order.id}`} style={{ fontFamily: 'monospace', fontWeight: '600' }}>
                      #{String(order.id).padStart(5, '0')}
                    </Link>
                  </td>
                  <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)' }}>
                    {formatDate(order.created_at || order.createdAt)}
                  </td>
                  <td><OrderStatusBadge status={order.status} /></td>
                  <td>{formatCurrency(order.total_amount ?? order.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RecentOrders;
