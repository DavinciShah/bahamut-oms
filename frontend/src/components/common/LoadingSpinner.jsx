function LoadingSpinner({ size = 'md', fullPage = false }) {
  const sizes = { sm: 20, md: 36, lg: 56 };
  const px = sizes[size] || sizes.md;

  const spinner = (
    <div
      role="status"
      aria-label="Loading"
      style={{
        width: px,
        height: px,
        border: `${Math.max(2, px / 12)}px solid var(--gray-200)`,
        borderTopColor: 'var(--primary-color)',
        borderRadius: '50%',
        animation: 'spin 0.75s linear infinite',
      }}
    />
  );

  if (fullPage) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        {spinner}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      {spinner}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default LoadingSpinner;
