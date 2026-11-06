import { useEffect, useState } from 'react';
import { apiUrl } from '../api.js';
import BookCard from './BookCard.jsx';

export default function BookGrid({ genreId, search }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ limit: '100' });
    if (genreId) params.set('genreId', genreId);
    if (search.trim()) params.set('search', search.trim());

    async function loadBooks() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${apiUrl('/books')}?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Could not load books (${response.status}).`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('The books response was not a list.');
        }
        setBooks(data);
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message || 'Could not load books.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadBooks();
    return () => controller.abort();
  }, [genreId, search]);

  if (loading) {
    return <div className="catalog-message" aria-live="polite"><span className="spinner" />Gathering the books…</div>;
  }

  if (error) {
    return (
      <div className="catalog-message catalog-error" role="alert">
        <p>{error}</p>
        <p>Check that the library API is running, then try again.</p>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="catalog-message">
        <span className="empty-mark" aria-hidden="true">✳</span>
        <h3>No books found just yet.</h3>
        <p>Try a different search or choose another genre.</p>
      </div>
    );
  }

  return (
    <div className="book-grid">
      {books.map((book) => <BookCard key={book.id} book={book} />)}
    </div>
  );
}
