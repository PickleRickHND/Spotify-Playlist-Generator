import { useCallback, useState } from "react";
import { searchArtistTracks } from "../services/spotifyApi";

// Shuffle helper using Fisher-Yates.
function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Spotify depreco /recommendations y retiro el endpoint de top tracks por
 * artista. La lista se construye con busquedas por nombre de artista y elimina
 * canciones que ya estan en la playlist.
 */
export default function useRecommendations(showMessage) {
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  const fetchRecommendations = useCallback(
    async (_seedTrackIds, playlistArtistNames, playlistTrackIds) => {
      if (!playlistArtistNames?.length) return;

      setLoadingRecs(true);
      try {
        const uniqueArtists = [...new Set(playlistArtistNames)].slice(0, 5);
        const responses = await Promise.all(
          uniqueArtists.map((name) =>
            searchArtistTracks(name)
              .then((response) => response.data.tracks?.items || [])
              .catch(() => [])
          )
        );

        const existing = new Set(playlistTrackIds || []);
        const seen = new Set();
        const pool = [];

        for (const list of responses) {
          for (const track of list) {
            if (!existing.has(track.id) && !seen.has(track.id)) {
              seen.add(track.id);
              pool.push(track);
            }
          }
        }

        setRecommendations(shuffle(pool).slice(0, 20));
      } catch (error) {
        if (error.response?.status !== 401) {
          showMessage(
            "No se pudieron obtener recomendaciones. Intenta de nuevo.",
            "error"
          );
        }
        setRecommendations([]);
      } finally {
        setLoadingRecs(false);
      }
    },
    [showMessage]
  );

  const clearRecommendations = useCallback(() => {
    setRecommendations([]);
  }, []);

  return { recommendations, loadingRecs, fetchRecommendations, clearRecommendations };
}
