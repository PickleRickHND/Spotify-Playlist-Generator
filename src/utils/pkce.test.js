import { describe, expect, it } from "vitest";
import { generateCodeChallenge, generateCodeVerifier } from "./pkce";

describe("PKCE", () => {
  it("genera un verifier criptografico con caracteres permitidos", () => {
    const verifier = generateCodeVerifier(64);

    expect(verifier).toHaveLength(64);
    expect(verifier).toMatch(/^[A-Za-z0-9._~-]+$/);
  });

  it("genera el challenge S256 del vector de referencia", async () => {
    const verifier = "dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";

    await expect(generateCodeChallenge(verifier)).resolves.toBe(
      "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM"
    );
  });
});
