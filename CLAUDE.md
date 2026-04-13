# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Spotify Playlist Generator — a React SPA that authenticates with Spotify via OAuth implicit grant, lets users search tracks, build a playlist, and save it to their Spotify account.

## Commands

```bash
npm start          # Dev server on http://localhost:3000
npm run build      # Production build to /build
npm test           # Jest + React Testing Library (interactive watch mode)
npm test -- --watchAll=false   # Single CI-friendly test run
```

## Environment Setup

Copy `.env.example` to `.env` and fill in your Spotify app credentials:
- `REACT_APP_SPOTIFY_CLIENT_ID` — from Spotify Developer Dashboard
- `REACT_APP_REDIRECT_URI` — must match the redirect URI registered in Spotify (defaults to `http://localhost:3000`)

If `.env` is missing, a hardcoded fallback Client ID is used in `App.js`.

## Architecture

This is a Create React App project (React 18). The entire app lives in a single component with no routing.

- **`src/components/App/App.js`** — the only component. Handles OAuth token extraction from URL hash, search via Spotify Web API (`/v1/search`), playlist assembly in local state, and export to Spotify (`/v1/users/{id}/playlists` + `/v1/playlists/{id}/tracks`). All Spotify API calls use `axios` with Bearer token auth.
- **`src/utils/spotify.js`** — two helpers: `chunkUris` (batches track URIs in groups of 100 for the Spotify API limit) and `formatArtists` (comma-joins artist names).
- **`src/components/App/App.css`** — all styling. Dark editorial theme ("sala de escucha nocturna") with CSS custom properties on `:root`. No CSS framework — BEM-style class names (`TrackCard`, `Panel`, `Btn--primary`, etc.).
- **`src/index.css`** — global reset and body defaults.

## Spotify API Auth Flow

Implicit Grant flow: the app redirects to `accounts.spotify.com/authorize`, Spotify returns an `access_token` in the URL hash. The token is stored in `localStorage` and cleared on logout or 401 responses.

Required scopes: `playlist-modify-public`, `playlist-modify-private`, `user-read-private`.

## UI Language

All user-facing text is in Spanish. Keep this convention when adding or modifying UI strings.

## Fonts

Google Fonts loaded in `public/index.html`: **Fraunces** (display/headings) and **DM Sans** (body text).
