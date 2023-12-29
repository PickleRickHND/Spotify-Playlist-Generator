import './App.css';
import '../SearchBar/SearchBar';
import SearchBar from '../SearchBar/SearchBar';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Spotify Playlist Generator</h1>
      </header>
      <SearchBar />
    </div>
  );
}

export default App;
