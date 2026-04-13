import { useCallback, useState } from "react";
import { getRecommendations, getGenreSeeds } from "../services/spotifyApi";

export default function useMoodGenerator(showMessage) {
  const [energy, setEnergy] = useState(0.5);
  const [danceability, setDanceability] = useState(0.5);
  const [valence, setValence] = useState(0.5);
  const [tempo, setTempo] = useState(120);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [limit, setLimit] = useState(20);
  const [genreOptions, setGenreOptions] = useState([]);
  const [generatedTracks, setGeneratedTracks] = useState([]);
  const [loadingGenerate, setLoadingGenerate] = useState(false);
  const [loadingGenres, setLoadingGenres] = useState(false);

  const fetchGenreSeeds = useCallback(async () => {
    if (genreOptions.length > 0) return;
    setLoadingGenres(true);
    try {
      const { data } = await getGenreSeeds();
      setGenreOptions(data.genres || []);
    } catch (err) {
      if (err.response?.status !== 401) {
        showMessage("Error al cargar géneros.", "error");
      }
    } finally {
      setLoadingGenres(false);
    }
  }, [genreOptions.length, showMessage]);

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
      const { data } = await getRecommendations({
        seed_genres: selectedGenres.join(","),
        target_energy: energy,
        target_danceability: danceability,
        target_valence: valence,
        target_tempo: tempo,
        limit,
      });
      setGeneratedTracks(data.tracks || []);

      if ((data.tracks || []).length === 0) {
        showMessage("No se encontraron canciones con esos parámetros.", "info");
      }
    } catch (error) {
      if (error.response?.status !== 401) {
        showMessage("Error al generar playlist. Intenta de nuevo.", "error");
      }
      setGeneratedTracks([]);
    } finally {
      setLoadingGenerate(false);
    }
  }, [selectedGenres, energy, danceability, valence, tempo, limit, showMessage]);

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
    loadingGenres,
    generatedTracks,
    loadingGenerate,
    generatePlaylist,
    fetchGenreSeeds,
  };
}
