function StockIndicator({ quantity }) {
  let color, label;

  if (quantity === 0) {
    color = 'var(--danger-color)';
    label = 'Out of Stock';
  } else if (quantity <= 10) {
    color = 'var(--warning-color)';
    label = `Low (${quantity})`;
  } else {
    color = 'var(--success-color)';
    label = `In Stock (${quantity})`;
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        fontSize: '0.75rem',
        fontWeight: '500',
        color,
      }}
    >
      <span
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: color,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );
}

export default StockIndicator;
