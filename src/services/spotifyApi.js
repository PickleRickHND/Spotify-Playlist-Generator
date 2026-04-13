import axios from "axios";

const api = axios.create({
  baseURL: "https://api.spotify.com/v1",
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem("token");
  const expiresAt = parseInt(window.localStorage.getItem("token_expires_at") || "0", 10);

  if (token && (expiresAt === 0 || Date.now() < expiresAt)) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (token && expiresAt > 0 && Date.now() >= expiresAt) {
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("token_expires_at");
    window.dispatchEvent(new CustomEvent("spotify-auth-error"));
    return Promise.reject(new Error("Token expired"));
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("token_expires_at");
      window.dispatchEvent(new CustomEvent("spotify-auth-error"));
    }
    return Promise.reject(error);
  }
);

export function searchTracks(query, limit = 10, signal) {
  return api.get("/search", {
    params: { q: query, type: "track", limit },
    signal,
  });
}

export function getCurrentUser() {
  return api.get("/me");
}

export function createPlaylist(userId, name, isPublic, description) {
  return api.post(`/users/${userId}/playlists`, {
    name,
    public: isPublic,
    description,
  });
}

export function addTracksToPlaylist(playlistId, uris) {
  return api.post(`/playlists/${playlistId}/tracks`, { uris });
}

export function removeTracksFromPlaylist(playlistId, uris) {
  return api.delete(`/playlists/${playlistId}/tracks`, {
    data: { tracks: uris.map((uri) => ({ uri })) },
  });
}

export function getRecommendations(params) {
  return api.get("/recommendations", { params });
}

export function getGenreSeeds() {
  return api.get("/recommendations/available-genre-seeds");
}

export function getUserTopItems(type, timeRange = "short_term", limit = 10) {
  return api.get(`/me/top/${type}`, {
    params: { time_range: timeRange, limit },
  });
}

export function getArtistTopTracks(artistId, market = "US") {
  return api.get(`/artists/${artistId}/top-tracks`, {
    params: { market },
  });
}

export function getUserPlaylists(limit = 20, offset = 0) {
  return api.get("/me/playlists", { params: { limit, offset } });
}

export function getPlaylistTracks(playlistId, limit = 50, offset = 0) {
  return api.get(`/playlists/${playlistId}/tracks`, {
    params: { limit, offset },
  });
}

export default api;
