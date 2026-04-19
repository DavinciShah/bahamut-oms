import { useState, useEffect } from 'react';
export default function SearchBar({ onSearch, placeholder = 'Search...' }) {
  const [value, setValue] = useState('');
  useEffect(() => {
    const t = setTimeout(() => onSearch(value), 300);
    return () => clearTimeout(t);
  }, [value]);
  return (
    <input value={value} onChange={e => setValue(e.target.value)} placeholder={placeholder}
      style={{ padding: '8px 14px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 14, width: 260, outline: 'none' }} />
  );
}
