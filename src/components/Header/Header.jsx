import "./Header.css";
import icon from "../../images/icon.png";

export default function Header({ token, logout, authUrl, profile }) {
  return (
    <header className="App-header">
      <div className="App-headerBrand">
        <img src={icon} alt="" className="SpotifyIcon" />
        <div className="App-headerTitles">
          <p className="App-kicker">Sesión de escucha</p>
          <h1 className="App-title">Generador de playlists</h1>
        </div>
      </div>

      <div className="Header-actions">
        {token && profile && (
          <div className="Header-user">
            {profile.imageUrl ? (
              <img
                src={profile.imageUrl}
                alt={profile.displayName}
                className="Header-avatar"
              />
            ) : (
              <div className="Header-avatar Header-avatar--empty" />
            )}
            <div className="Header-userInfo">
              <span className="Header-userName">{profile.displayName}</span>
              <span className="Header-badge">Spotify</span>
            </div>
          </div>
        )}

        {!token ? (
          <a className="Btn Btn--primary" href={authUrl}>
            Conectar Spotify
          </a>
        ) : (
          <button type="button" className="Btn Btn--ghost" onClick={logout}>
            Cerrar sesión
          </button>
        )}
      </div>
    </header>
  );
}
