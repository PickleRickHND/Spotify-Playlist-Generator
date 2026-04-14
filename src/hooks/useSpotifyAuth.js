import { useCallback, useEffect, useRef, useState } from "react";
import { generateCodeVerifier, generateCodeChallenge } from "../utils/pkce";

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
      const storedToken = window.localStorage.getItem("token");
      const expiresAt = parseInt(
        window.localStorage.getItem("token_expires_at") || "0",
        10
      );

      if (storedToken && expiresAt > 0 && Date.now() < expiresAt) {
        setToken(storedToken);
        return;
      }

      if (storedToken) {
        window.localStorage.removeItem("token");
        window.localStorage.removeItem("token_expires_at");
      }

      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const returnedState = params.get("state");
      const errorParam = params.get("error");

      if (errorParam) {
        setAuthError(`Spotify: ${errorParam}`);
        window.history.replaceState(null, "", window.location.pathname);
        return;
      }

      if (!code) return;

      const savedState = sessionStorage.getItem("spotify_oauth_state");
      const verifier = sessionStorage.getItem("spotify_code_verifier");

      window.history.replaceState(null, "", window.location.pathname);
      sessionStorage.removeItem("spotify_oauth_state");
      sessionStorage.removeItem("spotify_code_verifier");

      if (!savedState || savedState !== returnedState) {
        setAuthError("OAuth state mismatch — posible CSRF. Intenta de nuevo.");
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

        const expAt = Date.now() + (data.expires_in || 3600) * 1000;
        window.localStorage.setItem("token", data.access_token);
        window.localStorage.setItem("token_expires_at", expAt.toString());
        if (data.refresh_token) {
          window.localStorage.setItem("refresh_token", data.refresh_token);
        }
        setToken(data.access_token);
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
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("token_expires_at");
      window.localStorage.removeItem("refresh_token");
    };
    window.addEventListener("spotify-auth-error", handleAuthError);
    return () =>
      window.removeEventListener("spotify-auth-error", handleAuthError);
  }, []);

  const logout = useCallback(() => {
    setToken("");
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("token_expires_at");
    window.localStorage.removeItem("refresh_token");
  }, []);

  return { token, logout, authError, exchanging };
}
