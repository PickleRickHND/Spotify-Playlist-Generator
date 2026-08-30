<div align="center">
  <img src="public/icon.png" alt="Spotify Playlist Generator" width="130">
  <h1>Spotify Playlist Generator</h1>
  <p><strong>Busca música, explora recomendaciones y crea playlists personalizadas directamente en Spotify.</strong></p>
</div>

---

SPA en React conectada a Spotify Web API mediante Authorization Code con PKCE. Permite buscar canciones, explorar música por género o estado de ánimo, construir playlists y guardarlas en la cuenta del usuario sin exponer un client secret.

[![React](https://img.shields.io/badge/React-18.2-61DAFB?logo=react)](https://react.dev/)
[![Spotify](https://img.shields.io/badge/Spotify_API-Web_API-1DB954?logo=spotify)](https://developer.spotify.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?logo=javascript)](https://developer.mozilla.org/)
[![OAuth](https://img.shields.io/badge/OAuth-PKCE-1DB954?logo=spotify)](https://developer.spotify.com/documentation/web-api/concepts/authorization)
[![License](https://img.shields.io/badge/License-All_rights_reserved-lightgrey.svg)]()

---

## Tabla de Contenidos

- [Funcionalidades](#funcionalidades)
- [Stack Tecnologico](#stack-tecnologico)
- [Arquitectura](#arquitectura)
- [Componentes](#componentes)
- [Custom Hooks](#custom-hooks)
- [Spotify API](#spotify-api)
- [Autenticacion](#autenticacion)
- [Seguridad](#seguridad)
- [UI y Diseno](#ui-y-diseno)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Setup Local](#setup-local)
- [Licencia](#licencia)

---

## Funcionalidades

| Feature                      | Descripcion                                                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Busqueda de tracks**       | Busqueda en tiempo real en el catalogo de Spotify con debounce                                                   |
| **Construccion de playlist** | Agregar/remover tracks, reordenar, nombrar, toggle publico/privado                                               |
| **Guardar en Spotify**       | Exporta la playlist a la cuenta del usuario (crea playlist + agrega tracks en batches de 100)                    |
| **Recomendaciones**          | Recomendaciones personalizadas basadas en seed tracks, generos o artistas via `/recommendations`                 |
| **Generador por mood**       | Seleccionar mood (energetico, relajado, fiesta, etc.) y generar playlist automaticamente con parametros de audio |
| **Explorar tu musica**       | Top tracks y top artists del usuario con drill-down a tracks del artista                                         |
| **Browser de playlists**     | Ver playlists existentes de la cuenta con tracks y opcion de importar                                            |
| **Preview de audio**         | Reproduccion de 30s de preview inline por track                                                                  |
| **Selector de generos**      | Grid de generos musicales para filtrar recomendaciones                                                           |
| **Notificaciones toast**     | Feedback visual para acciones (guardado, errores, limites)                                                       |
| **Login/Logout**             | Authorization Code con PKCE, avatar y nombre en header                                                           |

---

## Stack Tecnologico

| Capa        | Tecnologia                          | Version      |
| ----------- | ----------------------------------- | ------------ |
| Framework   | React (Create React App)            | 18.2         |
| HTTP Client | Axios                               | 1.15         |
| Iconos      | React Icons                         | 4.12         |
| Tipografia  | Fraunces (display) + DM Sans (body) | Google Fonts |
| CSS         | CSS custom properties + BEM         | N/A          |
| Testing     | Jest + React Testing Library        | CRA built-in |
| Build       | react-scripts                       | 5.0.1        |

---

## Arquitectura

### Flujo de datos

```
Usuario abre la app
    |
useSpotifyAuth → intercambia el authorization code usando PKCE
    |
Token en localStorage → axios interceptor lo inyecta en headers
    |
    +-- useSearch → searchTracks() → Resultados
    +-- useRecommendations → getRecommendations() → Sugerencias
    +-- useMoodGenerator → parametros de audio → Playlist generada
    +-- useUserProfile → getCurrentUser() → Avatar + nombre
    +-- useExistingPlaylists → getUserPlaylists() → Browser
    +-- useArtistDrilldown → getArtistTopTracks() → Drill-down
    |
usePlaylist → estado local del playlist en construccion
    |
Guardar → createPlaylist() + addTracksToPlaylist() (batches de 100)
```

### Patron de hooks

Toda la logica de negocio esta encapsulada en custom hooks. `App.js` es un orquestador que compone los hooks y renderiza los componentes. Cero logica de negocio en componentes de UI.

| Capa                         | Responsabilidad                                             |
| ---------------------------- | ----------------------------------------------------------- |
| `src/services/spotifyApi.js` | Axios instance + API wrappers (12 endpoints)                |
| `src/hooks/`                 | 10 custom hooks con toda la logica de estado y side effects |
| `src/components/`            | 13 componentes de UI (presentacionales)                     |
| `src/utils/spotify.js`       | Helpers puros (chunkUris, formatArtists)                    |

---

## Componentes

### Layout y navegacion

| Componente | Archivo            | Descripcion                                                       |
| ---------- | ------------------ | ----------------------------------------------------------------- |
| `App`      | `App/App.js`       | Orquestador principal, compone hooks + tabs + panels              |
| `Header`   | `Header/Header.js` | Logo, avatar del usuario, boton login/logout                      |
| `TabBar`   | `TabBar/TabBar.js` | Navegacion por tabs (Buscar, Tu musica, Generador, Mis playlists) |
| `Toast`    | `Toast/Toast.js`   | Notificacion toast con auto-dismiss                               |

### Panels (contenido por tab)

| Componente             | Descripcion                                                              |
| ---------------------- | ------------------------------------------------------------------------ |
| `SearchForm`           | Input de busqueda con debounce                                           |
| `ResultsPanel`         | Grid de resultados de busqueda (TrackCards)                              |
| `PlaylistPanel`        | Panel lateral con playlist en construccion, nombre, opciones de guardado |
| `RecommendationsPanel` | Recomendaciones basadas en seeds + generos                               |
| `UserMusicPanel`       | Top tracks/artists del usuario + drill-down                              |
| `MoodGenerator`        | Generador por mood con sliders de parametros de audio                    |
| `PlaylistBrowser`      | Browser de playlists existentes con importacion                          |
| `GenreSelector`        | Grid de generos para seeds de recomendaciones                            |

### Elementos reutilizables

| Componente           | Descripcion                                                                 |
| -------------------- | --------------------------------------------------------------------------- |
| `TrackCard`          | Card de track con imagen, titulo, artista, album, boton add/remove, preview |
| `PlaylistItem`       | Item dentro del playlist con handle de drag, boton remove                   |
| `AudioPreviewButton` | Boton play/pause para preview de 30s                                        |
| `Slider`             | Input range estilizado para parametros de audio                             |

---

## Custom Hooks

| Hook                   | Lineas | Responsabilidad                                                                          |
| ---------------------- | ------ | ---------------------------------------------------------------------------------------- |
| `useSpotifyAuth`       | 73     | OAuth token extraction, localStorage, expiry, CSRF state validation                      |
| `usePlaylist`          | 162    | Estado del playlist (tracks, nombre, publico), add/remove/reorder, save con batch de 100 |
| `useMoodGenerator`     | 98     | Mood presets → parametros de audio (energy, danceability, valence) → recomendaciones     |
| `useAudioPlayer`       | 90     | Singleton Audio(), play/pause/stop, track activo, cleanup                                |
| `useExistingPlaylists` | 82     | Fetch playlists del usuario, paginacion, importar tracks                                 |
| `useSearch`            | 56     | Busqueda con debounce, AbortController para cancelar requests                            |
| `useUserProfile`       | 39     | Fetch perfil del usuario (nombre, avatar)                                                |
| `useRecommendations`   | 39     | Fetch recomendaciones con seed tracks/genres/artists                                     |
| `useArtistDrilldown`   | 39     | Top tracks de un artista seleccionado                                                    |
| `useMessage`           | 23     | Estado de toast messages con auto-clear                                                  |

---

## Spotify API

### Servicio centralizado (`src/services/spotifyApi.js`)

Axios instance con interceptors para auth automatica y manejo de 401.

| Funcion                              | Endpoint Spotify                                | Uso                        |
| ------------------------------------ | ----------------------------------------------- | -------------------------- |
| `searchTracks(query)`                | `GET /v1/search`                                | Busqueda de tracks         |
| `getCurrentUser()`                   | `GET /v1/me`                                    | Perfil del usuario         |
| `createPlaylist(userId, name)`       | `POST /v1/users/{id}/playlists`                 | Crear playlist             |
| `addTracksToPlaylist(id, uris)`      | `POST /v1/playlists/{id}/tracks`                | Agregar tracks (batch 100) |
| `removeTracksFromPlaylist(id, uris)` | `DELETE /v1/playlists/{id}/tracks`              | Remover tracks             |
| `getRecommendations(params)`         | `GET /v1/recommendations`                       | Recomendaciones            |
| `getGenreSeeds()`                    | `GET /v1/recommendations/available-genre-seeds` | Generos disponibles        |
| `getUserTopItems(type, range)`       | `GET /v1/me/top/{type}`                         | Top tracks/artists         |
| `getArtistTopTracks(artistId)`       | `GET /v1/artists/{id}/top-tracks`               | Tracks de un artista       |
| `getUserPlaylists(limit, offset)`    | `GET /v1/me/playlists`                          | Playlists del usuario      |
| `getPlaylistTracks(id)`              | `GET /v1/playlists/{id}/tracks`                 | Tracks de un playlist      |

---

## Autenticacion

### Authorization Code con PKCE

```
1. Usuario hace clic en "Iniciar sesion"
2. Redirect a accounts.spotify.com/authorize con:
   - client_id, redirect_uri, response_type=code
   - scope: playlist-modify-public, playlist-modify-private,
            user-read-private, user-top-read, playlist-read-private
   - state: UUID aleatorio para protección CSRF
   - code_challenge S256 derivado de un verifier local
3. Spotify redirige con un authorization code
4. useSpotifyAuth valida state e intercambia el code con el verifier PKCE
5. El access token y su expiración se guardan localmente
6. Axios inyecta el Bearer token en cada request
7. En 401 o token expirado se limpia la sesión y se solicita autenticación nueva
```

---

## Seguridad

| Medida                     | Implementacion                                                                 |
| -------------------------- | ------------------------------------------------------------------------------ |
| **CSRF protection**        | `crypto.randomUUID()` como state en OAuth, validado al retorno                 |
| **Token expiry**           | `token_expires_at` en localStorage, interceptor verifica antes de cada request |
| **Auto-cleanup**           | 401 response → limpia token + dispara `spotify-auth-error` event               |
| **No secrets en frontend** | Solo Client ID (publico), no Client Secret                                     |
| **AbortController**        | Cancela requests pendientes en busqueda para evitar race conditions            |

---

## UI y Diseno

### Tema visual

Tema oscuro editorial ("sala de escucha nocturna") con CSS custom properties en `:root`.

### Tipografia

| Fuente       | Uso                                   |
| ------------ | ------------------------------------- |
| **Fraunces** | Display, headings, titulos de seccion |
| **DM Sans**  | Body text, labels, botones            |

### Paleta (CSS custom properties)

| Variable           | Uso                      |
| ------------------ | ------------------------ |
| `--bg-app`         | Fondo principal (oscuro) |
| `--bg-panel`       | Fondo de panels/cards    |
| `--text-primary`   | Texto principal          |
| `--text-secondary` | Texto secundario         |
| `--accent`         | Spotify green para CTAs  |
| `--accent-hover`   | Green hover              |

### CSS

- BEM-style class names (`TrackCard`, `Panel`, `Btn--primary`)
- CSS custom properties para theming
- Responsive sin framework CSS
- Transiciones suaves en hover/focus

---

## Estructura del Proyecto

```
Spotify-Playlist-Generator/
├── src/
│   ├── components/                    # 13 componentes UI
│   │   ├── App/                      # Orquestador principal (259 lineas)
│   │   ├── Header/                   # Logo + avatar + login/logout
│   │   ├── TabBar/                   # Navegacion por tabs
│   │   ├── SearchForm/               # Input de busqueda
│   │   ├── ResultsPanel/             # Grid de resultados
│   │   ├── PlaylistPanel/            # Panel del playlist en construccion
│   │   ├── RecommendationsPanel/     # Recomendaciones personalizadas
│   │   ├── UserMusicPanel/           # Top tracks/artists
│   │   ├── MoodGenerator/            # Generador por mood
│   │   ├── PlaylistBrowser/          # Browser de playlists existentes
│   │   ├── GenreSelector/            # Grid de generos
│   │   ├── TrackCard/                # Card de track reutilizable
│   │   ├── PlaylistItem/             # Item de playlist
│   │   ├── AudioPreviewButton/       # Preview de 30s
│   │   ├── Slider/                   # Range input estilizado
│   │   └── Toast/                    # Notificacion toast
│   ├── hooks/                         # 10 custom hooks (701 lineas)
│   │   ├── useSpotifyAuth.js         # OAuth token management
│   │   ├── usePlaylist.js            # Estado del playlist
│   │   ├── useMoodGenerator.js       # Mood → audio params → tracks
│   │   ├── useAudioPlayer.js         # Singleton audio preview
│   │   ├── useExistingPlaylists.js   # Browser de playlists
│   │   ├── useSearch.js              # Busqueda con debounce
│   │   ├── useUserProfile.js         # Perfil del usuario
│   │   ├── useRecommendations.js     # Fetch recomendaciones
│   │   ├── useArtistDrilldown.js     # Top tracks por artista
│   │   └── useMessage.js             # Toast state management
│   ├── services/
│   │   └── spotifyApi.js             # Axios + 12 API wrappers
│   ├── utils/
│   │   └── spotify.js                # chunkUris, formatArtists
│   ├── images/                        # Assets
│   ├── index.js                       # Entry point
│   └── index.css                      # Global reset
├── public/
│   ├── index.html                     # HTML con Google Fonts
│   ├── manifest.json                  # PWA manifest
│   └── robots.txt                     # SEO
├── package.json                       # Dependencias
├── .env.example                       # Variables de entorno
└── .gitignore

29 archivos JS + 17 archivos CSS en src/
~2,400 lineas de codigo en componentes + hooks
```

---

## Setup Local

### Prerrequisitos

- Node.js 18+
- Cuenta de Spotify Developer ([dashboard](https://developer.spotify.com/dashboard))

### Configuracion

```bash
# 1. Clonar
git clone https://github.com/PickleRickHND/Spotify-Playlist-Generator.git
cd Spotify-Playlist-Generator

# 2. Instalar dependencias
npm install

# 3. Variables de entorno
cp .env.example .env
# Editar .env:
#   REACT_APP_SPOTIFY_CLIENT_ID=tu_client_id
#   REACT_APP_REDIRECT_URI=http://localhost:3000

# 4. Configurar en Spotify Dashboard:
#   - Redirect URI: http://localhost:3000
#   - Scopes: playlist-modify-public, playlist-modify-private,
#             user-read-private, user-top-read, playlist-read-private

# 5. Iniciar
npm start
# Abrir http://localhost:3000
```

### Comandos

```bash
npm start          # Dev server (localhost:3000)
npm run build      # Build de produccion en /build
npm test           # Jest en modo watch
npm test -- --watchAll=false  # Single run (CI)
```

---

## Licencia

Repositorio público sin licencia de reutilización. Todos los derechos reservados.

## Autor

**Douglas Hedman** - Diseno, desarrollo y arquitectura
