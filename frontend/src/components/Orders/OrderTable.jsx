import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderStatusBadge from './OrderStatusBadge';
import { formatCurrency, formatDate } from '../../utils/formatters';

function OrderTable({ orders = [], onSort }) {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  const handleSort = (field) => {
    const dir = sortField === field && sortDir === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDir(dir);
    onSort?.(field, dir);
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span style={{ opacity: 0.3 }}>↕</span>;
    return <span>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead>
          <tr>
            <th className="sortable" onClick={() => handleSort('id')}>
              Order ID <SortIcon field="id" />
            </th>
            <th className="sortable" onClick={() => handleSort('created_at')}>
              Date <SortIcon field="created_at" />
            </th>
            <th>Status</th>
            <th className="sortable" onClick={() => handleSort('total_amount')}>
              Total <SortIcon field="total_amount" />
            </th>
            <th>Customer</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={6} className="table-empty">No orders to display.</td>
            </tr>
          ) : (
            orders.map((order) => (
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
                <td>{formatCurrency(order.total_amount ?? order.total)}</td>
                <td style={{ fontSize: 'var(--font-size-sm)' }}>
                  {order.customer_name || order.user?.name || '—'}
                </td>
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
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default OrderTable;
