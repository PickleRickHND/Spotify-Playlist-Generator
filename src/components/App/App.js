import "./App.css";
import { useCallback, useEffect, useState } from "react";
import useSpotifyAuth, { buildAuthorizeUrl } from "../../hooks/useSpotifyAuth";
import useMessage from "../../hooks/useMessage";
import usePlaylist from "../../hooks/usePlaylist";
import useSearch from "../../hooks/useSearch";
import useAudioPlayer from "../../hooks/useAudioPlayer";
import useRecommendations from "../../hooks/useRecommendations";
import useUserProfile from "../../hooks/useUserProfile";
import useArtistDrilldown from "../../hooks/useArtistDrilldown";
import useMoodGenerator from "../../hooks/useMoodGenerator";
import useExistingPlaylists from "../../hooks/useExistingPlaylists";
import Header from "../Header/Header";
import Toast from "../Toast/Toast";
import TabBar from "../TabBar/TabBar";
import SearchForm from "../SearchForm/SearchForm";
import ResultsPanel from "../ResultsPanel/ResultsPanel";
import PlaylistPanel from "../PlaylistPanel/PlaylistPanel";
import RecommendationsPanel from "../RecommendationsPanel/RecommendationsPanel";
import UserMusicPanel from "../UserMusicPanel/UserMusicPanel";
import MoodGenerator from "../MoodGenerator/MoodGenerator";
import PlaylistBrowser from "../PlaylistBrowser/PlaylistBrowser";

const CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
const REDIRECT_URI =
  process.env.REACT_APP_REDIRECT_URI || "http://localhost:3000";

const SCOPES = [
  "playlist-modify-public",
  "playlist-modify-private",
  "user-read-private",
  "user-top-read",
  "playlist-read-private",
].join(" ");

const TABS = [
  { id: "search", label: "Buscar" },
  { id: "music", label: "Tu música" },
  { id: "generator", label: "Generador" },
  { id: "playlists", label: "Mis playlists" },
];

function App() {
  if (!CLIENT_ID) {
    return (
      <div className="App">
        <div className="App-bg" aria-hidden="true" />
        <main className="App-main">
          <p className="App-cta" style={{ color: "var(--coral)" }}>
            Error: REACT_APP_SPOTIFY_CLIENT_ID no está configurado. Copia
            .env.example a .env y agrega tu Client ID de Spotify.
          </p>
        </main>
      </div>
    );
  }

  return <AppContent />;
}

