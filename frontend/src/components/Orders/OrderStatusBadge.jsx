import { classNames } from '../../utils/helpers';

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    bg: '#fef9c3', color: '#854d0e' },
  processing: { label: 'Processing', bg: '#dbeafe', color: '#1e40af' },
  shipped:    { label: 'Shipped',    bg: '#ffedd5', color: '#9a3412' },
  delivered:  { label: 'Delivered',  bg: '#dcfce7', color: '#166534' },
  cancelled:  { label: 'Cancelled',  bg: '#fee2e2', color: '#991b1b' },
};

function OrderStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, bg: '#f1f5f9', color: '#475569' };

  return (
    <span
      style={{
        display: 'inline-block',
        padding: '0.2rem 0.625rem',
        borderRadius: 'var(--border-radius-full)',
        fontSize: '0.75rem',
        fontWeight: '600',
        backgroundColor: config.bg,
        color: config.color,
        textTransform: 'capitalize',
      }}
    >
      {config.label}
    </span>
  );
}

export default OrderStatusBadge;
