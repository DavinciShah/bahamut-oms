import { useState, useEffect } from 'react';
import biService from '../services/biService';

export default function AnomalyAlerts() {
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    biService.getAnomalies()
      .then(res => setAlerts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 24, color: '#94a3b8' }}>Loading anomaly alerts...</div>;
  if (!alerts) return null;

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        {[
          { label: 'Total Alerts', value: alerts.total_alerts, color: '#f0f9ff' },
          { label: 'High Severity', value: alerts.high_severity, color: '#fef2f2' }
        ].map(card => (
          <div key={card.label} style={{ background: card.color, borderRadius: 8, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', minWidth: 140 }}>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{card.value}</div>
            <div style={{ fontSize: 13, color: '#64748b' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {alerts.revenue_anomalies?.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 16 }}>
          <h3 style={{ marginBottom: 12 }}>Revenue Anomalies</h3>
          {alerts.revenue_anomalies.map((a, i) => (
            <div key={i} style={{ padding: '10px 12px', marginBottom: 8, background: a.severity === 'high' ? '#fef2f2' : '#fff7ed', borderRadius: 6, borderLeft: `3px solid ${a.severity === 'high' ? '#ef4444' : '#f59e0b'}` }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{a.message}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                {a.date ? new Date(a.date).toLocaleDateString() : ''} · Z-score: {parseFloat(a.zscore).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}

      {alerts.inventory_anomalies?.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h3 style={{ marginBottom: 12 }}>Inventory Anomalies</h3>
          {alerts.inventory_anomalies.map((a, i) => (
            <div key={i} style={{ padding: '10px 12px', marginBottom: 8, background: a.severity === 'high' ? '#fef2f2' : '#fff7ed', borderRadius: 6, borderLeft: `3px solid ${a.type === 'out_of_stock' ? '#ef4444' : '#f59e0b'}` }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{a.message}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>SKU: {a.sku} · Stock: {a.current_stock}</div>
            </div>
          ))}
        </div>
      )}

      {alerts.total_alerts === 0 && (
        <div style={{ textAlign: 'center', padding: 48, color: '#64748b' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
          <div>No anomalies detected</div>
        </div>
      )}
    </div>
  );
}
