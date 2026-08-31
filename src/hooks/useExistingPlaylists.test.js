import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  getUserPlaylists: vi.fn(),
  getPlaylistTracks: vi.fn(),
  addTracksToPlaylist: vi.fn(),
  removeTracksFromPlaylist: vi.fn(),
}));

vi.mock("../services/spotifyApi", () => api);

import useExistingPlaylists from "./useExistingPlaylists";

describe("useExistingPlaylists", () => {
  beforeEach(() => vi.clearAllMocks());

  it("normaliza el nuevo objeto items de playlists", async () => {
    api.getUserPlaylists.mockResolvedValue({
      data: {
        items: [
          {
            id: "playlist-1",
            name: "Favoritas",
            images: [],
            items: { total: 7 },
            public: false,
            owner: { display_name: "Douglas" },
          },
        ],
      },
    });
    const { result } = renderHook(() => useExistingPlaylists(vi.fn()));

    await act(async () => result.current.fetchUserPlaylists());

    expect(result.current.userPlaylists[0]).toMatchObject({
      id: "playlist-1",
      trackCount: 7,
      owner: "Douglas",
    });
  });

  it("extrae tracks desde entry.item y descarta episodios", async () => {
    api.getPlaylistTracks.mockResolvedValue({
      data: {
        items: [
          { item: { id: "track-1", type: "track" } },
          { item: { id: "episode-1", type: "episode" } },
        ],
        next: null,
      },
    });
    const { result } = renderHook(() => useExistingPlaylists(vi.fn()));

    let tracks;
    await act(async () => {
      tracks = await result.current.fetchPlaylistTracks("playlist-1");
    });

    expect(tracks).toEqual([{ id: "track-1", type: "track" }]);
  });
});
