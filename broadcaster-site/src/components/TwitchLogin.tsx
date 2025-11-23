import Header from './Header';
import { useTwitchOAuth } from '../hooks/useTwitchOAuth';

interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  profile_image_url: string;
}

interface TwitchLoginProps {
  children: (user: TwitchUser | null, logout: () => void, loginButton: React.ReactNode) => React.ReactNode;
}

function TwitchLogin({ children }: TwitchLoginProps) {
  const { user, error: authError, login, logout, isAuthenticated } = useTwitchOAuth();

  const loginButton = (
    <button onClick={login} className="twitch-btn">
      Login with Twitch
    </button>
  );

  if (!isAuthenticated || !user) {
    return (
      <div className="app-layout">
        <Header loginButton={loginButton} />
        <main className="main-content">
          <div className="content-card">
            <div className="container">
              <div className="card">
                <div className="auth-section">
                  <p>Please log in with your Twitch account to upload spoiler logs.</p>
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

  return <>{children(user, logout, loginButton)}</>;
}

export default TwitchLogin;
