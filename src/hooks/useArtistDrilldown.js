import { useCallback, useState } from "react";
import { getArtistTopTracks } from "../services/spotifyApi";

export default function useArtistDrilldown() {
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [artistTopTracks, setArtistTopTracks] = useState([]);
  const [loadingArtistTracks, setLoadingArtistTracks] = useState(false);

  const selectArtist = useCallback(async (artist) => {
    setSelectedArtist({
      id: artist.id,
      name: artist.name,
      imageUrl: artist.images?.[0]?.url || null,
    });
    setLoadingArtistTracks(true);

    try {
      const { data } = await getArtistTopTracks(artist.id);
      setArtistTopTracks(data.tracks || []);
    } catch {
      setArtistTopTracks([]);
    } finally {
      setLoadingArtistTracks(false);
    }
  }, []);

  const clearArtist = useCallback(() => {
    setSelectedArtist(null);
    setArtistTopTracks([]);
  }, []);

  return {
    selectedArtist,
    artistTopTracks,
    loadingArtistTracks,
    selectArtist,
    clearArtist,
  };
}
