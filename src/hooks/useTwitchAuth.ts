import { useEffect, useState } from 'react';

export function useTwitchAuth() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [auth, setAuth] = useState<Twitch.ext.Authorized | null>(null);

  useEffect(() => {
    // Wait for Twitch Extension SDK to load
    if (window.Twitch?.ext) {
      console.log('Twitch Extension SDK loaded');
      
      window.Twitch.ext.onAuthorized((authData: Twitch.ext.Authorized) => {
        console.log('Authorized:', authData);
        setAuth(authData);
        setIsAuthorized(true);
      });
    }
  }, []);

  return { isAuthorized, auth };
}
