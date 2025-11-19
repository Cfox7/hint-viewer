import TwitchLogin from './components/TwitchLogin';
import Upload from './components/Upload';
import './App.css';

function App() {
  return (
    <div className="app-layout">
      <TwitchLogin>
        {(user, logout) => (
          <>
            <header className="app-header">
              <div className="header-content">
                <div className="header-title">
                  <h1>🍌 DK64 Randomizer</h1>
                  <h2>Broadcaster Upload</h2>
                </div>
                <div className="user-info-header">
                  <img src={user.profile_image_url} alt={user.display_name} />
                  <div>
                    <strong>{user.display_name}</strong>
                    <small>Channel ID: {user.id}</small>
                  </div>
                  <button onClick={logout} className="logout-btn">
                    Logout
                  </button>
                </div>
              </div>
            </header>
            <main className="main-content">
              <div className="content-card">
                <div className="container">
                  <div className="card">
                    <Upload channelId={user.id} />
                  </div>
                </div>
              </div>
            </main>
          </>
        )}
      </TwitchLogin>
    </div>
  );
}

export default App;
