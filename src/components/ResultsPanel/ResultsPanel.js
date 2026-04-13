import "./ResultsPanel.css";
import TrackCard from "../TrackCard/TrackCard";

export default function ResultsPanel({
  tracks,
  loadingSearch,
  onAdd,
  busy,
  currentTrackId,
  isPlaying,
  progress,
  onTogglePlay,
}) {
  return (
    <section className="Panel Panel--results" aria-labelledby="results-heading">
      <h2 id="results-heading" className="Panel-title">
        Resultados
      </h2>
      {loadingSearch && tracks.length === 0 ? (
        <p className="Panel-empty">Buscando en la biblioteca…</p>
      ) : null}
      <ul className="TrackList">
        {tracks.map((track) => (
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
    </section>
  );
}
