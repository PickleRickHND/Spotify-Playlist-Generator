import { useCallback, useState } from "react";
import { getRecommendations } from "../services/spotifyApi";

export default function useRecommendations(showMessage) {
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  const fetchRecommendations = useCallback(
    async (seedTrackIds) => {
      if (!seedTrackIds.length) return;

      setLoadingRecs(true);
      try {
        const { data } = await getRecommendations({
          seed_tracks: seedTrackIds.slice(0, 5).join(","),
          limit: 20,
        });
        setRecommendations(data.tracks || []);
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
