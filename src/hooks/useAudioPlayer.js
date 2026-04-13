import { useCallback, useEffect, useRef, useState } from "react";

export default function useAudioPlayer() {
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio();
    audio.volume = 0.7;
    audioRef.current = audio;

    const onTimeUpdate = () => {
      if (audio.duration) {
        setProgress(audio.currentTime / audio.duration);
      }
    };

    const onEnded = () => {
      setCurrentTrackId(null);
      setIsPlaying(false);
      setProgress(0);
    };

    const onError = () => {
      setCurrentTrackId(null);
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []);

  const togglePlay = useCallback(
    (trackId, previewUrl) => {
      if (!previewUrl) return;

      const audio = audioRef.current;
      if (!audio) return;

      if (currentTrackId === trackId && isPlaying) {
        audio.pause();
        setIsPlaying(false);
        return;
      }

      if (currentTrackId === trackId && !isPlaying) {
        audio.play().catch(() => {});
        setIsPlaying(true);
        return;
      }

      audio.pause();
      audio.src = previewUrl;
      audio.currentTime = 0;
      setProgress(0);
      setCurrentTrackId(trackId);
      audio.play().catch(() => {
        setCurrentTrackId(null);
        setIsPlaying(false);
      });
      setIsPlaying(true);
    },
    [currentTrackId, isPlaying]
  );

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
    }
    setCurrentTrackId(null);
    setIsPlaying(false);
    setProgress(0);
  }, []);

  return { currentTrackId, isPlaying, progress, togglePlay, stopPlayback };
}
