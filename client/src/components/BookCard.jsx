import { Link } from 'react-router-dom';

const coverColors = ['cover-terracotta', 'cover-olive', 'cover-blue', 'cover-plum'];

export default function BookCard({ book }) {
  const colorClass = coverColors[(book.title?.length || 0) % coverColors.length];

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
    </article>
  );
}
