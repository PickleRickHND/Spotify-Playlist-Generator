import { useCallback, useState } from "react";
import { searchTracks } from "../services/spotifyApi";
import { GENRE_SEEDS } from "../utils/genres";

// Pick N random items without repetition.
function sample(array, n) {
  const copy = [...array];
  const out = [];
  while (out.length < n && copy.length > 0) {
    const idx = Math.floor(Math.random() * copy.length);
    out.push(copy.splice(idx, 1)[0]);
  }
  return out;
}

export function buildMoodSearchTerms({
  energy,
  danceability,
  valence,
  tempo,
}) {
  const terms = [];
  if (energy >= 0.67) terms.push("workout");
  if (energy <= 0.33) terms.push("chill");
  if (danceability >= 0.67) terms.push("dance");
  if (valence >= 0.67) terms.push("happy");
  if (valence <= 0.33) terms.push("sad");
  if (tempo >= 140) terms.push("fast");
  if (tempo <= 90) terms.push("slow");
  return terms;
}

export default function useMoodGenerator(showMessage) {
  const [energy, setEnergy] = useState(0.5);
  const [danceability, setDanceability] = useState(0.5);
  const [valence, setValence] = useState(0.5);
  const [tempo, setTempo] = useState(120);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [limit, setLimit] = useState(20);
  const [genreOptions] = useState(GENRE_SEEDS);
  const [generatedTracks, setGeneratedTracks] = useState([]);
  const [loadingGenerate, setLoadingGenerate] = useState(false);

  const fetchGenreSeeds = useCallback(async () => {
    // No-op: genres are loaded from a local list (Spotify deprecated the endpoint).
  }, []);

  const toggleGenre = useCallback(
    (genre) => {
      setSelectedGenres((prev) => {
        if (prev.includes(genre)) {
          return prev.filter((g) => g !== genre);
        }
        if (prev.length >= 5) {
          showMessage("Máximo 5 géneros permitidos.", "warning");
          return prev;
        }
        return [...prev, genre];
      });
    },
    [showMessage]
  );

  const generatePlaylist = useCallback(async () => {
    if (selectedGenres.length === 0) {
      showMessage("Selecciona al menos un género.", "warning");
      return;
    }

    setLoadingGenerate(true);
    try {
      const moodTerms = buildMoodSearchTerms({
        energy,
        danceability,
        valence,
        tempo,
      });
      const perGenre = Math.ceil(limit / selectedGenres.length);
      const pagesPerGenre = Math.min(Math.ceil(perGenre / 10), 2);
      const results = await Promise.all(
        selectedGenres.flatMap((genre) => {
          const genreQuery = `genre:"${genre}"`;
          const query = [...moodTerms, genreQuery].join(" ");
          return Array.from({ length: pagesPerGenre }, (_, page) =>
            searchTracks(query, 10, undefined, page * 10).then(async (response) => {
              const tracks = response.data.tracks?.items || [];
              if (tracks.length > 0 || moodTerms.length === 0 || page > 0) {
                return tracks;
              }
              const fallback = await searchTracks(genreQuery, 10);
              return fallback.data.tracks?.items || [];
            })
          );
        })
      );

      const seen = new Set();
      const pool = [];
      for (const list of results) {
        for (const track of list) {
          if (!seen.has(track.id)) {
            seen.add(track.id);
            pool.push(track);
          }
        }
      }

      const shuffled = sample(pool, limit);
      setGeneratedTracks(shuffled);

      if (shuffled.length === 0) {
        showMessage("No se encontraron canciones con esos géneros.", "info");
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        showMessage("Error al generar playlist. Intenta de nuevo.", "error");
      }
      setGeneratedTracks([]);
    } finally {
      setLoadingGenerate(false);
    }
  }, [
    selectedGenres,
    limit,
    energy,
    danceability,
    valence,
    tempo,
    showMessage,
  ]);

  return {
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
    loadingGenres: false,
    generatedTracks,
    loadingGenerate,
    generatePlaylist,
    fetchGenreSeeds,
  };
}
