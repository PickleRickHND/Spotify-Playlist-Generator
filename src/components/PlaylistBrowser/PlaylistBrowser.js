import "./PlaylistBrowser.css";
import { useEffect, useRef } from "react";

export default function PlaylistBrowser({
  userPlaylists,
  loadingPlaylists,
  onFetchPlaylists,
  onLoadPlaylist,
}) {
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      onFetchPlaylists();
    }
  }, [onFetchPlaylists]);

  if (loadingPlaylists && userPlaylists.length === 0) {
    return (
      <div className="PlaylistBrowser">
        <h3 className="Panel-title">Mis playlists</h3>
        <p className="Panel-empty">Cargando tus playlists…</p>
      </div>
    );
  }

  return (
    <div className="PlaylistBrowser">
      <h3 className="Panel-title">Mis playlists</h3>

      {userPlaylists.length === 0 ? (
        <p className="Panel-empty">No se encontraron playlists en tu cuenta.</p>
      ) : (
        <div className="PlaylistGrid">
          {userPlaylists.map((pl) => (
            <button
              key={pl.id}
              type="button"
              className="PlaylistCard"
              onClick={() => onLoadPlaylist(pl)}
            >
              {pl.imageUrl ? (
                <img src={pl.imageUrl} alt="" className="PlaylistCard-cover" />
              ) : (
                <div className="PlaylistCard-cover PlaylistCard-cover--empty" />
              )}
              <div className="PlaylistCard-info">
                <span className="PlaylistCard-name">{pl.name}</span>
                <span className="PlaylistCard-meta">
                  {pl.trackCount} canciones ·{" "}
                  {pl.isPublic ? "Pública" : "Privada"}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
