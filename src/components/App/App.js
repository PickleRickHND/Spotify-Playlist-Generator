import "./App.css";
import { useEffect, useState } from "react";
import icon from "../../images/icon.png";
import axios from "axios";

function App() {
  const CLIENT_ID = "5618e6d9904642caabe20dcb8772baeb";
  const REDIRECT_URI = "http://localhost:3000";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  // Scopes necesarios para crear playlists y modificarlas
  const SCOPES = [
    "playlist-modify-public",
    "playlist-modify-private",
    "user-read-private",
  ].join("%20");

  const [token, setToken] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [tracks, setTracks] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [playlistName, setPlaylistName] = useState("Mi Nueva Playlist");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

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

  // Mostrar mensaje temporal
  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  };

  const logout = () => {
    setToken("");
    setPlaylist([]);
    setTracks([]);
    window.localStorage.removeItem("token");
  };

  // Guardar el objeto track completo (no solo el nombre)
  const addToPlaylist = (track) => {
    // Verificar si el track ya está en la playlist por su ID
    const isAlreadyInPlaylist = playlist.some((t) => t.id === track.id);
    if (!isAlreadyInPlaylist) {
      setPlaylist((prevPlaylist) => [...prevPlaylist, track]);
      showMessage(`"${track.name}" agregado a la playlist`, "success");
    } else {
      showMessage(`"${track.name}" ya está en la playlist`, "warning");
    }
  };

  const removeFromPlaylist = (index) => {
    const trackName = playlist[index]?.name;
    setPlaylist((prevPlaylist) => prevPlaylist.filter((_, i) => i !== index));
    showMessage(`"${trackName}" removido de la playlist`, "info");
  };

  // Función completa para exportar la playlist a Spotify
  const exportToSpotify = async () => {
    if (playlist.length === 0) {
      showMessage("La playlist está vacía. Agrega canciones primero.", "error");
      return;
    }

    if (!playlistName.trim()) {
      showMessage("Por favor, ingresa un nombre para la playlist.", "error");
      return;
    }

    setLoading(true);

    try {
      // 1. Obtener el ID del usuario actual
      const userResponse = await axios.get("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const userId = userResponse.data.id;

      // 2. Crear la playlist
      const createPlaylistResponse = await axios.post(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        {
          name: playlistName,
          description: "Playlist creada con Spotify Playlist Generator",
          public: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const playlistId = createPlaylistResponse.data.id;

      // 3. Agregar los tracks a la playlist
      const trackUris = playlist.map((track) => track.uri);
      await axios.post(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          uris: trackUris,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      showMessage(
        `Playlist "${playlistName}" creada exitosamente con ${playlist.length} canciones!`,
        "success"
      );

      // Limpiar la playlist local después de guardar
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
          "No tienes permisos suficientes. Por favor, vuelve a iniciar sesión.",
          "error"
        );
      } else {
        showMessage(
          "Error al crear la playlist. Por favor, intenta de nuevo.",
          "error"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const searchTracks = async (e) => {
    e.preventDefault();

    if (!searchKey.trim()) {
      showMessage("Por favor, ingresa un término de búsqueda.", "warning");
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.get("https://api.spotify.com/v1/search", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          q: searchKey,
          type: "track",
          limit: 10,
        },
      });

      setTracks(data.tracks.items);

      if (data.tracks.items.length === 0) {
        showMessage("No se encontraron canciones.", "info");
      }
    } catch (error) {
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
      setLoading(false);
    }
  };

  const renderTracks = () => {
    return (
      <div>
        <h2 style={{ color: "white" }}>CANCIONES</h2>
        {loading && tracks.length === 0 && (
          <p style={{ color: "gray" }}>Buscando...</p>
        )}
        {tracks.map((track) => (
          <div className="TrackResults" key={track.id}>
            {track.album.images.length ? (
              <img
                className="TrackImage"
                src={track.album.images[0].url}
                alt={track.name}
              />
            ) : (
              <div className="TrackImage" style={{ backgroundColor: "#333" }}>
                Sin Imagen
              </div>
            )}
            <div style={{ marginTop: 15 }}>
              <span style={{ color: "white", fontWeight: "bold" }}>
                {track.name}
              </span>
            </div>
            <div style={{ marginTop: 10, marginBottom: 10 }}>
              <span style={{ color: "gray" }}>
                {track.artists.map((artist) => artist.name).join(", ")}
              </span>
            </div>
            <button
              className="SpotifyButton"
              onClick={() => addToPlaylist(track)}
              disabled={loading}
            >
              + Agregar a Playlist
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderPlaylist = () => {
    return (
      <div>
        <h2 style={{ color: "white" }}>PLAYLIST</h2>

        {token && (
          <div style={{ marginBottom: 20 }}>
            <input
              type="text"
              className="PlaylistNameInput"
              placeholder="Nombre de la playlist"
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
            />
          </div>
        )}

        {playlist.length === 0 ? (
          <p style={{ color: "gray" }}>
            Tu playlist está vacía. Busca canciones y agrégalas.
          </p>
        ) : (
          playlist.map((track, index) => (
            <div key={track.id} className="PlaylistItem">
              {track.album.images.length > 0 && (
                <img
                  src={track.album.images[track.album.images.length - 1].url}
                  alt={track.name}
                  className="PlaylistTrackImage"
                />
              )}
              <div className="PlaylistTrackInfo">
                <span className="PlaylistTrackName">{track.name}</span>
                <span className="PlaylistTrackArtist">
                  {track.artists.map((artist) => artist.name).join(", ")}
                </span>
              </div>
              <button
                className="RemoveButton"
                onClick={() => removeFromPlaylist(index)}
                disabled={loading}
                title="Remover de la playlist"
              >
                &times;
              </button>
            </div>
          ))
        )}

        {token && playlist.length > 0 && (
          <button
            className="SpotifyButton SaveButton"
            onClick={exportToSpotify}
            disabled={loading}
          >
            {loading ? "Guardando..." : `Guardar en Spotify (${playlist.length})`}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={icon} alt="Spotify" className="SpotifyIcon" />
        <h1>Spotify Playlist Generator</h1>

        {!token ? (
          <a
            className="SpotifyButton"
            href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${SCOPES}`}
            style={{ marginLeft: 15 }}
          >
            Iniciar Sesión
          </a>
        ) : (
          <button
            className="SpotifyButton"
            style={{ marginLeft: 15 }}
            onClick={logout}
          >
            Cerrar Sesión
          </button>
        )}
      </header>

      {/* Mensaje de notificación */}
      {message.text && (
        <div className={`Message Message-${message.type}`}>{message.text}</div>
      )}

      {token ? (
        <form onSubmit={searchTracks}>
          <input
            className="SearchBar"
            type="text"
            placeholder="¿Qué quieres escuchar?"
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            disabled={loading}
          />
        </form>
      ) : (
        <h2 style={{ color: "white" }}>¡Inicia sesión para continuar!</h2>
      )}

      <div className="Columns">
        <div className="SearchResultsColumn">{renderTracks()}</div>
        <div className="PlaylistColumn">{renderPlaylist()}</div>
      </div>
    </div>
  );
}

export default App;
