import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const authSession = vi.hoisted(() => ({
  clearSpotifySession: vi.fn(),
  getStoredAccessToken: vi.fn(),
  getStoredExpiry: vi.fn(),
  refreshSpotifySession: vi.fn(),
  storeSpotifySession: vi.fn(),
}));

vi.mock("../services/spotifyAuthSession", () => authSession);
vi.mock("../utils/pkce", () => ({
  generateCodeVerifier: vi.fn(() => "verifier"),
  generateCodeChallenge: vi.fn(async () => "challenge"),
}));

import useSpotifyAuth, { buildAuthorizeUrl } from "./useSpotifyAuth";

describe("useSpotifyAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authSession.getStoredAccessToken.mockReturnValue("");
    authSession.getStoredExpiry.mockReturnValue(Date.now() + 3_600_000);
    authSession.storeSpotifySession.mockReturnValue("new-token");
    window.history.replaceState(null, "", "/");
  });

  afterEach(() => vi.unstubAllGlobals());

  it("construye authorize URL con state y challenge S256", async () => {
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue("state-id");

    const url = await buildAuthorizeUrl({
      clientId: "client-id",
      redirectUri: "http://localhost:5173",
      scopes: "user-read-private",
    });

    expect(url).toContain("response_type=code");
    expect(url).toContain("state=state-id");
    expect(url).toContain("code_challenge_method=S256");
    expect(window.sessionStorage.getItem("spotify_code_verifier")).toBe(
      "verifier"
    );
  });

  it("prioriza el callback nuevo sobre una sesion almacenada", async () => {
    window.history.replaceState(
      null,
      "",
      "/?code=authorization-code&state=expected-state"
    );
    window.sessionStorage.setItem("spotify_oauth_state", "expected-state");
    window.sessionStorage.setItem("spotify_code_verifier", "verifier");
    authSession.getStoredAccessToken.mockReturnValue("old-token");
    window.localStorage.setItem("refresh_token", "old-refresh");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ access_token: "new-token", expires_in: 3600 }),
      })
    );

    const { result } = renderHook(() =>
      useSpotifyAuth({
        clientId: "client-id",
        redirectUri: "http://localhost:5173",
      })
    );

    await waitFor(() => expect(result.current.token).toBe("new-token"));
    expect(authSession.refreshSpotifySession).not.toHaveBeenCalled();
    expect(authSession.storeSpotifySession).toHaveBeenCalled();
    expect(window.location.search).toBe("");
  });
});
