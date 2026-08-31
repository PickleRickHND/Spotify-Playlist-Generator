import "./TrackCard.css";
import { formatArtists } from "../../utils/spotify";
import AudioPreviewButton from "../AudioPreviewButton/AudioPreviewButton";

export default function TrackCard({
  track,
  onAdd,
  disabled,
  currentTrackId,
  isPlaying,
  progress,
  onTogglePlay,
}) {
  return (
    <li className="TrackCard">
      <div className="TrackCard-media">
        {track.album?.images?.length > 0 ? (
          <img
            className="TrackCard-cover"
            src={track.album.images[0].url}
            alt=""
          />
        ) : (
          <div className="TrackCard-cover TrackCard-cover--empty">
            Sin carátula
          </div>
        )}
        <div className="TrackCard-playBtn">
          <AudioPreviewButton
            trackId={track.id}
            previewUrl={track.preview_url}
            currentTrackId={currentTrackId}
            isPlaying={isPlaying}
            progress={progress}
            onToggle={onTogglePlay}
          />
        </div>
      </div>
      <div className="TrackCard-body">
        <span className="TrackCard-name">{track.name}</span>
        <span className="TrackCard-artist">
          {formatArtists(track.artists)}
        </span>
        {onAdd && (
          <button
            type="button"
            className="Btn Btn--small Btn--primary"
            onClick={() => onAdd(track)}
            disabled={disabled}
            aria-label={`Agregar ${track.name} a la playlist`}
          >
            Añadir
          </button>
        )}
      </div>
    </li>
  );
}
