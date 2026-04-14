import { useCallback, useState } from "react";
import { getArtistTopTracks } from "../services/spotifyApi";

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
 * Since Spotify deprecated /v1/recommendations in Nov 2024, we build a
 * recommendations feed by fetching top tracks of the artists in the playlist
 * and filtering out tracks the user already added.
 */
export default function useRecommendations(showMessage) {
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  const fetchRecommendations = useCallback(
    async (seedTrackIds, playlistArtistIds, playlistTrackIds) => {
      if (!playlistArtistIds?.length) return;

      setLoadingRecs(true);
      try {
        const uniqueArtists = [...new Set(playlistArtistIds)].slice(0, 5);
        const responses = await Promise.all(
          uniqueArtists.map((id) =>
            getArtistTopTracks(id).then((r) => r.data.tracks || []).catch(() => [])
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
