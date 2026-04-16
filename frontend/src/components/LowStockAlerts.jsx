import { useState, useEffect } from 'react';
import inventoryService from '../services/inventoryService';

export default function LowStockAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inventoryService.getLowStock()
      .then(res => setAlerts(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (alerts.length === 0) return null;

  return (
    <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>⚠️</span>
        <strong style={{ color: '#c2410c' }}>Low Stock Alerts ({alerts.length})</strong>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {alerts.slice(0, 10).map(item => (
          <div key={item.product_id || item.id} style={{
            background: '#fff', border: '1px solid #fed7aa', borderRadius: 6,
            padding: '6px 12px', fontSize: 13
          }}>
            <strong>{item.product_name || item.name}</strong>
            <span style={{ color: item.quantity <= 0 ? '#dc2626' : '#d97706', marginLeft: 6 }}>
              {item.quantity <= 0 ? 'Out of stock' : `${item.quantity} left`}
            </span>
          </div>
        ))}
        {alerts.length > 10 && (
          <div style={{ fontSize: 13, color: '#64748b', alignSelf: 'center' }}>+{alerts.length - 10} more</div>
        )}
      </div>
    </div>
  );
}
