import "./AudioPreviewButton.css";
import { FiPlay, FiPause } from "react-icons/fi";

const RADIUS = 15;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function AudioPreviewButton({
  trackId,
  previewUrl,
  currentTrackId,
  isPlaying,
  progress,
  onToggle,
  size = "normal",
}) {
  const isActive = currentTrackId === trackId && isPlaying;
  const showProgress = currentTrackId === trackId;
  const dashOffset = CIRCUMFERENCE - progress * CIRCUMFERENCE;
  const btnSize = size === "small" ? "AudioBtn--small" : "";

  if (!previewUrl) {
    return (
      <button
        type="button"
        className={`AudioBtn AudioBtn--disabled ${btnSize}`}
        disabled
        title="Vista previa no disponible"
        aria-label="Vista previa no disponible"
      >
        <FiPlay size={size === "small" ? 12 : 14} />
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`AudioBtn ${isActive ? "AudioBtn--playing" : ""} ${btnSize}`}
      onClick={() => onToggle(trackId, previewUrl)}
      aria-label={isActive ? "Pausar vista previa" : "Reproducir vista previa"}
    >
      {showProgress && (
        <svg className="AudioBtn-ring" viewBox="0 0 36 36">
          <circle
            cx="18"
            cy="18"
            r={RADIUS}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            transform="rotate(-90 18 18)"
          />
        </svg>
      )}
      {isActive ? (
        <FiPause size={size === "small" ? 12 : 14} />
      ) : (
        <FiPlay size={size === "small" ? 12 : 14} />
      )}
    </button>
  );
}
