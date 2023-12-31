import "./App.css";
import { useEffect, useState } from "react";
import icon from "../../images/icon.png";
import axios from "axios";

function App() {
  const CLIENT_ID = "5618e6d9904642caabe20dcb8772baeb";
  const REDIRECT_URI = "http://localhost:3000";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";

  const [token, setToken] = useState("");
  const [searchKey, setSearchKey] = useState("");
  const [tracks, setTracks] = useState([]);
  const [playlist, setPlaylist] = useState([]);

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    if (!token && hash) {
      token = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"))
        .split("=")[1];

      window.location.hash = "";
      window.localStorage.setItem("token", token);
    }
    setToken(token);
  }, []);

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
  };

  const addToPlaylist = (elem) => {
    if (!playlist.includes(elem)) {
      setPlaylist((prevPlaylist) => [...prevPlaylist, elem]);
    }
  };

  const removeFromPlaylist = (index) => {
    setPlaylist((prevPlaylist) => prevPlaylist.filter((_, i) => i !== index));
  };



  const exportToSpotify = async () => {
  };


  const searchTracks = async (e) => {
    e.preventDefault();
    const { data } = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        q: searchKey,
        type: "track",
        limit: 4,
      },
    });

    setTracks(data.tracks.items);
  };

  const renderTracks = () => {
    return (
      <div>
        <h2 style={{ color: "white" }}>SONGS</h2>
        {tracks.map((elem) => (
          <div className="TrackResults" key={elem.id}>
            {elem.album.images.length ? (
              <img
                className="TrackImage"
                src={elem.album.images[0].url}
                alt=""
              />
            ) : (
              <div>No Image</div>
            )}
            <div style={{ marginTop: 15 }}>
              <span style={{ color: "white" }}>{elem.name}</span>
            </div>
            <div style={{ marginTop: 10, marginBottom: 10 }}>
              <span style={{ color: "gray" }}>{elem.artists[0].name}</span>
            </div>
            <button
              className="SpotifyButton"
              onClick={() => addToPlaylist(elem.name)}
            >
              + Add to Playlist
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderPlaylist = () => {
    return (
      <div>
        <h2 style={{ color: "white", display: "inline"}}>PLAYLIST</h2>
        {playlist.map((track, index) => (
          <div style={{marginTop: 15}}>
            <div
              className="PlaylistTracks"
              key={index}
              style={{ display: "inline"}}
            >
              {track}
              <button
                className="SpotifyButton"
                style={{ marginLeft: 15}}
                onClick={() => removeFromPlaylist(index)}
              >
                - Remove
              </button>
            </div>
          </div>
        ))}
        <button
          className="SpotifyButton"
          style={{ marginTop: 20 }}
          onClick={exportToSpotify}
        >
          Save to Spotify
        </button>
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={icon} alt="" className="SpotifyIcon" />
        <h1>Spotify Playlist Generator</h1>

        {!token ? (
          <a
            className="SpotifyButton"
            href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}
            style={{ marginLeft: 15 }}
          >
            Log In
          </a>
        ) : (
          <button
            className="SpotifyButton"
            style={{ marginLeft: 15 }}
            onClick={logout}
          >
            Log Out
          </button>
        )}
      </header>

      {token ? (
        <form onSubmit={searchTracks}>
          <input
            className="SearchBar"
            type="text"
            placeholder="What do you want to listen to?"
            onChange={(e) => setSearchKey(e.target.value)}
          />
        </form>
      ) : (
        <h2 style={{ color: "white" }}>Please Log In to Continue!</h2>
      )}
      <div className="Columns">
        <div className="TrackResults">
          <div>{renderTracks()}</div>
        </div>

        <div className="Playlist">
          <div>{renderPlaylist()}</div>
        </div>
      </div>
    </div>
  );
}
export default App;
