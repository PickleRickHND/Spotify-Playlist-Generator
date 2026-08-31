import { useCallback, useState } from "react";
import { searchArtistTracks } from "../services/spotifyApi";

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
      const { data } = await searchArtistTracks(artist.name);
      setArtistTopTracks(data.tracks?.items || []);
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
