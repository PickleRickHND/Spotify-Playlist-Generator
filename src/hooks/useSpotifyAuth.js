import { useCallback, useEffect, useState } from "react";

export function generateAuthState() {
  const state = crypto.randomUUID();
  sessionStorage.setItem("spotify_oauth_state", state);
  return state;
}

export default function useSpotifyAuth() {
  const [token, setToken] = useState("");

  useEffect(() => {
    const hash = window.location.hash;
    let storedToken = window.localStorage.getItem("token");

    if (!storedToken && hash) {
      const params = hash.substring(1).split("&").reduce((acc, part) => {
        const [key, value] = part.split("=");
        acc[key] = value;
        return acc;
      }, {});

      if (params.access_token) {
        const savedState = sessionStorage.getItem("spotify_oauth_state");
        if (savedState && params.state !== savedState) {
          console.error("OAuth state mismatch — possible CSRF");
          window.history.replaceState(null, "", window.location.pathname);
          return;
        }
        sessionStorage.removeItem("spotify_oauth_state");

        storedToken = params.access_token;

        const expiresIn = parseInt(params.expires_in || "3600", 10);
        const expiresAt = Date.now() + expiresIn * 1000;
        window.localStorage.setItem("token", storedToken);
        window.localStorage.setItem("token_expires_at", expiresAt.toString());

        window.history.replaceState(null, "", window.location.pathname);
      }
    }

    if (storedToken) {
      const expiresAt = parseInt(window.localStorage.getItem("token_expires_at") || "0", 10);
      if (expiresAt > 0 && Date.now() >= expiresAt) {
        window.localStorage.removeItem("token");
        window.localStorage.removeItem("token_expires_at");
        storedToken = null;
      }
    }

    setToken(storedToken || "");
  }, []);

  useEffect(() => {
    const handleAuthError = () => {
      setToken("");
      window.localStorage.removeItem("token");
      window.localStorage.removeItem("token_expires_at");
    };
    window.addEventListener("spotify-auth-error", handleAuthError);
    return () =>
      window.removeEventListener("spotify-auth-error", handleAuthError);
  }, []);

  const logout = useCallback(() => {
    setToken("");
    window.localStorage.removeItem("token");
    window.localStorage.removeItem("token_expires_at");
  }, []);

  return { token, logout };
}
