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

  // Do not render a separate .app-layout/.main/.card here — let App provide layout.
  // Always call children so App's Header + card layout control the page structure.
  if (!isAuthenticated || !user) {
    return (
      <>
        {children(null, logout, loginButton)}
        {authError && (
          <div className="message error" style={{ marginTop: '1rem' }}>
            ✗ {authError}
          </div>
        )}
      </>
    );
  }

  return <>{children(user, logout, loginButton)}</>;
}

export default TwitchLogin;
