<div align="center">
  <img src="public/icon.png" alt="Logo de Spotify Playlist Generator" width="130">
  <h1>Spotify Playlist Generator</h1>
  <p><strong>Busca música, explora artistas y crea playlists personalizadas directamente en Spotify.</strong></p>
</div>

---

SPA en React conectada a Spotify Web API mediante Authorization Code con PKCE. Permite buscar canciones, descubrir música por artista, género o preferencias de mood, construir playlists y guardarlas sin exponer un client secret.

[![React](https://img.shields.io/badge/React-19.2.8-61DAFB?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2.2-646CFF?logo=vite)](https://vite.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-24.20-339933?logo=node.js)](https://nodejs.org/)
[![Spotify](https://img.shields.io/badge/Spotify-Web_API-1DB954?logo=spotify)](https://developer.spotify.com/)
[![OAuth](https://img.shields.io/badge/OAuth-PKCE-1DB954)](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow)
[![License](https://img.shields.io/badge/License-All_rights_reserved-lightgrey.svg)]()

## Tabla de Contenidos

- [Estado del Proyecto](#estado-del-proyecto)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnologico](#stack-tecnologico)
- [Arquitectura](#arquitectura)
- [Spotify Web API](#spotify-web-api)
- [Autenticacion](#autenticacion)
- [Testing y Calidad](#testing-y-calidad)
- [Seguridad](#seguridad)
- [Estructura](#estructura)
- [Setup Local](#setup-local)
- [Deployment](#deployment)
- [Licencia](#licencia)

## Estado del Proyecto

**Estado verificado el 30 de agosto de 2026:** codigo actualizado y compilable, sin deployment publico configurado. El repositorio no tiene GitHub Pages ni una URL de produccion asociada.

La aplicacion fue migrada de Create React App a Vite porque CRA esta deprecado. Tambien adopta los contratos de Spotify publicados en febrero de 2026:

- Creacion de playlists mediante `/me/playlists`.
- Operaciones de playlist mediante `/playlists/{id}/items`.
- Search limitado a 10 resultados por pagina.
- Descubrimiento por artista mediante Search porque top tracks fue retirado.
- Generos locales y recomendaciones por Search porque los endpoints de recomendaciones estan deprecados.

## Funcionalidades

| Funcionalidad | Implementacion actual |
| --- | --- |
| Busqueda | Tracks mediante `/search`, debounce y cancelacion de requests |
| Playlist local | Agregar, remover, nombrar y elegir visibilidad |
| Guardar en Spotify | Crear playlist y agregar items en lotes de hasta 100 URIs |
| Editar playlist | Importar items y aplicar altas/bajas a una playlist existente |
| Recomendaciones | Busquedas por nombres de artistas presentes en la playlist |
| Generador por mood | Generos locales y terminos heurísticos derivados de los controles |
| Tu musica | Top tracks y top artists del usuario |
| Exploracion de artista | Search filtrado por nombre de artista |
| Playlists existentes | Listado, paginacion e importacion de items propios o colaborativos |
| Preview | Reproduccion solo cuando Spotify entrega `preview_url` |
| Feedback | Toasts para exito, errores, limites y sesion expirada |

## Stack Tecnologico

| Capa | Tecnologia | Version |
| --- | --- | ---: |
| UI | React | 19.2.8 |
| Build y desarrollo | Vite | 8.2.2 |
| Runtime | Node.js | 24.20.0 |
| HTTP | Axios | 1.20.0 |
| Iconos | React Icons | 5.7.0 |
| Lint | ESLint | 10.9.1 |
| Unit tests | Vitest + Testing Library | 4.1.11 |
| E2E | Playwright | 1.62.1 |
| CSS | Custom properties + BEM | Sin framework |

Todas las dependencias estan fijadas en `package-lock.json`. `npm audit` reporta cero vulnerabilidades conocidas.

## Arquitectura

```text
Usuario
  |
  +-- useSpotifyAuth
  |     +-- PKCE state + verifier
  |     +-- intercambio de authorization code
  |     +-- refresh token con single-flight
  |
  +-- spotifyApi
  |     +-- interceptor Bearer
  |     +-- limpieza en 401
  |     +-- contratos Web API 2026
  |
  +-- hooks de negocio
        +-- busqueda y recomendaciones
        +-- generador por mood
        +-- playlist local y exportacion
        +-- musica y playlists del usuario
```

### Responsabilidades

| Capa | Responsabilidad |
| --- | --- |
| `src/components/` | Renderizado y eventos de interfaz |
| `src/hooks/` | Estado, efectos, concurrencia y mensajes |
| `src/services/spotifyApi.js` | Endpoints, parametros y payloads Spotify |
| `src/services/spotifyAuthSession.js` | Tokens, expiracion y renovacion PKCE |
| `src/utils/` | PKCE, generos y helpers puros |

## Spotify Web API

| Funcion local | Endpoint vigente |
| --- | --- |
| `searchTracks()` | `GET /search` |
| `getCurrentUser()` | `GET /me` |
| `getUserTopItems()` | `GET /me/top/{type}` |
| `getUserPlaylists()` | `GET /me/playlists` |
| `createPlaylist()` | `POST /me/playlists` |
| `getPlaylistTracks()` | `GET /playlists/{id}/items` |
| `addTracksToPlaylist()` | `POST /playlists/{id}/items` |
| `removeTracksFromPlaylist()` | `DELETE /playlists/{id}/items` |
| `searchArtistTracks()` | `GET /search?q=artist:"nombre"` |

Las respuestas de playlists usan `items.items[].item`. Se conserva compatibilidad de lectura con el formato anterior cuando aparece en datos cacheados o mocks.

## Autenticacion

1. La app genera `state`, `code_verifier` y `code_challenge` S256.
2. Redirige a Spotify con `response_type=code`.
3. Valida `state` al regresar para prevenir CSRF.
4. Intercambia el authorization code sin client secret.
5. Guarda access token, expiracion y refresh token en almacenamiento local.
6. Renueva el access token antes de expirar y comparte una sola solicitud de refresh concurrente.
7. Ante un 401 limpia la sesion y solicita autenticacion nueva.

Scopes solicitados:

- `playlist-modify-public`
- `playlist-modify-private`
- `playlist-read-private`
- `user-read-private`
- `user-top-read`

## Testing y Calidad

```bash
npm run lint
npm test
npm run test:coverage
npm run build
npm run test:e2e
npm audit --audit-level=high
```

Verificacion local actual:

| Gate | Resultado |
| --- | --- |
| ESLint | Sin errores |
| Vitest | 19 pruebas aprobadas |
| Cobertura | 42.77% statements, 42.54% lineas; umbral minimo 30% |
| Vite build | Produccion generada en `dist/` |
| Playwright | Smoke PKCE aprobado en Chromium |
| npm audit | 0 vulnerabilidades |

Los unit tests cubren PKCE, renovacion de sesion, contratos Spotify, lotes de URIs, normalizacion de playlist, creacion y recomendaciones. El E2E verifica el render desconectado y los parametros PKCE del enlace de login.

## Seguridad

| Control | Implementacion |
| --- | --- |
| Client secret | No existe en el frontend |
| CSRF | `state` aleatorio validado al retorno OAuth |
| PKCE | Verifier criptografico y challenge SHA-256 |
| Renovacion | Refresh token sin client secret y solicitud single-flight |
| Sesion expirada | Limpieza automatica ante expiracion o 401 |
| CSP | Solo Spotify API, Spotify Accounts, fuentes e imagenes permitidas |
| Requests | AbortController en busqueda y limites oficiales por pagina |

El Client ID es publico por diseño. Nunca deben almacenarse en el repositorio access tokens, refresh tokens ni un Spotify Client Secret.

## Estructura

```text
Spotify-Playlist-Generator/
├── index.html
├── public/
│   ├── icon.png
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── components/       # 16 componentes JSX
│   ├── hooks/            # 10 hooks de negocio
│   ├── services/         # Spotify API y sesion OAuth
│   ├── test/             # Setup Vitest
│   ├── utils/            # PKCE, generos y helpers
│   ├── main.jsx
│   └── index.css
├── tests/e2e/
├── eslint.config.js
├── playwright.config.js
├── vite.config.js
├── package.json
└── package-lock.json
```

## Setup Local

### Requisitos

- Node.js 24.20.0
- npm 11
- Una app en [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)

### Instalacion

```bash
git clone https://github.com/PickleRickHND/Spotify-Playlist-Generator.git
cd Spotify-Playlist-Generator
nvm use
npm ci
cp .env.example .env
```

Variables:

```dotenv
VITE_SPOTIFY_CLIENT_ID=tu_client_id
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173
```

Registra exactamente `http://localhost:5173` como Redirect URI en Spotify Dashboard.

```bash
npm run dev
```

La app queda disponible en `http://localhost:5173`.

## Deployment

No hay un deployment publico activo verificado. Para publicar se debe:

1. Configurar las dos variables `VITE_*` en el proveedor de hosting.
2. Registrar la URL HTTPS exacta como Redirect URI en Spotify Dashboard.
3. Ejecutar todos los gates locales y CI.
4. Publicar el contenido generado en `dist/`.

## Licencia

Repositorio publico sin licencia de reutilizacion. Todos los derechos reservados.

## Autor

**Douglas Hedman**: diseño, desarrollo y arquitectura.
