import { useState, useEffect } from 'react';
import analyticsService from '../services/analyticsService';
import KPICards from '../components/KPICards';
import SalesChart from '../components/SalesChart';
import ForecastChart from '../components/ForecastChart';

export default function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (dateRange.from) params.from = dateRange.from;
    if (dateRange.to) params.to = dateRange.to;

    Promise.all([
      analyticsService.getDashboard(),
      analyticsService.getRevenueAnalytics(params),
      analyticsService.getForecast(6)
    ])
      .then(([mRes, rRes, fRes]) => {
        setMetrics(mRes.data);
        setRevenue(rRes.data);
        setForecast(fRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [dateRange]);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2>Analytics Dashboard</h2>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 13 }}>From:</label>
          <input type="date" value={dateRange.from} onChange={e => setDateRange(p => ({ ...p, from: e.target.value }))}
            style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }} />
          <label style={{ fontSize: 13 }}>To:</label>
          <input type="date" value={dateRange.to} onChange={e => setDateRange(p => ({ ...p, to: e.target.value }))}
            style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }} />
        </div>
      </div>

      {loading ? (
        <div>Loading analytics...</div>
      ) : (
        <>
          <KPICards metrics={metrics} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>
            <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <h3 style={{ marginBottom: 16 }}>Revenue Trend</h3>
              <SalesChart data={revenue?.daily || []} />
            </div>
            <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <h3 style={{ marginBottom: 16 }}>Revenue Forecast</h3>
              <ForecastChart data={forecast} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
