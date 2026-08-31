import { describe, expect, it } from "vitest";
import { buildMoodSearchTerms } from "./useMoodGenerator";

describe("buildMoodSearchTerms", () => {
  it("traduce controles altos a terminos de busqueda", () => {
    expect(
      buildMoodSearchTerms({
        energy: 0.9,
        danceability: 0.8,
        valence: 0.9,
        tempo: 150,
      })
    ).toEqual(["workout", "dance", "happy", "fast"]);
  });

  it("traduce controles bajos sin inventar parametros API", () => {
    expect(
      buildMoodSearchTerms({
        energy: 0.2,
        danceability: 0.4,
        valence: 0.2,
        tempo: 80,
      })
    ).toEqual(["chill", "sad", "slow"]);
  });
});
