import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const searchArtistTracks = vi.hoisted(() => vi.fn());
vi.mock("../services/spotifyApi", () => ({ searchArtistTracks }));

import useRecommendations from "./useRecommendations";

describe("useRecommendations", () => {
  beforeEach(() => vi.clearAllMocks());

  it("busca por nombre de artista y elimina canciones existentes", async () => {
    searchArtistTracks.mockResolvedValue({
      data: {
        tracks: {
          items: [
            { id: "existing", name: "Existente" },
            { id: "new-track", name: "Nueva" },
          ],
        },
      },
    });
    const { result } = renderHook(() => useRecommendations(vi.fn()));

    await act(async () => {
      await result.current.fetchRecommendations(
        ["seed"],
        ["Rosalia", "Rosalia"],
        ["existing"]
      );
    });

    expect(searchArtistTracks).toHaveBeenCalledTimes(1);
    expect(searchArtistTracks).toHaveBeenCalledWith("Rosalia");
    expect(result.current.recommendations).toEqual([
      { id: "new-track", name: "Nueva" },
    ]);
  });
});
