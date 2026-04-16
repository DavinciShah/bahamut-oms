import { useState, useEffect } from 'react';
import shippingService from '../services/shippingService';
import ShipmentHistory from '../components/ShipmentHistory';
import RateQuoter from '../components/RateQuoter';
import TrackingWidget from '../components/TrackingWidget';

export default function ShippingPage() {
  const [tab, setTab] = useState('shipments');

  const tabs = [
    { key: 'shipments', label: 'Shipments' },
    { key: 'rates', label: 'Rate Quoter' },
    { key: 'tracking', label: 'Track Package' }
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 20 }}>Shipping & Logistics</h2>
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid #e2e8f0' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding: '10px 20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14,
              borderBottom: tab === t.key ? '2px solid #3b82f6' : '2px solid transparent',
              color: tab === t.key ? '#3b82f6' : '#64748b', marginBottom: -2 }}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === 'shipments' && <ShipmentHistory />}
      {tab === 'rates' && <RateQuoter />}
      {tab === 'tracking' && <TrackingWidget />}
    </div>
  );
}
