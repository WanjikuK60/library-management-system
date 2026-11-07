import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReadingList } from '../context/ReadingListContext.jsx';

export default function Navbar() {
  const { books, removeBook, clearList } = useReadingList();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="nav-actions">
      <Link className="nav-link" to="/space-booking">Book a space</Link>
      <Link className="nav-link nav-auth-link" to="/login">Sign in</Link>
      <div className="reading-list-menu">
        <button
          className="reading-list-toggle"
          type="button"
          aria-expanded={isOpen}
          aria-controls="reading-list-panel"
          onClick={() => setIsOpen((open) => !open)}
        >
          Reading list <span className="reading-list-count">{books.length}</span>
        </button>
        {isOpen && (
          <section className="reading-list-panel" id="reading-list-panel" aria-label="Your reading list">
            <div className="reading-list-heading">
              <h2>Your reading list</h2>
              {books.length > 0 && <button className="plain-button" type="button" onClick={clearList}>Clear</button>}
            </div>
            {books.length === 0 ? (
              <p className="reading-list-empty">Books you save will appear here.</p>
            ) : (
              <ul>
                {books.map((book) => (
                  <li key={book.id}>
                    <Link to={`/books/${encodeURIComponent(book.id)}`} onClick={() => setIsOpen(false)}>
                      <strong>{book.title}</strong>
                      <span>{book.author}</span>
                    </Link>
                    <button
                      className="plain-button remove-book-button"
                      type="button"
                      onClick={() => removeBook(book.id)}
                      aria-label={`Remove ${book.title} from reading list`}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </div>
    </div>
  );
}
