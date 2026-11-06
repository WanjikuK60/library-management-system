import { useEffect, useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const timeoutId = setTimeout(() => onSearch(value), 300);
    return () => clearTimeout(timeoutId);
  }, [value, onSearch]);

  return (
    <label className="search-field">
      <span className="search-icon" aria-hidden="true">⌕</span>
      <span className="sr-only">Search books</span>
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search title, author, or ISBN"
      />
      {value && (
        <button className="clear-search" type="button" onClick={() => setValue('')} aria-label="Clear search">
          ×
        </button>
      )}
    </label>
  );
}
