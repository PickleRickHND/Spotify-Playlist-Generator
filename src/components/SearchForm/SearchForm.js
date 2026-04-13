import "./SearchForm.css";

export default function SearchForm({
  searchKey,
  onSearchKeyChange,
  onSubmit,
  loading,
}) {
  return (
    <form className="SearchForm" onSubmit={onSubmit}>
      <label className="FieldLabel" htmlFor="search-q">
        Buscar
      </label>
      <div className="SearchForm-row">
        <input
          id="search-q"
          className="Input SearchInput"
          type="search"
          placeholder="Álbum, artista o tema…"
          value={searchKey}
          onChange={(e) => onSearchKeyChange(e.target.value)}
          disabled={loading}
          autoComplete="off"
          aria-describedby="search-hint"
        />
        <button type="submit" className="Btn Btn--accent" disabled={loading}>
          {loading ? "Buscando…" : "Buscar"}
        </button>
      </div>
      <p id="search-hint" className="FieldHint">
        Resultados de Spotify (hasta 10). Una nueva búsqueda cancela la
        anterior.
      </p>
    </form>
  );
}