function AppContent() {
  const { token, logout, authError, exchanging } = useSpotifyAuth({
    clientId: CLIENT_ID,
    redirectUri: REDIRECT_URI,
  });
  const [authUrl, setAuthUrl] = useState("");

  useEffect(() => {
    if (!token && !exchanging) {
      buildAuthorizeUrl({
        clientId: CLIENT_ID,
        redirectUri: REDIRECT_URI,
        scopes: SCOPES,
      }).then(setAuthUrl);
    }
  }, [token, exchanging]);
  const { message, showMessage } = useMessage();
  const {
    playlist,
    playlistName,
    playlistIsPublic,
    loadingSave,
    editingPlaylistId,
    setPlaylistName,
    setPlaylistIsPublic,
    addToPlaylist,
    removeFromPlaylist,
    fillPlaylist,
    loadExistingPlaylist,
    clearPlaylist,
    exportToSpotify,
  } = usePlaylist(showMessage, logout);
  const { searchKey, setSearchKey, tracks, loadingSearch, searchTracks } =
    useSearch(showMessage, logout);
  const { currentTrackId, isPlaying, progress, togglePlay, stopPlayback } =
    useAudioPlayer();
  const { recommendations, loadingRecs, fetchRecommendations } =
    useRecommendations(showMessage);
  const { profile, topTracks, topArtists } = useUserProfile(token);
  const {
    selectedArtist,
    artistTopTracks,
    loadingArtistTracks,
    selectArtist,
    clearArtist,
  } = useArtistDrilldown();
  const mood = useMoodGenerator(showMessage);
  const {
    userPlaylists,
    loadingPlaylists,
    fetchUserPlaylists,
    fetchPlaylistTracks,
  } = useExistingPlaylists(showMessage);

  const [activeTab, setActiveTab] = useState("search");

  const busy = loadingSearch || loadingSave;

  const handleLogout = () => {
    stopPlayback();
    logout();
  };

  const handleLoadPlaylist = useCallback(
    async (pl) => {
      showMessage(`Cargando "${pl.name}"…`, "info");
      try {
        const loadedTracks = await fetchPlaylistTracks(pl.id);
        loadExistingPlaylist(pl.id, loadedTracks, pl.name, pl.isPublic);
        showMessage(`"${pl.name}" cargada con ${loadedTracks.length} canciones.`, "success");
      } catch {
        showMessage("Error al cargar la playlist.", "error");
      }
    },
    [fetchPlaylistTracks, loadExistingPlaylist, showMessage]
  );

  useEffect(() => {
    if (activeTab === "generator") {
      mood.fetchGenreSeeds();
    }
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const audioProps = { currentTrackId, isPlaying, progress, onTogglePlay: togglePlay };

  return (
    <div className="App">
      <div className="App-bg" aria-hidden="true" />

      <Header
        token={token}
        logout={handleLogout}
        authUrl={authUrl}
        profile={profile}
      />

      <Toast message={message} />

      <main className="App-main">
        {authError && (
          <p className="App-cta" style={{ color: "var(--coral)" }}>
            {authError}
          </p>
        )}
        {exchanging ? (
          <p className="App-cta">Iniciando sesión…</p>
        ) : !token ? (
          <p className="App-cta">
            Conecta tu cuenta para buscar canciones y guardar una playlist en
            Spotify.
          </p>
        ) : (
          <>
            <TabBar
              tabs={TABS}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            <div className="Columns">
              <div className="Columns-main">
                {activeTab === "search" && (
                  <>
                    <SearchForm
                      searchKey={searchKey}
                      onSearchKeyChange={setSearchKey}
                      onSubmit={searchTracks}
                      loading={loadingSearch}
                    />
                    <ResultsPanel
                      tracks={tracks}
                      loadingSearch={loadingSearch}
                      onAdd={addToPlaylist}
                      busy={busy}
                      {...audioProps}
                    />
                  </>
                )}

                {activeTab === "generator" && (
                  <MoodGenerator
                    {...mood}
                    onAdd={addToPlaylist}
                    onFillPlaylist={fillPlaylist}
                    busy={busy}
                    {...audioProps}
                  />
                )}

                {activeTab === "music" && (
                  <UserMusicPanel
                    topTracks={topTracks}
                    topArtists={topArtists}
                    selectedArtist={selectedArtist}
                    artistTopTracks={artistTopTracks}
                    loadingArtistTracks={loadingArtistTracks}
                    onSelectArtist={selectArtist}
                    onClearArtist={clearArtist}
                    onAdd={addToPlaylist}
                    busy={busy}
                    {...audioProps}
                  />
                )}

                {activeTab === "playlists" && (
                  <PlaylistBrowser
                    userPlaylists={userPlaylists}
                    loadingPlaylists={loadingPlaylists}
                    onFetchPlaylists={fetchUserPlaylists}
                    onLoadPlaylist={handleLoadPlaylist}
                  />
                )}
              </div>

              <PlaylistPanel
                playlist={playlist}
                playlistName={playlistName}
                playlistIsPublic={playlistIsPublic}
                onNameChange={setPlaylistName}
                onPublicChange={setPlaylistIsPublic}
                onRemove={removeFromPlaylist}
                onSave={exportToSpotify}
                loadingSave={loadingSave}
                busy={busy}
                editingPlaylistId={editingPlaylistId}
                onExitEditMode={clearPlaylist}
                {...audioProps}
              />
            </div>

            <RecommendationsPanel
              playlist={playlist}
              recommendations={recommendations}
              loadingRecs={loadingRecs}
              onFetch={fetchRecommendations}
              onAdd={addToPlaylist}
              busy={busy}
              {...audioProps}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
