import { useState } from 'react';
import OrderStatusBadge from './OrderStatusBadge';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import { ordersService } from '../../services/ordersService';
import ErrorAlert from '../Common/ErrorAlert';
import SuccessMessage from '../Common/SuccessMessage';

const ORDER_STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

function OrderDetails({ order, onUpdated }) {
  const { isAdmin } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!order) return null;

  const handleStatusChange = async (status) => {
    setUpdating(true);
    setError('');
    try {
      await ordersService.updateOrderStatus(order.id, status);
      setSuccess(`Order status updated to "${status}".`);
      onUpdated?.();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const items = order.items || order.order_items || [];

  return (
    <div>
      <ErrorAlert message={error} />
      <SuccessMessage message={success} />

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">
          <span>Order #{String(order.id).padStart(5, '0')}</span>
          <OrderStatusBadge status={order.status} />
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <p className="text-muted text-sm">Created</p>
              <p>{formatDateTime(order.created_at || order.createdAt)}</p>
            </div>
            <div>
              <p className="text-muted text-sm">Total</p>
              <p className="fw-bold">{formatCurrency(order.total_amount ?? order.total)}</p>
            </div>
            <div>
              <p className="text-muted text-sm">Shipping Address</p>
              <p>{order.shipping_address || '—'}</p>
            </div>
            <div>
              <p className="text-muted text-sm">Notes</p>
              <p>{order.notes || '—'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-header">Items</div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr><td colSpan={5} className="table-empty">No items.</td></tr>
              ) : (
                items.map((item, i) => (
                  <tr key={item.id || i}>
                    <td>{item.product_name || item.product?.name || '—'}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {item.sku || item.product?.sku || '—'}
                    </td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.unit_price ?? item.price)}</td>
                    <td>{formatCurrency((item.unit_price ?? item.price) * item.quantity)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAdmin && (
        <div className="card">
          <div className="card-header">Update Status</div>
          <div className="card-body" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {ORDER_STATUSES.map((s) => (
              <button
                key={s}
                className={`btn btn-sm${order.status === s ? ' btn-primary' : ' btn-secondary'}`}
                onClick={() => handleStatusChange(s)}
                disabled={updating || order.status === s}
                style={{ textTransform: 'capitalize' }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderDetails;
