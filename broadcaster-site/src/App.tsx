import TwitchLogin from './components/TwitchLogin';
import Upload from './components/Upload';
import Header from './components/Header';
import './App.css';

function App() {
  return (
    <div className="app-layout">
      <TwitchLogin>
        {(user, logout, loginButton) => (
          <>
            <Header
              user={user ?? undefined} // Convert null to undefined
              logout={logout}
              loginButton={!user ? loginButton : undefined}
            />
            <main className="main-content">
              <div className="content-card">
                <div className="container">
                  <div className="card">
                    {user && <Upload channelId={user.id} />}
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
