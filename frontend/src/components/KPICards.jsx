export default function KPICards({ metrics }) {
  if (!metrics) return null;

  const cards = [
    {
      label: 'Revenue (30d)',
      value: metrics.revenue?.value != null ? `$${parseFloat(metrics.revenue.value).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '--',
      growth: metrics.revenue?.growth,
      icon: '💰',
      color: '#dcfce7'
    },
    {
      label: 'Orders (30d)',
      value: metrics.orders?.value ?? '--',
      growth: metrics.orders?.growth,
      icon: '📦',
      color: '#dbeafe'
    },
    {
      label: 'Customers',
      value: metrics.customers?.value ?? '--',
      icon: '👥',
      color: '#f3e8ff'
    },
    {
      label: 'Low Stock Alerts',
      value: metrics.low_stock_alerts ?? '--',
      icon: '⚠️',
      color: '#fff7ed'
    }
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
      {cards.map(card => (
        <div key={card.label} style={{
          background: card.color,
          borderRadius: 10,
          padding: 20,
          boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 13, color: '#475569', marginBottom: 6 }}>{card.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#1e293b' }}>{card.value}</div>
              {card.growth != null && (
                <div style={{ fontSize: 12, marginTop: 4, color: parseFloat(card.growth) >= 0 ? '#16a34a' : '#dc2626' }}>
                  {parseFloat(card.growth) >= 0 ? '↑' : '↓'} {Math.abs(card.growth)}% vs prev period
                </div>
              )}
            </div>
            <div style={{ fontSize: 28 }}>{card.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
