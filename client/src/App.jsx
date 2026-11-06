import { Link, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import BookDetail from './pages/BookDetail.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <Link className="brand" to="/" aria-label="Open Shelf home">
          <span className="brand-mark" aria-hidden="true">O</span>
          <span>open shelf</span>
        </Link>
        <span className="header-note">Your neighborhood library</span>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/books/:id" element={<BookDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <span>Open Shelf Library</span>
        <span>Good books make good company.</span>
      </footer>
    </div>
  );
}

function NotFound() {
  return (
    <section className="message-page">
      <p className="eyebrow">Page not found</p>
      <h1>This page isn’t on our shelves.</h1>
      <Link className="text-link" to="/">Return to the catalog</Link>
    </section>
  );
}
