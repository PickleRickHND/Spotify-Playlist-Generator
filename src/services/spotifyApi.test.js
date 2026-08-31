import { beforeEach, describe, expect, it, vi } from "vitest";

const { apiMock } = vi.hoisted(() => ({
  apiMock: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

vi.mock("axios", () => ({
  default: { create: vi.fn(() => apiMock) },
}));

vi.mock("./spotifyAuthSession", () => ({
  clearSpotifySession: vi.fn(),
  getValidAccessToken: vi.fn().mockResolvedValue("token"),
}));

import {
  addTracksToPlaylist,
  createPlaylist,
  getPlaylistTracks,
  removeTracksFromPlaylist,
  searchArtistTracks,
  searchTracks,
} from "./spotifyApi";

describe("spotifyApi", () => {
  beforeEach(() => vi.clearAllMocks());

  it("limita busquedas al maximo vigente de 10", () => {
    searchTracks("rock", 50, undefined, 10);

    expect(apiMock.get).toHaveBeenCalledWith("/search", {
      params: { q: "rock", type: "track", limit: 10, offset: 10 },
      signal: undefined,
    });
  });

  it("crea playlists para el usuario actual", () => {
    createPlaylist("Viaje", false, "Descripcion");

    expect(apiMock.post).toHaveBeenCalledWith("/me/playlists", {
      name: "Viaje",
      public: false,
      description: "Descripcion",
    });
  });

  it("usa los endpoints items para administrar playlists", () => {
    addTracksToPlaylist("playlist-1", ["spotify:track:1"]);
    removeTracksFromPlaylist("playlist-1", ["spotify:track:2"]);
    getPlaylistTracks("playlist-1", 100, 50);

    expect(apiMock.post).toHaveBeenCalledWith("/playlists/playlist-1/items", {
      uris: ["spotify:track:1"],
    });
    expect(apiMock.delete).toHaveBeenCalledWith("/playlists/playlist-1/items", {
      data: { items: [{ uri: "spotify:track:2" }] },
    });
    expect(apiMock.get).toHaveBeenCalledWith("/playlists/playlist-1/items", {
      params: { limit: 50, offset: 50 },
    });
  });

  it("sustituye top tracks retirado por busqueda de artista", () => {
    searchArtistTracks('Rosalia "Motomami"');

    expect(apiMock.get).toHaveBeenCalledWith("/search", {
      params: {
        q: 'artist:"Rosalia Motomami"',
        type: "track",
        limit: 10,
        offset: 0,
      },
      signal: undefined,
    });
  });
});
