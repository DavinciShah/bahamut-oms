import { useState, useEffect } from 'react';
import biService from '../services/biService';
import DataExplorer from '../components/DataExplorer';
import PredictiveChart from '../components/PredictiveChart';
import AnomalyAlerts from '../components/AnomalyAlerts';
import TrendAnalysis from '../components/TrendAnalysis';

export default function BIPortal() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    biService.getDashboard()
      .then(res => setDashboard(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'data', label: 'Data Explorer' },
    { key: 'predictions', label: 'Predictions' },
    { key: 'anomalies', label: 'Anomalies' },
    { key: 'trends', label: 'Trends' }
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ marginBottom: 20 }}>Business Intelligence Portal</h2>

      {!loading && dashboard && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'High Churn Risk', value: dashboard.churn_risk_count, icon: '📉', color: '#fee2e2' },
            { label: 'Anomaly Alerts', value: dashboard.anomaly_alerts, icon: '⚠️', color: '#fff7ed' },
            { label: 'Revenue Predictions', value: `${dashboard.revenue_predictions?.length || 0} months`, icon: '📊', color: '#dbeafe' }
          ].map(card => (
            <div key={card.label} style={{ background: card.color, borderRadius: 10, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <div style={{ fontSize: 28 }}>{card.icon}</div>
              <div style={{ fontSize: 24, fontWeight: 700, marginTop: 8 }}>{card.value}</div>
              <div style={{ fontSize: 13, color: '#475569', marginTop: 4 }}>{card.label}</div>
            </div>
          ))}
        </div>
      )}

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

      {tab === 'overview' && (
        <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h3>Revenue Forecast</h3>
          <PredictiveChart />
        </div>
      )}
      {tab === 'data' && <DataExplorer />}
      {tab === 'predictions' && <PredictiveChart showChurn />}
      {tab === 'anomalies' && <AnomalyAlerts />}
      {tab === 'trends' && <TrendAnalysis />}
    </div>
  );
}
