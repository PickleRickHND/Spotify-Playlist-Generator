import { useCallback, useEffect, useRef, useState } from "react";
import { generateCodeVerifier, generateCodeChallenge } from "../utils/pkce";
import {
  clearSpotifySession,
  getStoredAccessToken,
  getStoredExpiry,
  refreshSpotifySession,
  storeSpotifySession,
} from "../services/spotifyAuthSession";

const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";

export async function buildAuthorizeUrl({ clientId, redirectUri, scopes }) {
  const state = crypto.randomUUID();
  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);

  sessionStorage.setItem("spotify_oauth_state", state);
  sessionStorage.setItem("spotify_code_verifier", verifier);

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: scopes,
    state,
    code_challenge_method: "S256",
    code_challenge: challenge,
  });

  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

async function exchangeCodeForToken({ code, clientId, redirectUri, verifier }) {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: verifier,
  });

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error_description || "Token exchange failed");
  }

  return response.json();
}

export default function useSpotifyAuth({ clientId, redirectUri }) {
  const [token, setToken] = useState("");
  const [authError, setAuthError] = useState("");
  const [exchanging, setExchanging] = useState(false);
  const didInitRef = useRef(false);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    const init = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const returnedState = params.get("state");
      const errorParam = params.get("error");

      if (errorParam) {
        setAuthError(`Spotify: ${errorParam}`);
        window.history.replaceState(null, "", window.location.pathname);
        return;
      }

      const storedToken = getStoredAccessToken();
      const expiresAt = getStoredExpiry();

      if (!code && storedToken && expiresAt > 0 && Date.now() < expiresAt) {
        setToken(storedToken);
        return;
      }

      if (!code && window.localStorage.getItem("refresh_token")) {
        try {
          const refreshedToken = await refreshSpotifySession(clientId);
          if (refreshedToken) {
            setToken(refreshedToken);
            return;
          }
        } catch {
          clearSpotifySession();
        }
      } else if (!code && storedToken) {
        clearSpotifySession();
      }

      if (!code) return;

      const savedState = sessionStorage.getItem("spotify_oauth_state");
      const verifier = sessionStorage.getItem("spotify_code_verifier");

      window.history.replaceState(null, "", window.location.pathname);
      sessionStorage.removeItem("spotify_oauth_state");
      sessionStorage.removeItem("spotify_code_verifier");

      if (!savedState || savedState !== returnedState) {
        setAuthError("OAuth state mismatch: posible CSRF. Intenta de nuevo.");
        return;
      }

      if (!verifier) {
        setAuthError("Falta code verifier. Intenta iniciar sesión de nuevo.");
        return;
      }

      setExchanging(true);
      try {
        const data = await exchangeCodeForToken({
          code,
          clientId,
          redirectUri,
          verifier,
        });

        setToken(storeSpotifySession(data));
      } catch (err) {
        setAuthError(err.message || "Error intercambiando el código");
      } finally {
        setExchanging(false);
      }
    };

    init();
  }, [clientId, redirectUri]);

  useEffect(() => {
    const handleAuthError = () => {
      setToken("");
      clearSpotifySession();
    };
    window.addEventListener("spotify-auth-error", handleAuthError);
    return () =>
      window.removeEventListener("spotify-auth-error", handleAuthError);
  }, []);

  useEffect(() => {
    if (!token) return undefined;
    const refreshIn = Math.max(getStoredExpiry() - Date.now() - 60_000, 1000);
    const timer = window.setTimeout(async () => {
      try {
        const refreshedToken = await refreshSpotifySession(clientId);
        if (refreshedToken) setToken(refreshedToken);
      } catch {
        clearSpotifySession();
        setToken("");
      }
    }, refreshIn);
    return () => window.clearTimeout(timer);
  }, [clientId, token]);

  const logout = useCallback(() => {
    setToken("");
    clearSpotifySession();
  }, []);

  return { token, logout, authError, exchanging };
}
