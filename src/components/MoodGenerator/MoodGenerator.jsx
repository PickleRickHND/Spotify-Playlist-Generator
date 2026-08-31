import "./MoodGenerator.css";
import Slider from "../Slider/Slider";
import GenreSelector from "../GenreSelector/GenreSelector";
import TrackCard from "../TrackCard/TrackCard";

const LIMIT_OPTIONS = [10, 20, 30, 50];

export default function MoodGenerator({
  energy,
  setEnergy,
  danceability,
  setDanceability,
  valence,
  setValence,
  tempo,
  setTempo,
  selectedGenres,
  toggleGenre,
  limit,
  setLimit,
  genreOptions,
  loadingGenres,
  generatedTracks,
  loadingGenerate,
  generatePlaylist,
  onAdd,
  onFillPlaylist,
  busy,
  currentTrackId,
  isPlaying,
  progress,
  onTogglePlay,
}) {
  const formatPercent = (v) => `${Math.round(v * 100)}%`;

  return (
    <div className="MoodGenerator">
      <div className="Panel MoodGenerator-controls">
        <h3 className="Panel-title">Genera por estado de ánimo</h3>

        <Slider
          label="Energía"
          min={0}
          max={1}
          step={0.05}
          value={energy}
          onChange={setEnergy}
          formatValue={formatPercent}
        />
        <Slider
          label="Bailabilidad"
          min={0}
          max={1}
          step={0.05}
          value={danceability}
          onChange={setDanceability}
          formatValue={formatPercent}
        />
        <Slider
          label="Positividad"
          min={0}
          max={1}
          step={0.05}
          value={valence}
          onChange={setValence}
          formatValue={formatPercent}
        />
        <Slider
          label="Tempo"
          min={60}
          max={200}
          step={1}
          value={tempo}
          onChange={setTempo}
          unit=" BPM"
        />

        <GenreSelector
          genres={genreOptions}
          selected={selectedGenres}
          onToggle={toggleGenre}
          loading={loadingGenres}
        />

        <div className="MoodGenerator-limitRow">
          <span className="FieldLabel">Cantidad</span>
          <div className="LimitSelector">
            {LIMIT_OPTIONS.map((opt) => (
              <button
                key={opt}
                type="button"
                className={`LimitPill ${
                  limit === opt ? "LimitPill--active" : ""
                }`}
                onClick={() => setLimit(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="Btn Btn--accent Btn--block"
          onClick={generatePlaylist}
          disabled={loadingGenerate || selectedGenres.length === 0}
        >
          {loadingGenerate ? "Generando…" : "Generar playlist"}
        </button>
      </div>

      {generatedTracks.length > 0 && (
        <div className="MoodGenerator-results">
          <div className="MoodGenerator-resultsHeader">
            <h3 className="Panel-title">
              Resultados ({generatedTracks.length})
            </h3>
            <button
              type="button"
              className="Btn Btn--primary Btn--small"
              onClick={() => onFillPlaylist(generatedTracks)}
              disabled={busy}
            >
              Añadir todo a la playlist
            </button>
          </div>

          <ul className="TrackList">
            {generatedTracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                onAdd={onAdd}
                disabled={busy}
                currentTrackId={currentTrackId}
                isPlaying={isPlaying}
                progress={progress}
                onTogglePlay={onTogglePlay}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
