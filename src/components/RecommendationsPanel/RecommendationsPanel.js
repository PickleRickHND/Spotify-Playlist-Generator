import "./RecommendationsPanel.css";
import { useEffect, useMemo, useRef } from "react";
import { FiRefreshCw } from "react-icons/fi";
import TrackCard from "../TrackCard/TrackCard";

export default function RecommendationsPanel({
  playlist,
  recommendations,
  loadingRecs,
  onFetch,
  onAdd,
  busy,
  currentTrackId,
  isPlaying,
  progress,
  onTogglePlay,
}) {
  const prevSeedsRef = useRef("");

  const { seedKey, seedTrackIds, artistIds, trackIds } = useMemo(() => {
    const trackIds = playlist.map((t) => t.id);
    const seedTrackIds = trackIds.slice(0, 5);
    const artistIds = playlist
      .flatMap((t) => (t.artists || []).map((a) => a.id))
      .filter(Boolean);
    return {
      seedKey: seedTrackIds.join(","),
      seedTrackIds,
      artistIds,
      trackIds,
    };
  }, [playlist]);

  useEffect(() => {
    if (seedTrackIds.length >= 2 && seedKey !== prevSeedsRef.current) {
      prevSeedsRef.current = seedKey;
      onFetch(seedTrackIds, artistIds, trackIds);
    }
  }, [seedKey, seedTrackIds, artistIds, trackIds, onFetch]);

  if (playlist.length < 2) return null;

  const handleRefresh = () => {
    onFetch(seedTrackIds, artistIds, trackIds);
  };

  return (
    <section
      className="Panel RecommendationsPanel"
      aria-labelledby="recs-heading"
    >
      <div className="RecommendationsPanel-header">
        <h2 id="recs-heading" className="Panel-title">
          Recomendaciones
        </h2>
        <button
          type="button"
          className="Btn Btn--ghost Btn--small RecommendationsPanel-refreshBtn"
          onClick={handleRefresh}
          disabled={loadingRecs}
          aria-label="Actualizar recomendaciones"
        >
          <FiRefreshCw size={14} className={loadingRecs ? "spin" : ""} />
          Actualizar
        </button>
      </div>

      {loadingRecs && recommendations.length === 0 ? (
        <p className="Panel-empty">Buscando canciones similares…</p>
      ) : null}

      {recommendations.length > 0 && (
        <ul className="TrackList">
          {recommendations.map((track) => (
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
      )}

      {!loadingRecs && recommendations.length === 0 && (
        <p className="Panel-empty">
          No se encontraron recomendaciones. Prueba con otras canciones.
        </p>
      )}
    </section>
  );
}
