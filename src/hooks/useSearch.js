import { useCallback, useEffect, useRef, useState } from "react";
import { searchTracks as searchTracksApi } from "../services/spotifyApi";
import axios from "axios";

export default function useSearch(showMessage, logout) {
  const [searchKey, setSearchKey] = useState("");
  const [tracks, setTracks] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const abortRef = useRef(null);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const searchTracks = useCallback(
    async (e) => {
      e.preventDefault();

      if (!searchKey.trim()) {
        showMessage("Por favor, ingresa un término de búsqueda.", "warning");
        return;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoadingSearch(true);

      try {
        const { data } = await searchTracksApi(searchKey, 10, controller.signal);
        setTracks(data.tracks.items);

        if (data.tracks.items.length === 0) {
          showMessage("No se encontraron canciones.", "info");
        }
      } catch (error) {
        if (axios.isCancel?.(error) || error.code === "ERR_CANCELED") return;

        if (error.response?.status === 401) {
          showMessage("Sesión expirada. Por favor, inicia sesión nuevamente.", "error");
          logout();
        } else {
          showMessage("Error al buscar canciones. Intenta de nuevo.", "error");
        }
      } finally {
        if (abortRef.current === controller) {
          setLoadingSearch(false);
        }
      }
    },
    [searchKey, showMessage, logout]
  );

  return { searchKey, setSearchKey, tracks, loadingSearch, searchTracks };
}
