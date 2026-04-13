import "./GenreSelector.css";

export default function GenreSelector({
  genres,
  selected,
  onToggle,
  loading,
  maxSelections = 5,
}) {
  if (loading) {
    return <p className="Panel-empty">Cargando géneros…</p>;
  }

  return (
    <div className="GenreSelector">
      <div className="GenreSelector-header">
        <span className="FieldLabel">Géneros</span>
        <span className="GenreSelector-count">
          {selected.length}/{maxSelections}
        </span>
      </div>
      <div className="GenreSelector-grid">
        {genres.map((genre) => {
          const isSelected = selected.includes(genre);
          const isDisabled = !isSelected && selected.length >= maxSelections;
          return (
            <button
              key={genre}
              type="button"
              className={`GenreChip ${isSelected ? "GenreChip--selected" : ""} ${
                isDisabled ? "GenreChip--disabled" : ""
              }`}
              onClick={() => onToggle(genre)}
              disabled={isDisabled}
            >
              {genre}
            </button>
          );
        })}
      </div>
    </div>
  );
}
