export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage <= 1} style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: 4, cursor: currentPage <= 1 ? 'not-allowed' : 'pointer', background: '#fff' }}>&laquo;</button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onPageChange(p)} style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: 4, cursor: 'pointer', background: p === currentPage ? '#3b82f6' : '#fff', color: p === currentPage ? '#fff' : '#334155' }}>{p}</button>
      ))}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages} style={{ padding: '6px 12px', border: '1px solid #e2e8f0', borderRadius: 4, cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer', background: '#fff' }}>&raquo;</button>
    </div>
  );
}
