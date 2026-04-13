import "./App.css";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import icon from "../../images/icon.png";
import { chunkUris, formatArtists } from "../../utils/spotify";

const CLIENT_ID =
  process.env.REACT_APP_SPOTIFY_CLIENT_ID || "5618e6d9904642caabe20dcb8772baeb";
const REDIRECT_URI =
  process.env.REACT_APP_REDIRECT_URI || "http://localhost:3000";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";

const SCOPES = [
  "playlist-modify-public",
  "playlist-modify-private",
  "user-read-private",
].join("%20");

function App() {
  const [token, setToken] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [tracks, setTracks] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [playlistName, setPlaylistName] = useState("Mi Nueva Playlist");
  const [playlistIsPublic, setPlaylistIsPublic] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const messageTimeoutRef = useRef(null);
  const searchAbortRef = useRef(null);

  useEffect(() => {
    const hash = window.location.hash;
    let storedToken = window.localStorage.getItem("token");

    if (!storedToken && hash) {
      const tokenFragment = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"));

      if (tokenFragment) {
        storedToken = tokenFragment.split("=")[1];
        window.location.hash = "";
        window.localStorage.setItem("token", storedToken);
      }
    }
    setToken(storedToken || "");
  }, []);

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
      searchAbortRef.current?.abort();
    };
  }, []);

  const showMessage = useCallback((text, type) => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    setMessage({ text, type });
    messageTimeoutRef.current = setTimeout(() => {
      setMessage({ text: "", type: "" });
      messageTimeoutRef.current = null;
    }, 4000);
  }, []);

  const logout = () => {
    setToken("");
    setPlaylist([]);
    setTracks([]);
    window.localStorage.removeItem("token");
  };

  const addToPlaylist = (track) => {
    const isAlreadyInPlaylist = playlist.some((t) => t.id === track.id);
    if (!isAlreadyInPlaylist) {
      setPlaylist((prev) => [...prev, track]);
      showMessage(`"${track.name}" agregado a la playlist`, "success");
    } else {
      showMessage(`"${track.name}" ya está en la playlist`, "warning");
    }
  };

  const removeFromPlaylist = (index) => {
    const trackName = playlist[index]?.name ?? "Canción";
    setPlaylist((prev) => prev.filter((_, i) => i !== index));
    showMessage(`"${trackName}" removido de la playlist`, "info");
  };

  const exportToSpotify = async () => {
    if (playlist.length === 0) {
      showMessage("La playlist está vacía. Agrega canciones primero.", "error");
      return;
    }

    if (!playlistName.trim()) {
      showMessage("Por favor, ingresa un nombre para la playlist.", "error");
      return;
    }

    setLoadingSave(true);

    try {
      const userResponse = await axios.get("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userId = userResponse.data.id;

      const createPlaylistResponse = await axios.post(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        {
          name: playlistName.trim(),
          description: "Playlist creada con Spotify Playlist Generator",
          public: playlistIsPublic,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const playlistId = createPlaylistResponse.data.id;

      const trackUris = playlist.map((t) => t.uri);
      const batches = chunkUris(trackUris);

      for (const batch of batches) {
        await axios.post(
          `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
          { uris: batch },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      showMessage(
        `Playlist "${playlistName.trim()}" creada con ${playlist.length} canciones.`,
        "success"
      );

      setPlaylist([]);
      setPlaylistName("Mi Nueva Playlist");
    } catch (error) {
      console.error("Error al exportar a Spotify:", error);

      if (error.response?.status === 401) {
        showMessage(
          "Sesión expirada. Por favor, inicia sesión nuevamente.",
          "error"
        );
        logout();
      } else if (error.response?.status === 403) {
        showMessage(
          "No tienes permisos suficientes. Vuelve a iniciar sesión.",
          "error"
        );
      } else {
        showMessage(
          "Error al crear la playlist. Por favor, intenta de nuevo.",
          "error"
        );
      }
    } finally {
      setLoadingSave(false);
    }
  };

  const searchTracks = async (e) => {
    e.preventDefault();

    if (!searchKey.trim()) {
      showMessage("Por favor, ingresa un término de búsqueda.", "warning");
      return;
    }

    searchAbortRef.current?.abort();
    const controller = new AbortController();
    searchAbortRef.current = controller;

    setLoadingSearch(true);

    try {
      const { data } = await axios.get("https://api.spotify.com/v1/search", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          q: searchKey,
          type: "track",
          limit: 10,
        },
        signal: controller.signal,
      });

      setTracks(data.tracks.items);

      if (data.tracks.items.length === 0) {
        showMessage("No se encontraron canciones.", "info");
      }
    } catch (error) {
      if (axios.isCancel?.(error) || error.code === "ERR_CANCELED") {
        return;
      }
      console.error("Error al buscar:", error);

      if (error.response?.status === 401) {
        showMessage(
          "Sesión expirada. Por favor, inicia sesión nuevamente.",
          "error"
        );
        logout();
      } else {
        showMessage("Error al buscar canciones. Intenta de nuevo.", "error");
      }
    } finally {
      if (searchAbortRef.current === controller) {
        setLoadingSearch(false);
      }
    }
  };

  const busy = loadingSearch || loadingSave;

  return (
    <div className="App">
      <div className="App-bg" aria-hidden="true" />

      <header className="App-header">
        <div className="App-headerBrand">
          <img src={icon} alt="" className="SpotifyIcon" />
          <div className="App-headerTitles">
            <p className="App-kicker">Sesión de escucha</p>
            <h1 className="App-title">Generador de playlists</h1>
          </div>
        </div>

        {!token ? (
          <a
            className="Btn Btn--primary"
            href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(
              REDIRECT_URI
            )}&response_type=${RESPONSE_TYPE}&scope=${SCOPES}`}
          >
            Conectar Spotify
          </a>
        ) : (
          <button type="button" className="Btn Btn--ghost" onClick={logout}>
            Cerrar sesión
          </button>
        )}
      </header>

      <div
        className="MessageRegion"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {message.text ? (
          <div
            className={`Toast Toast--${message.type}`}
            role="alert"
          >
            {message.text}
          </div>
        ) : null}
      </div>

      <main className="App-main">
        {!token ? (
          <p className="App-cta">
            Conecta tu cuenta para buscar canciones y guardar una playlist en
            Spotify.
          </p>
        ) : (
          <>
            <form className="SearchForm" onSubmit={searchTracks}>
              <label className="FieldLabel" htmlFor="search-q">
                Buscar
              </label>
              <div className="SearchForm-row">
                <input
                  id="search-q"
                  className="Input SearchInput"
                  type="search"
                  placeholder="Álbum, artista o tema…"
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                  disabled={loadingSearch}
                  autoComplete="off"
                  aria-describedby="search-hint"
                />
                <button
                  type="submit"
                  className="Btn Btn--accent"
                  disabled={loadingSearch}
                >
                  {loadingSearch ? "Buscando…" : "Buscar"}
                </button>
              </div>
              <p id="search-hint" className="FieldHint">
                Resultados de Spotify (hasta 10). Una nueva búsqueda cancela la
                anterior.
              </p>
            </form>

            <div className="Columns">
              <section
                className="Panel Panel--results"
                aria-labelledby="results-heading"
              >
                <h2 id="results-heading" className="Panel-title">
                  Resultados
                </h2>
                {loadingSearch && tracks.length === 0 ? (
                  <p className="Panel-empty">Buscando en la biblioteca…</p>
                ) : null}
                <ul className="TrackList">
                  {tracks.map((track) => (
                    <li key={track.id} className="TrackCard">
                      <div className="TrackCard-media">
                        {track.album.images.length ? (
                          <img
                            className="TrackCard-cover"
                            src={track.album.images[0].url}
                            alt=""
                          />
                        ) : (
                          <div className="TrackCard-cover TrackCard-cover--empty">
                            Sin carátula
                          </div>
                        )}
                      </div>
                      <div className="TrackCard-body">
                        <span className="TrackCard-name">{track.name}</span>
                        <span className="TrackCard-artist">
                          {formatArtists(track.artists)}
                        </span>
                        <button
                          type="button"
                          className="Btn Btn--small Btn--primary"
                          onClick={() => addToPlaylist(track)}
                          disabled={busy}
                          aria-label={`Agregar ${track.name} a la playlist`}
                        >
                          Añadir
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>

              <section
                className="Panel Panel--playlist"
                aria-labelledby="playlist-heading"
              >
                <h2 id="playlist-heading" className="Panel-title">
                  Tu lista
                </h2>

                <div className="PlaylistFields">
                  <div className="Field">
                    <label className="FieldLabel" htmlFor="playlist-name">
                      Nombre de la playlist
                    </label>
                    <input
                      id="playlist-name"
                      className="Input"
                      type="text"
                      placeholder="Ej. Viaje nocturno"
                      value={playlistName}
                      onChange={(e) => setPlaylistName(e.target.value)}
                      disabled={loadingSave}
                    />
                  </div>

                  <div className="Field Field--inline">
                    <input
                      id="playlist-public"
                      type="checkbox"
                      className="Checkbox"
                      checked={playlistIsPublic}
                      onChange={(e) => setPlaylistIsPublic(e.target.checked)}
                      disabled={loadingSave}
                    />
                    <label htmlFor="playlist-public" className="CheckboxLabel">
                      Visible en mi perfil de Spotify
                    </label>
                  </div>
                </div>

                {playlist.length === 0 ? (
                  <p className="Panel-empty">
                    Aún no hay canciones. Añade temas desde la izquierda.
                  </p>
                ) : (
                  <ul className="PlaylistItems">
                    {playlist.map((track, index) => (
                      <li key={track.id} className="PlaylistItem">
                        {track.album.images.length > 0 ? (
                          <img
                            src={
                              track.album.images[track.album.images.length - 1]
                                .url
                            }
                            alt=""
                            className="PlaylistItem-cover"
                          />
                        ) : (
                          <div className="PlaylistItem-cover PlaylistItem-cover--empty" />
                        )}
                        <div className="PlaylistItem-text">
                          <span className="PlaylistItem-name">{track.name}</span>
                          <span className="PlaylistItem-artist">
                            {formatArtists(track.artists)}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="PlaylistItem-remove"
                          onClick={() => removeFromPlaylist(index)}
                          disabled={busy}
                          aria-label={`Quitar ${track.name} de la lista`}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                {playlist.length > 0 ? (
                  <button
                    type="button"
                    className="Btn Btn--primary Btn--block SaveBtn"
                    onClick={exportToSpotify}
                    disabled={loadingSave}
                    aria-busy={loadingSave}
                  >
                    {loadingSave
                      ? "Guardando en Spotify…"
                      : `Guardar en Spotify (${playlist.length})`}
                  </button>
                ) : null}
              </section>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
