import { useState, useEffect } from 'react';
import inventoryService from '../services/inventoryService';
import LowStockAlerts from '../components/LowStockAlerts';

export default function InventoryDashboard() {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    inventoryService.getLevels()
      .then(res => setLevels(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = levels.filter(l =>
    !search || (l.product_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>Inventory Dashboard</h2>
      <LowStockAlerts />
      <div style={{ marginBottom: 16 }}>
        <input
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #cbd5e1', width: 280 }}
        />
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Product', 'SKU', 'Warehouse', 'Quantity', 'Reorder Point', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 13, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(level => {
                const isLow = level.quantity <= (level.reorder_point || 0);
                return (
                  <tr key={level.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px', fontSize: 14 }}>{level.product_name || level.product_id}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#64748b' }}>{level.sku || '-'}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13 }}>{level.warehouse_name || '-'}</td>
                    <td style={{ padding: '10px 14px', fontSize: 14, fontWeight: 600 }}>{level.quantity}</td>
                    <td style={{ padding: '10px 14px', fontSize: 13 }}>{level.reorder_point || 0}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 12, fontSize: 12,
                        background: level.quantity <= 0 ? '#fee2e2' : isLow ? '#fef9c3' : '#dcfce7',
                        color: level.quantity <= 0 ? '#dc2626' : isLow ? '#ca8a04' : '#16a34a'
                      }}>
                        {level.quantity <= 0 ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No inventory records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
