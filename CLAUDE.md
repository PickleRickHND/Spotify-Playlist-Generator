# Guia del proyecto

## Resumen

SPA en React 19 y Vite 8 para buscar musica, explorar artistas, construir playlists y guardarlas mediante Spotify Web API. La autenticacion usa Authorization Code con PKCE y renovacion de access tokens sin client secret.

## Comandos

```bash
npm run dev            # Servidor local en http://localhost:5173
npm run lint           # ESLint 10
npm test               # Vitest
npm run test:coverage  # Cobertura con V8
npm run test:e2e       # Playwright Chromium
npm run build          # Produccion en dist/
```

## Entorno

- Node.js 24.20.0
- `VITE_SPOTIFY_CLIENT_ID`: Client ID publico del dashboard de Spotify
- `VITE_SPOTIFY_REDIRECT_URI`: debe coincidir exactamente con el dashboard
- No se usa ni se debe agregar un Client Secret al frontend

## Arquitectura

- `src/components/`: 16 componentes presentacionales en JSX.
- `src/hooks/`: estado, efectos y flujos de negocio.
- `src/services/spotifyApi.js`: contratos vigentes de Spotify Web API.
- `src/services/spotifyAuthSession.js`: almacenamiento y renovacion PKCE.
- `src/utils/`: helpers puros y generacion PKCE.

## Contratos Spotify 2026

- Crear playlist: `POST /me/playlists`.
- Leer, agregar y eliminar items: `/playlists/{id}/items`.
- Search acepta como maximo 10 resultados por pagina.
- Top tracks por artista fue retirado; se usa search por nombre de artista.
- Recommendations y genre seeds estan deprecados; la app usa search y generos locales.

## Convenciones

- Texto de interfaz y comentarios nuevos en español.
- No agregar secretos, tokens ni credenciales reales.
- Preservar el limite de 100 URIs por operacion de playlist.
- Toda modificacion de hooks o servicios requiere pruebas.
