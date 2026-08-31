import axios from "axios";
import {
  clearSpotifySession,
  getValidAccessToken,
} from "./spotifyAuthSession";

const api = axios.create({
  baseURL: "https://api.spotify.com/v1",
});

api.interceptors.request.use(async (config) => {
  const token = await getValidAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSpotifySession();
      window.dispatchEvent(new CustomEvent("spotify-auth-error"));
    }
    return Promise.reject(error);
  }
);

export function searchTracks(query, limit = 10, signal, offset = 0) {
  return api.get("/search", {
    params: {
      q: query,
      type: "track",
      limit: Math.min(Math.max(limit, 1), 10),
      offset,
    },
    signal,
  });
}

export function getCurrentUser() {
  return api.get("/me");
}

export function createPlaylist(name, isPublic, description) {
  return api.post("/me/playlists", {
    name,
    public: isPublic,
    description,
  });
}

export function addTracksToPlaylist(playlistId, uris) {
  return api.post(`/playlists/${playlistId}/items`, { uris });
}

export function removeTracksFromPlaylist(playlistId, uris) {
  return api.delete(`/playlists/${playlistId}/items`, {
    data: { items: uris.map((uri) => ({ uri })) },
  });
}

export function getUserTopItems(type, timeRange = "short_term", limit = 10) {
  return api.get(`/me/top/${type}`, {
    params: { time_range: timeRange, limit },
  });
}

export function searchArtistTracks(artistName, limit = 10) {
  const escapedName = artistName.replaceAll('"', "");
  return searchTracks(`artist:"${escapedName}"`, limit);
}

export function getUserPlaylists(limit = 20, offset = 0) {
  return api.get("/me/playlists", { params: { limit, offset } });
}

export function getPlaylistTracks(playlistId, limit = 50, offset = 0) {
  return api.get(`/playlists/${playlistId}/items`, {
    params: { limit: Math.min(limit, 50), offset },
  });
}

export default api;
