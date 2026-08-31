const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const EXPIRY_SKEW_MS = 30_000;

let refreshPromise = null;

export function getStoredAccessToken() {
  return window.localStorage.getItem("token") || "";
}

export function getStoredExpiry() {
  return Number.parseInt(
    window.localStorage.getItem("token_expires_at") || "0",
    10
  );
}

export function storeSpotifySession(data) {
  const expiresAt = Date.now() + (data.expires_in || 3600) * 1000;
  window.localStorage.setItem("token", data.access_token);
  window.localStorage.setItem("token_expires_at", expiresAt.toString());
  if (data.refresh_token) {
    window.localStorage.setItem("refresh_token", data.refresh_token);
  }
  return data.access_token;
}

export function clearSpotifySession() {
  window.localStorage.removeItem("token");
  window.localStorage.removeItem("token_expires_at");
  window.localStorage.removeItem("refresh_token");
}

async function requestRefreshToken(clientId) {
  const refreshToken = window.localStorage.getItem("refresh_token");
  if (!clientId || !refreshToken) return "";

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
  });
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error("No se pudo renovar la sesión de Spotify");
  }

  return storeSpotifySession(await response.json());
}

export async function refreshSpotifySession(
  clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
) {
  if (!refreshPromise) {
    refreshPromise = requestRefreshToken(clientId).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function getValidAccessToken(
  clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
) {
  const token = getStoredAccessToken();
  const expiresAt = getStoredExpiry();

  if (token && expiresAt > Date.now() + EXPIRY_SKEW_MS) {
    return token;
  }

  try {
    return await refreshSpotifySession(clientId);
  } catch {
    clearSpotifySession();
    window.dispatchEvent(new CustomEvent("spotify-auth-error"));
    return "";
  }
}
