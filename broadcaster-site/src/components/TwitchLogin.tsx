import { useTwitchOAuth } from '../hooks/useTwitchOAuth';

interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  profile_image_url: string;
}

interface TwitchLoginProps {
  children: (user: TwitchUser, logout: () => void) => React.ReactNode;
}

function TwitchLogin({ children }: TwitchLoginProps) {
  const { user, loading, error: authError, login, logout, isAuthenticated } = useTwitchOAuth();

  if (loading) {
    return (
      <div className="app-layout">
        <header className="app-header">
          <div className="header-content">
            <div className="header-title">
              <h1>🍌 DK64 Randomizer</h1>
              <h2>Broadcaster Upload</h2>
            </div>
          </div>
        </header>
        <main className="main-content">
          <div className="content-card">
            <div className="container">
              <div className="card">
                <div className="message uploading">
                  <span className="spinner">⏳</span> Loading...
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="app-layout">
        <header className="app-header">
          <div className="header-content">
            <div className="header-title">
              <h1>🍌 DK64 Randomizer</h1>
              <h2>Broadcaster Upload</h2>
            </div>
          </div>
        </header>
        <main className="main-content">
          <div className="content-card">
            <div className="container">
              <div className="card">
                <div className="auth-section">
                  <p>Please log in with your Twitch account to upload spoiler logs.</p>
                  <button onClick={login} className="twitch-login-btn">
                    Login with Twitch
                  </button>
                  {authError && (
                    <div className="message error">
                      ✗ {authError}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return <>{children(user, logout)}</>;
}

export default TwitchLogin;
