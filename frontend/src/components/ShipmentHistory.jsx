import { useState, useEffect } from 'react';
import shippingService from '../services/shippingService';

export default function ShipmentHistory() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    shippingService.getShipments()
      .then(res => setShipments(res.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter ? shipments.filter(s => s.status === filter) : shipments;

  const statusColor = {
    created: '#e2e8f0',
    in_transit: '#dbeafe',
    out_for_delivery: '#fef9c3',
    delivered: '#dcfce7',
    cancelled: '#fee2e2',
    exception: '#fce7f3'
  };

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        {['', 'created', 'in_transit', 'delivered', 'cancelled'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 13,
              background: filter === s ? '#3b82f6' : '#fff', color: filter === s ? '#fff' : '#475569' }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? <div>Loading...</div> : (
        <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Tracking #', 'Carrier', 'Order', 'Status', 'Created', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 13, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace', fontSize: 13 }}>{s.tracking_number || '-'}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13 }}>{s.carrier?.toUpperCase()}</td>
                  <td style={{ padding: '10px 14px', fontSize: 13 }}>{s.order_number || s.order_id?.slice(0, 8) || '-'}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 12, background: statusColor[s.status] || '#f1f5f9' }}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13 }}>{new Date(s.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: '10px 14px' }}>
                    {s.tracking_number && (
                      <a href={`/shipping?track=${s.tracking_number}`} style={{ fontSize: 13, color: '#3b82f6', textDecoration: 'none' }}>Track</a>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>No shipments found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
