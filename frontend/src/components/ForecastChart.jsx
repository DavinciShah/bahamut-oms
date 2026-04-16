import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ForecastChart({ data }) {
  if (!data) return <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>No forecast data</div>;

  const historical = (data.historical || []).map(d => ({
    period: d.month ? d.month.toString().slice(0, 7) : new Date(d.month || d.day).toISOString().slice(0, 7),
    actual: parseFloat(d.revenue || 0),
    type: 'historical'
  }));

  const forecast = (data.forecast || []).map(d => ({
    period: d.month,
    forecast: parseFloat(d.revenue || d.predicted_revenue || 0),
    type: 'forecast'
  }));

  const combined = [...historical.slice(-6), ...forecast];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <ComposedChart data={combined} margin={{ top: 4, right: 8, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis dataKey="period" tick={{ fontSize: 10 }} tickLine={false} />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false}
          tickFormatter={v => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
        <Tooltip formatter={(value) => [`$${parseFloat(value).toLocaleString()}`, '']} />
        <Legend />
        <Bar dataKey="actual" fill="#3b82f6" fillOpacity={0.7} name="Actual" />
        <Line type="monotone" dataKey="forecast" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} name="Forecast" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
