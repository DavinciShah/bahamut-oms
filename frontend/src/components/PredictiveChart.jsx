import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import biService from '../services/biService';

export default function PredictiveChart({ showChurn }) {
  const [revenueData, setRevenueData] = useState(null);
  const [churnData, setChurnData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState(6);

  useEffect(() => {
    const promises = [biService.getRevenuePredictions(months)];
    if (showChurn) promises.push(biService.getChurnPredictions());

    Promise.all(promises)
      .then(([rRes, cRes]) => {
        setRevenueData(rRes.data);
        if (cRes) setChurnData(cRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [months, showChurn]);

  if (loading) return <div style={{ padding: 24, textAlign: 'center', color: '#94a3b8' }}>Loading predictions...</div>;

  const chartData = [
    ...(revenueData?.historical || []).slice(-6).map(d => ({
      period: d.month ? String(d.month).slice(0, 7) : 'N/A',
      actual: parseFloat(d.revenue || 0)
    })),
    ...(revenueData?.predictions || []).map(d => ({
      period: d.month,
      predicted: parseFloat(d.predicted_revenue || 0),
      confidence: d.confidence
    }))
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3>Revenue Predictions</h3>
        <select value={months} onChange={e => setMonths(parseInt(e.target.value))}
          style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid #cbd5e1' }}>
          {[3, 6, 12].map(m => <option key={m} value={m}>{m} months</option>)}
        </select>
      </div>

      <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: 20 }}>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="period" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
            <Tooltip formatter={v => [`$${parseFloat(v).toLocaleString()}`, '']} />
            <Legend />
            <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={2} dot={false} name="Actual" />
            <Line type="monotone" dataKey="predicted" stroke="#f59e0b" strokeWidth={2} strokeDasharray="6 3" dot={{ r: 3 }} name="Predicted" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {showChurn && churnData.length > 0 && (
        <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h3 style={{ marginBottom: 16 }}>Churn Risk Analysis</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Customer', 'Orders', 'Lifetime Value', 'Days Since Order', 'Churn Risk'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 12, color: '#475569', borderBottom: '1px solid #e2e8f0' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {churnData.slice(0, 10).map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 12px', fontSize: 13 }}>{c.name || c.email}</td>
                  <td style={{ padding: '8px 12px', fontSize: 13 }}>{c.order_count}</td>
                  <td style={{ padding: '8px 12px', fontSize: 13 }}>${parseFloat(c.lifetime_value || 0).toFixed(2)}</td>
                  <td style={{ padding: '8px 12px', fontSize: 13 }}>{Math.round(c.days_since_last_order || 0)}</td>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 12, fontSize: 12,
                      background: c.churn_risk === 'high' ? '#fee2e2' : c.churn_risk === 'medium' ? '#fef9c3' : '#dcfce7',
                      color: c.churn_risk === 'high' ? '#dc2626' : c.churn_risk === 'medium' ? '#ca8a04' : '#16a34a' }}>
                      {c.churn_risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
