import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiUrl } from '../api.js';

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadBook() {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(apiUrl(`/books/${encodeURIComponent(id)}`), {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(response.status === 404 ? 'We couldn’t find that book.' : `Could not load this book (${response.status}).`);
        }
        setBook(await response.json());
      } catch (requestError) {
        if (requestError.name !== 'AbortError') {
          setError(requestError.message || 'Could not load this book.');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadBook();
    return () => controller.abort();
  }, [id]);

  if (loading) {
    return <section className="message-page" aria-live="polite"><p className="eyebrow">One moment</p><h1>Finding that book…</h1></section>;
  }

  if (error) {
    return (
      <section className="message-page" role="alert">
        <p className="eyebrow">Something went wrong</p>
        <h1>{error}</h1>
        <Link className="text-link" to="/">Back to the catalog</Link>
      </section>
    );
  }

  return (
    <article className="detail-page">
      <Link className="back-link" to="/">← Back to the collection</Link>
      <div className="detail-layout">
        <div className="detail-cover" aria-hidden="true">
          <span className="cover-label">OPEN SHELF<br />RECOMMENDS</span>
          <span className="detail-cover-title">{book.title}</span>
          <span className="cover-rule" />
          <span className="cover-author">{book.author}</span>
        </div>
        <div className="detail-copy">
          <p className="eyebrow">A book worth knowing</p>
          <h1>{book.title}</h1>
          <p className="detail-author">by {book.author}</p>
          <div className="detail-rule" />
          {book.description && <p className="detail-description">{book.description}</p>}
          <dl className="book-facts">
            {book.genre && <div><dt>Genre</dt><dd>{book.genre.name}</dd></div>}
            {book.publishedAt && <div><dt>Published</dt><dd>{new Date(book.publishedAt).getFullYear()}</dd></div>}
            {book.isbn && <div><dt>ISBN</dt><dd>{book.isbn}</dd></div>}
            {book.totalCopies !== undefined && <div><dt>In the collection</dt><dd>{book.totalCopies} {book.totalCopies === 1 ? 'copy' : 'copies'}</dd></div>}
          </dl>
        </div>
      </div>
    </article>
  );
}
