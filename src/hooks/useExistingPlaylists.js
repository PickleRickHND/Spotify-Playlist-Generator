import { useCallback, useState } from "react";
import {
  getUserPlaylists,
  getPlaylistTracks,
  addTracksToPlaylist,
  removeTracksFromPlaylist,
} from "../services/spotifyApi";
import { chunkUris } from "../utils/spotify";

export default function useExistingPlaylists(showMessage) {
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);

  const fetchUserPlaylists = useCallback(async () => {
    setLoadingPlaylists(true);
    try {
      const { data } = await getUserPlaylists(50, 0);
      setUserPlaylists(
        (data.items || []).map((p) => ({
          id: p.id,
          name: p.name,
          imageUrl: p.images?.[0]?.url || null,
          trackCount: p.tracks?.total || 0,
          isPublic: p.public,
          owner: p.owner?.display_name || "",
        }))
      );
    } catch (error) {
      if (error.response?.status !== 401) {
        showMessage("Error al cargar playlists.", "error");
      }
    } finally {
      setLoadingPlaylists(false);
    }
  }, [showMessage]);

  const fetchPlaylistTracks = useCallback(async (playlistId) => {
    const allTracks = [];
    let offset = 0;
    const pageSize = 50;

    while (offset < 200) {
      const { data } = await getPlaylistTracks(playlistId, pageSize, offset);
      const items = (data.items || [])
        .filter((item) => item.track)
        .map((item) => item.track);
      allTracks.push(...items);

      if (!data.next || items.length < pageSize) break;
      offset += pageSize;
    }

    return allTracks;
  }, []);

  const saveChangesToPlaylist = useCallback(
    async (playlistId, addUris, removeUris) => {
      if (removeUris.length > 0) {
        const removeBatches = chunkUris(removeUris);
        for (const batch of removeBatches) {
          await removeTracksFromPlaylist(playlistId, batch);
        }
      }

      if (addUris.length > 0) {
        const addBatches = chunkUris(addUris);
        for (const batch of addBatches) {
          await addTracksToPlaylist(playlistId, batch);
        }
      }
    },
    []
  );

  return {
    userPlaylists,
    loadingPlaylists,
    fetchUserPlaylists,
    fetchPlaylistTracks,
    saveChangesToPlaylist,
  };
}
