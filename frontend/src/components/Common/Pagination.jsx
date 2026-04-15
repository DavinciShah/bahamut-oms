function Pagination({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * itemsPerPage + 1;
  const end = Math.min(currentPage * itemsPerPage, totalItems);

  const pages = [];
  const delta = 2;
  for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
    pages.push(i);
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 0',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}
    >
      <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)' }}>
        Showing {start}–{end} of {totalItems} results
      </span>

      <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          ← Prev
        </button>

        {pages[0] > 1 && (
          <>
            <button className="btn btn-secondary btn-sm" onClick={() => onPageChange(1)}>1</button>
            {pages[0] > 2 && <span style={{ padding: '0 0.25rem', color: 'var(--gray-400)' }}>…</span>}
          </>
        )}

        {pages.map((page) => (
          <button
            key={page}
            className={`btn btn-sm${page === currentPage ? ' btn-primary' : ' btn-secondary'}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <span style={{ padding: '0 0.25rem', color: 'var(--gray-400)' }}>…</span>
            )}
            <button className="btn btn-secondary btn-sm" onClick={() => onPageChange(totalPages)}>
              {totalPages}
            </button>
          </>
        )}

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next →
        </button>
      </div>
    </div>
  );
}

export default Pagination;
