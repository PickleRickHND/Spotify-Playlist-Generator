/** Spotify Web API: máximo de URIs por petición al añadir tracks. */
export const MAX_TRACK_URIS_PER_REQUEST = 100;

export function chunkUris(uris, size = MAX_TRACK_URIS_PER_REQUEST) {
  const chunks = [];
  for (let i = 0; i < uris.length; i += size) {
    chunks.push(uris.slice(i, i + size));
  }
  return chunks;
}

export function formatArtists(artists) {
  if (!artists?.length) return "Artista desconocido";
  return artists.map((a) => a.name).filter(Boolean).join(", ") || "Artista desconocido";
}
