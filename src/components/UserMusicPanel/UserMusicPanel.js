import "./UserMusicPanel.css";
import { FiArrowLeft } from "react-icons/fi";
import TrackCard from "../TrackCard/TrackCard";

export default function UserMusicPanel({
  topTracks,
  topArtists,
  selectedArtist,
  artistTopTracks,
  loadingArtistTracks,
  onSelectArtist,
  onClearArtist,
  onAdd,
  busy,
  currentTrackId,
  isPlaying,
  progress,
  onTogglePlay,
}) {
  if (selectedArtist) {
    return (
      <div className="UserMusic">
        <button
          type="button"
          className="Btn Btn--ghost Btn--small UserMusic-back"
          onClick={onClearArtist}
        >
          <FiArrowLeft size={14} />
          Volver
        </button>

        <div className="UserMusic-section">
          <div className="UserMusic-artistHeader">
            {selectedArtist.imageUrl && (
              <img
                src={selectedArtist.imageUrl}
                alt=""
                className="UserMusic-artistImg"
              />
            )}
            <h3 className="UserMusic-artistName">{selectedArtist.name}</h3>
          </div>

          {loadingArtistTracks ? (
            <p className="Panel-empty">Cargando canciones populares…</p>
          ) : (
            <ul className="TrackList">
              {artistTopTracks.map((track) => (
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
        </div>
      </div>
    );
  }

  return (
    <div className="UserMusic">
      {topTracks.length > 0 && (
        <div className="UserMusic-section">
          <h3 className="UserMusic-heading">
            Tus canciones más escuchadas
          </h3>
          <ul className="TrackList">
            {topTracks.map((track) => (
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

      {topArtists.length > 0 && (
        <div className="UserMusic-section">
          <h3 className="UserMusic-heading">
            Tus artistas más escuchados
          </h3>
          <div className="ArtistScroll">
            {topArtists.map((artist) => (
              <button
                key={artist.id}
                type="button"
                className="ArtistCard"
                onClick={() => onSelectArtist(artist)}
              >
                {artist.images?.[0]?.url ? (
                  <img
                    src={artist.images[0].url}
                    alt=""
                    className="ArtistCard-image"
                  />
                ) : (
                  <div className="ArtistCard-image ArtistCard-image--empty" />
                )}
                <span className="ArtistCard-name">{artist.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {topTracks.length === 0 && topArtists.length === 0 && (
        <p className="Panel-empty">
          Aún no tenemos datos suficientes de tu cuenta. Escucha más música en
          Spotify y vuelve a intentarlo.
        </p>
      )}
    </div>
  );
}
