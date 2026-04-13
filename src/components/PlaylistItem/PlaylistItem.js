import "./PlaylistItem.css";
import { formatArtists } from "../../utils/spotify";
import AudioPreviewButton from "../AudioPreviewButton/AudioPreviewButton";

export default function PlaylistItem({
  track,
  index,
  onRemove,
  disabled,
  currentTrackId,
  isPlaying,
  progress,
  onTogglePlay,
}) {
  return (
    <li className="PlaylistItem">
      {track.album?.images?.length > 0 ? (
        <img
          src={track.album.images[track.album.images.length - 1].url}
          alt=""
          className="PlaylistItem-cover"
        />
      ) : (
        <div className="PlaylistItem-cover PlaylistItem-cover--empty" />
      )}
      <AudioPreviewButton
        trackId={track.id}
        previewUrl={track.preview_url}
        currentTrackId={currentTrackId}
        isPlaying={isPlaying}
        progress={progress}
        onToggle={onTogglePlay}
        size="small"
      />
      <div className="PlaylistItem-text">
        <span className="PlaylistItem-name">{track.name}</span>
        <span className="PlaylistItem-artist">
          {formatArtists(track.artists)}
        </span>
      </div>
      <button
        type="button"
        className="PlaylistItem-remove"
        onClick={() => onRemove(index)}
        disabled={disabled}
        aria-label={`Quitar ${track.name} de la lista`}
      >
        ×
      </button>
    </li>
  );
}
