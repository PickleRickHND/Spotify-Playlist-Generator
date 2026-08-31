import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearSpotifySession,
  getStoredAccessToken,
  getValidAccessToken,
  refreshSpotifySession,
  storeSpotifySession,
} from "./spotifyAuthSession";

describe("spotifyAuthSession", () => {
  beforeEach(() => {
    clearSpotifySession();
    vi.restoreAllMocks();
  });

  it("guarda access token, expiracion y refresh token", () => {
    vi.spyOn(Date, "now").mockReturnValue(1_000);

    storeSpotifySession({
      access_token: "access-token",
      refresh_token: "refresh-token",
      expires_in: 3600,
    });

    expect(getStoredAccessToken()).toBe("access-token");
    expect(window.localStorage.getItem("refresh_token")).toBe("refresh-token");
    expect(window.localStorage.getItem("token_expires_at")).toBe("3601000");
  });

  it("reutiliza un token vigente sin hacer requests", async () => {
    vi.spyOn(Date, "now").mockReturnValue(1_000);
    storeSpotifySession({ access_token: "valid", expires_in: 3600 });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(getValidAccessToken("client-id")).resolves.toBe("valid");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("renueva una sesion expirada con PKCE sin client secret", async () => {
    window.localStorage.setItem("refresh_token", "refresh-token");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: "renewed", expires_in: 3600 }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(refreshSpotifySession("client-id")).resolves.toBe("renewed");
    const [, request] = fetchMock.mock.calls[0];
    expect(request.body).toContain("grant_type=refresh_token");
    expect(request.body).toContain("client_id=client-id");
    expect(request.body).not.toContain("client_secret");
  });
});
