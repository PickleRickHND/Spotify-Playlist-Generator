import { useCallback, useRef, useState } from "react";
import {
  getCurrentUser,
  createPlaylist,
  addTracksToPlaylist,
  removeTracksFromPlaylist,
} from "../services/spotifyApi";
import { chunkUris } from "../utils/spotify";

export default function usePlaylist(showMessage, logout) {
  const [playlist, setPlaylist] = useState([]);
  const [playlistName, setPlaylistName] = useState("Mi Nueva Playlist");
  const [playlistIsPublic, setPlaylistIsPublic] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [editingPlaylistId, setEditingPlaylistId] = useState(null);
  const originalTracksRef = useRef([]);

  const addToPlaylist = useCallback(
    (track) => {
      setPlaylist((prev) => {
        const exists = prev.some((t) => t.id === track.id);
        if (exists) {
          showMessage(`"${track.name}" ya está en la playlist`, "warning");
          return prev;
        }
        showMessage(`"${track.name}" agregado a la playlist`, "success");
        return [...prev, track];
      });
    },
    [showMessage]
  );

  const removeFromPlaylist = useCallback(
    (index) => {
      setPlaylist((prev) => {
        const trackName = prev[index]?.name ?? "Canción";
        showMessage(`"${trackName}" removido de la playlist`, "info");
        return prev.filter((_, i) => i !== index);
      });
    },
    [showMessage]
  );

  const clearPlaylist = useCallback(() => {
    setPlaylist([]);
    setPlaylistName("Mi Nueva Playlist");
    setPlaylistIsPublic(false);
    setEditingPlaylistId(null);
    originalTracksRef.current = [];
  }, []);

  const fillPlaylist = useCallback(
    (tracks) => {
      setPlaylist(tracks);
      showMessage(`Playlist generada con ${tracks.length} canciones`, "success");
    },
    [showMessage]
  );

  const loadExistingPlaylist = useCallback((playlistId, tracks, name, isPublic) => {
    setPlaylist(tracks);
    setPlaylistName(name);
    setPlaylistIsPublic(isPublic);
    setEditingPlaylistId(playlistId);
    originalTracksRef.current = tracks.map((t) => t.uri);
  }, []);

  const exportToSpotify = useCallback(async () => {
    if (playlist.length === 0) {
      showMessage("La playlist está vacía. Agrega canciones primero.", "error");
      return;
    }
    if (!playlistName.trim()) {
      showMessage("Por favor, ingresa un nombre para la playlist.", "error");
      return;
    }

    setLoadingSave(true);

    try {
      if (editingPlaylistId) {
        const currentUris = playlist.map((t) => t.uri);
        const originalUris = originalTracksRef.current;

        const toRemove = originalUris.filter((uri) => !currentUris.includes(uri));
        const toAdd = currentUris.filter((uri) => !originalUris.includes(uri));

        if (toRemove.length > 0) {
          const removeBatches = chunkUris(toRemove);
          for (const batch of removeBatches) {
            await removeTracksFromPlaylist(editingPlaylistId, batch);
          }
        }

        if (toAdd.length > 0) {
          const addBatches = chunkUris(toAdd);
          for (const batch of addBatches) {
            await addTracksToPlaylist(editingPlaylistId, batch);
          }
        }

        showMessage(
          `Playlist "${playlistName.trim()}" actualizada.`,
          "success"
        );
        clearPlaylist();
        return;
      }

      const userResponse = await getCurrentUser();
      const userId = userResponse.data.id;

      const createResponse = await createPlaylist(
        userId,
        playlistName.trim(),
        playlistIsPublic,
        "Playlist creada con Spotify Playlist Generator"
      );
      const playlistId = createResponse.data.id;

      const trackUris = playlist.map((t) => t.uri);
      const batches = chunkUris(trackUris);

      for (const batch of batches) {
        await addTracksToPlaylist(playlistId, batch);
      }

      showMessage(
        `Playlist "${playlistName.trim()}" creada con ${playlist.length} canciones.`,
        "success"
      );
      clearPlaylist();
    } catch (error) {
      if (error.response?.status === 401) {
        showMessage("Sesión expirada. Por favor, inicia sesión nuevamente.", "error");
        logout();
      } else if (error.response?.status === 403) {
        showMessage("No tienes permisos suficientes. Vuelve a iniciar sesión.", "error");
      } else {
        showMessage("Error al guardar la playlist. Por favor, intenta de nuevo.", "error");
      }
    } finally {
      setLoadingSave(false);
    }
  }, [playlist, playlistName, playlistIsPublic, editingPlaylistId, showMessage, logout, clearPlaylist]);

  return {
    playlist,
    playlistName,
    playlistIsPublic,
    loadingSave,
    editingPlaylistId,
    setPlaylistName,
    setPlaylistIsPublic,
    addToPlaylist,
    removeFromPlaylist,
    clearPlaylist,
    fillPlaylist,
    loadExistingPlaylist,
    exportToSpotify,
  };
}
