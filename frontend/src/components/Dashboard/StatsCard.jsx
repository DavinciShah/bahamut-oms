function StatsCard({ title, value, icon, change, changeType = 'positive', color = 'var(--primary-color)' }) {
  return (
    <div className="stats-card">
      <div
        className="stats-icon"
        style={{ backgroundColor: color + '1a', color }}
      >
        {icon}
      </div>
      <div className="stats-value">{value ?? '—'}</div>
      <div className="stats-label">{title}</div>
      {change !== undefined && (
        <div className={`stats-change ${changeType}`}>
          {changeType === 'positive' ? '▲' : '▼'} {change}
        </div>
      )}
    </div>
  );
}

export default StatsCard;
