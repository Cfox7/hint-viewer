import { useTwitchOAuth } from '../hooks/useTwitchOAuth';

interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  profile_image_url: string;
}

interface TwitchLoginProps {
  children: (user: TwitchUser | null, logout: () => void, login: () => void) => React.ReactNode;
}

function TwitchLogin({ children }: TwitchLoginProps) {
  const { user, error: authError, login, logout, isAuthenticated } = useTwitchOAuth();

  if (!isAuthenticated || !user) {
    return (
      <>
        {children(null, logout, login)}
        {authError && (
          <div className="message error" style={{ marginTop: '1rem' }}>
            ✗ {authError}
          </div>
        )}
      </>
    );
  }

  return <>{children(user, logout, login)}</>;
}

export default TwitchLogin;
