import { useNavigate } from 'react-router-dom';
import OrderStatusBadge from './OrderStatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

function OrdersList({ orders = [] }) {
  const navigate = useNavigate();

  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <h3>No orders found</h3>
        <p>Create your first order to get started.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Status</th>
            <th>Items</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <td>
                <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>
                  #{String(order.id).padStart(5, '0')}
                </span>
              </td>
              <td>{formatDate(order.created_at || order.createdAt)}</td>
              <td><OrderStatusBadge status={order.status} /></td>
              <td>{order.item_count ?? order.items?.length ?? '—'}</td>
              <td>{formatCurrency(order.total_amount ?? order.total)}</td>
              <td>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/orders/${order.id}`);
                  }}
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OrdersList;
