import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import analyticsService from '../services/analyticsService';

export default function TrendAnalysis() {
  const [orders, setOrders] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);
    Promise.all([
      analyticsService.getOrderAnalytics({ from: ninetyDaysAgo }),
      analyticsService.getProductAnalytics({ from: ninetyDaysAgo })
    ])
      .then(([oRes, pRes]) => {
        setOrders(oRes.data);
        setProducts(pRes.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 24, color: '#94a3b8' }}>Loading trends...</div>;

  const dailyData = (orders?.daily || []).map(d => ({
    day: new Date(d.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    orders: parseInt(d.daily_count || 0),
    revenue: parseFloat(d.revenue || 0)
  }));

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h3 style={{ marginBottom: 16 }}>Daily Orders (90d)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyData.slice(-30)} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} interval={4} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="orders" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ background: '#fff', borderRadius: 8, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h3 style={{ marginBottom: 16 }}>Top Products by Revenue</h3>
          {products.slice(0, 5).map(p => (
            <div key={p.id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                <span>{p.name}</span>
                <span style={{ fontWeight: 600 }}>${parseFloat(p.revenue || 0).toFixed(2)}</span>
              </div>
              <div style={{ background: '#f1f5f9', borderRadius: 4, height: 6 }}>
                <div style={{
                  height: '100%', borderRadius: 4, background: '#3b82f6',
                  width: `${products[0]?.revenue ? (p.revenue / products[0].revenue * 100) : 0}%`
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
