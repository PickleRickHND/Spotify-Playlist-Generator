import { expect, test } from "@playwright/test";

test("muestra el estado desconectado y genera PKCE", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Generador de playlists" })
  ).toBeVisible();
  await expect(
    page.getByText("Conecta tu cuenta para buscar canciones")
  ).toBeVisible();

  const login = page.getByRole("link", { name: "Conectar Spotify" });
  await expect(login).toHaveAttribute("href", /accounts\.spotify\.com\/authorize/);
  await expect(login).toHaveAttribute("href", /response_type=code/);
  await expect(login).toHaveAttribute("href", /code_challenge_method=S256/);
});
