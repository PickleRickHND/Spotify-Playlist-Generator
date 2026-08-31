import { describe, expect, it } from "vitest";
import {
  chunkUris,
  formatArtists,
  MAX_TRACK_URIS_PER_REQUEST,
} from "./spotify";

describe("spotify utils", () => {
  it("divide URIs respetando el limite de Spotify", () => {
    const uris = Array.from({ length: 205 }, (_, index) => `spotify:track:${index}`);

    const chunks = chunkUris(uris);

    expect(chunks).toHaveLength(3);
    expect(chunks.map((chunk) => chunk.length)).toEqual([
      MAX_TRACK_URIS_PER_REQUEST,
      MAX_TRACK_URIS_PER_REQUEST,
      5,
    ]);
  });

  it("formatea artistas y maneja valores vacios", () => {
    expect(formatArtists([{ name: "Bomba Estereo" }, { name: "Bad Bunny" }]))
      .toBe("Bomba Estereo, Bad Bunny");
    expect(formatArtists([])).toBe("Artista desconocido");
  });
});
