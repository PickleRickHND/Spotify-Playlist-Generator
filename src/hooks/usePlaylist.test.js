import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  createPlaylist: vi.fn(),
  addTracksToPlaylist: vi.fn(),
  removeTracksFromPlaylist: vi.fn(),
}));

vi.mock("../services/spotifyApi", () => api);

import usePlaylist from "./usePlaylist";

describe("usePlaylist", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.createPlaylist.mockResolvedValue({ data: { id: "playlist-new" } });
    api.addTracksToPlaylist.mockResolvedValue({ data: { snapshot_id: "snap" } });
  });

  it("crea una playlist con el endpoint del usuario actual", async () => {
    const showMessage = vi.fn();
    const logout = vi.fn();
    const { result } = renderHook(() => usePlaylist(showMessage, logout));

    act(() => {
      result.current.setPlaylistName("Viaje nocturno");
      result.current.addToPlaylist({
        id: "track-1",
        name: "Cancion",
        uri: "spotify:track:1",
      });
    });
    await act(async () => result.current.exportToSpotify());

    expect(api.createPlaylist).toHaveBeenCalledWith(
      "Viaje nocturno",
      false,
      "Playlist creada con Spotify Playlist Generator"
    );
    expect(api.addTracksToPlaylist).toHaveBeenCalledWith("playlist-new", [
      "spotify:track:1",
    ]);
    expect(logout).not.toHaveBeenCalled();
  });
});
