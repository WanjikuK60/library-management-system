import { Link } from 'react-router-dom';
import { useReadingList } from '../context/ReadingListContext.jsx';

const coverColors = ['cover-terracotta', 'cover-olive', 'cover-blue', 'cover-plum'];

export default function BookCard({ book }) {
  const colorClass = coverColors[(book.title?.length || 0) % coverColors.length];
  const { books, addBook, removeBook } = useReadingList();
  const isSaved = books.some((savedBook) => savedBook.id === book.id);

  return (
    <article className="book-card">
      <Link className="book-card-link" to={`/books/${encodeURIComponent(book.id)}`}>
        <div className={`book-cover ${colorClass}`}>
          <span className="book-cover-stamp">OPEN<br />SHELF</span>
          <span className="book-cover-title">{book.title}</span>
          <span className="book-cover-line" />
          <span className="book-cover-author">{book.author}</span>
        </div>
        <div className="book-card-info">
          <h3>{book.title}</h3>
          <p>{book.author}</p>
        </div>
      </Link>
      <button
        className="save-book-button"
        type="button"
        onClick={() => (isSaved ? removeBook(book.id) : addBook(book))}
        aria-pressed={isSaved}
      >
        {isSaved ? 'Remove from list' : 'Add to reading list'}
      </button>
    </article>
  );
}
