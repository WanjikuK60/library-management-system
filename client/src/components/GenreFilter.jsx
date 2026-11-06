export default function GenreFilter({ genres, value, onChange, error }) {
  return (
    <label className="genre-filter">
      <span className="sr-only">Filter by genre</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} aria-label="Filter by genre">
        <option value="">All genres</option>
        {genres.map((genre) => <option key={genre.id} value={genre.id}>{genre.name}</option>)}
      </select>
      {error && <span className="filter-hint" role="status">{error}</span>}
    </label>
  );
}
