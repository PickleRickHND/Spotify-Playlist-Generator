import "./PlaylistPanel.css";
import PlaylistItem from "../PlaylistItem/PlaylistItem";

export default function PlaylistPanel({
  playlist,
  playlistName,
  playlistIsPublic,
  onNameChange,
  onPublicChange,
  onRemove,
  onSave,
  loadingSave,
  busy,
  currentTrackId,
  isPlaying,
  progress,
  onTogglePlay,
  editingPlaylistId,
  onExitEditMode,
}) {
  const isEditing = !!editingPlaylistId;

  return (
    <section className="Panel Panel--playlist" aria-labelledby="playlist-heading">
      <h2 id="playlist-heading" className="Panel-title">
        {isEditing ? "Editando playlist" : "Tu lista"}
      </h2>

      <div className="PlaylistFields">
        <div className="Field">
          <label className="FieldLabel" htmlFor="playlist-name">
            Nombre de la playlist
          </label>
          <input
            id="playlist-name"
            className="Input"
            type="text"
            placeholder="Ej. Viaje nocturno"
            value={playlistName}
            onChange={(e) => onNameChange(e.target.value)}
            disabled={loadingSave || isEditing}
          />
        </div>

        {!isEditing && (
          <div className="Field Field--inline">
            <input
              id="playlist-public"
              type="checkbox"
              className="Checkbox"
              checked={playlistIsPublic}
              onChange={(e) => onPublicChange(e.target.checked)}
              disabled={loadingSave}
            />
            <label htmlFor="playlist-public" className="CheckboxLabel">
              Visible en mi perfil de Spotify
            </label>
          </div>
        )}
      </div>

      {playlist.length === 0 ? (
        <p className="Panel-empty">
          Aún no hay canciones. Añade temas desde la izquierda.
        </p>
      ) : (
        <ul className="PlaylistItems">
          {playlist.map((track, index) => (
            <PlaylistItem
              key={track.id}
              track={track}
              index={index}
              onRemove={onRemove}
              disabled={busy}
              currentTrackId={currentTrackId}
              isPlaying={isPlaying}
              progress={progress}
              onTogglePlay={onTogglePlay}
            />
          ))}
        </ul>
      )}

      {playlist.length > 0 && (
        <button
          type="button"
          className="Btn Btn--primary Btn--block SaveBtn"
          onClick={onSave}
          disabled={loadingSave}
          aria-busy={loadingSave}
        >
          {loadingSave
            ? "Guardando…"
            : isEditing
            ? `Guardar cambios (${playlist.length})`
            : `Guardar en Spotify (${playlist.length})`}
        </button>
      )}

      {isEditing && (
        <button
          type="button"
          className="Btn Btn--ghost Btn--block PlaylistPanel-cancel"
          onClick={onExitEditMode}
          disabled={loadingSave}
        >
          Cancelar edición
        </button>
      )}
    </section>
  );
}
