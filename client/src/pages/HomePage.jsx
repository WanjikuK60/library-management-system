import { useEffect, useState } from 'react';
import { apiUrl } from '../api.js';
import BookGrid from '../components/BookGrid.jsx';
import GenreFilter from '../components/GenreFilter.jsx';
import SearchBar from '../components/SearchBar.jsx';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const [genreId, setGenreId] = useState('');
  const [genres, setGenres] = useState([]);
  const [genresError, setGenresError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function loadGenres() {
      try {
        const response = await fetch(apiUrl('/genres'), { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Could not load genres (${response.status}).`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('The genres response was not a list.');
        }
        setGenres(data);
        setGenresError('');
      } catch (error) {
        if (error.name !== 'AbortError') {
          setGenresError(error.message || 'Could not load genres.');
        }
      }
    }

    loadGenres();
    return () => controller.abort();
  }, []);

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Find your next favorite</p>
          <h1>A little more<br />wonder, <em>one page</em><br />at a time.</h1>
          <p className="hero-description">
            A good story is never far away. Explore the collection and find the book that feels like it was waiting for you.
          </p>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="sun-disc" />
          <div className="art-book art-book-one"><span>THE<br />QUIET<br />HOUR</span></div>
          <div className="art-book art-book-two"><span>WILD<br />PLACES</span></div>
          <div className="art-book art-book-three"><span>SMALL<br />WONDERS</span></div>
          <div className="art-plant">✳</div>
        </div>
      </section>

      <section className="catalog-section" aria-labelledby="catalog-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">The collection</p>
            <h2 id="catalog-title">On our shelves</h2>
          </div>
          <p className="section-aside">Take a look around. There’s something here for every kind of reader.</p>
        </div>

        <div className="catalog-tools">
          <SearchBar onSearch={setSearch} />
          <GenreFilter genres={genres} value={genreId} onChange={setGenreId} error={genresError} />
        </div>

        <BookGrid genreId={genreId} search={search} />
      </section>
    </div>
  );
}
