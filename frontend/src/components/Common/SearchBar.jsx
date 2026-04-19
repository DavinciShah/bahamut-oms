import { useState, useEffect, useRef } from 'react';
import { debounce } from '../../utils/helpers';

function SearchBar({ onSearch, placeholder = 'Search…', initialValue = '' }) {
  const [query, setQuery] = useState(initialValue);

  const debouncedSearch = useRef(debounce((val) => onSearch(val), 350)).current;

  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <span
        style={{
          position: 'absolute',
          left: '0.625rem',
          color: 'var(--gray-400)',
          pointerEvents: 'none',
          fontSize: '0.875rem',
        }}
      >
        🔍
      </span>
      <input
        type="search"
        className="form-control"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        style={{ paddingLeft: '2rem', minWidth: '240px' }}
      />
    </div>
  );
}

export default SearchBar;
