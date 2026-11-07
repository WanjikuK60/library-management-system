import { Link, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { ReadingListProvider } from './context/ReadingListContext.jsx';
import HomePage from './pages/HomePage.jsx';
import BookDetail from './pages/BookDetail.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import SpaceBookingPage from './pages/SpaceBookingPage.jsx';

export default function App() {
  return (
    <ReadingListProvider>
      <div className="app-shell">
        <header className="site-header">
          <Link className="brand" to="/" aria-label="Open Shelf home">
            <span className="brand-mark" aria-hidden="true">O</span>
            <span>open shelf</span>
          </Link>
          <Navbar />
        </header>

        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/books/:id" element={<BookDetail />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/space-booking" element={<ProtectedRoute><SpaceBookingPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <footer className="site-footer">
          <span>Open Shelf Library</span>
          <span>Good books make good company.</span>
        </footer>
      </div>
    </ReadingListProvider>
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
