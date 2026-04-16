import { useState } from 'react';
import shippingService from '../services/shippingService';

export default function TrackingWidget() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await shippingService.getTracking(trackingNumber.trim(), carrier);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    delivered: '#dcfce7',
    in_transit: '#dbeafe',
    picked_up: '#f3e8ff',
    out_for_delivery: '#fef9c3',
    exception: '#fee2e2',
    created: '#f1f5f9'
  };

  return (
    <div>
      <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', maxWidth: 600, marginBottom: 20 }}>
        <h3 style={{ marginBottom: 16 }}>Track Your Package</h3>
        <form onSubmit={handleTrack} style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            value={trackingNumber}
            onChange={e => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number"
            required
            style={{ flex: 2, padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1', minWidth: 200 }}
          />
          <select value={carrier} onChange={e => setCarrier(e.target.value)}
            style={{ padding: '10px 12px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
            <option value="">Auto-detect carrier</option>
            <option value="fedex">FedEx</option>
            <option value="ups">UPS</option>
            <option value="dhl">DHL</option>
          </select>
          <button type="submit" disabled={loading} style={{ padding: '10px 20px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            {loading ? 'Tracking...' : 'Track'}
          </button>
        </form>
        {error && <div style={{ color: '#dc2626', marginTop: 8, fontSize: 14 }}>{error}</div>}
      </div>

      {result && (
        <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', maxWidth: 600 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Tracking Number</div>
              <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{result.trackingNumber}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Carrier</div>
              <div style={{ fontWeight: 600 }}>{result.carrier?.toUpperCase() || 'Unknown'}</div>
            </div>
          </div>
          <h4 style={{ marginBottom: 12 }}>Tracking Events</h4>
          {(result.events || []).length === 0 && <div style={{ color: '#64748b' }}>No tracking events available</div>}
          {(result.events || []).map((event, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 4, background: i === 0 ? '#3b82f6' : '#e2e8f0', borderRadius: 2, flexShrink: 0 }} />
              <div style={{ padding: '8px 12px', background: statusColors[event.status?.toLowerCase()] || '#f8fafc', borderRadius: 6, flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{event.status}</div>
                {event.location && <div style={{ fontSize: 13, color: '#475569' }}>{event.location}</div>}
                {event.description && <div style={{ fontSize: 13, color: '#64748b' }}>{event.description}</div>}
                <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                  {event.timestamp ? new Date(event.timestamp).toLocaleString() : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
