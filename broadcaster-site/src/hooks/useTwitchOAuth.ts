import { useEffect, useState } from 'react';

interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  profile_image_url: string;
}

const TWITCH_CLIENT_ID = import.meta.env.VITE_TWITCH_CLIENT_ID || '';
const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI || window.location.origin;

export function useTwitchOAuth() {
  const [user, setUser] = useState<TwitchUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if we have an access token in the URL fragment
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');

    if (accessToken) {
      // Clear the hash from URL
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      
      // Store the token
      localStorage.setItem('twitch_access_token', accessToken);
      
      // Fetch user info
      fetchUserInfo(accessToken);
    } else {
      // Check if we have a stored token
      const storedToken = localStorage.getItem('twitch_access_token');
      if (storedToken) {
        fetchUserInfo(storedToken);
      } else {
        setLoading(false);
      }
    }
  }, []);

  const fetchUserInfo = async (token: string) => {
    try {
      const response = await fetch('https://api.twitch.tv/helix/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Client-Id': TWITCH_CLIENT_ID,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token is invalid, clear it
          localStorage.removeItem('twitch_access_token');
          setUser(null);
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch user info');
      }

      const data = await response.json();
      if (data.data && data.data.length > 0) {
        setUser(data.data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user info');
      localStorage.removeItem('twitch_access_token');
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    if (!TWITCH_CLIENT_ID) {
      setError('Twitch Client ID is not configured');
      return;
    }

    const authUrl = new URL('https://id.twitch.tv/oauth2/authorize');
    authUrl.searchParams.set('client_id', TWITCH_CLIENT_ID);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'token');
    authUrl.searchParams.set('scope', 'user:read:email');
    
    window.location.href = authUrl.toString();
  };

  const logout = () => {
    localStorage.removeItem('twitch_access_token');
    setUser(null);
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user,
  };
}
