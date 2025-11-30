import { useEffect, useState } from 'react';

export function useTwitchAuth() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [auth, setAuth] = useState<Twitch.ext.Authorized | null>(null);
  const [game, setGame] = useState<string | null>(null);

  useEffect(() => {
    // Wait for Twitch Extension SDK to load
    if (window.Twitch?.ext) {
      console.log('Twitch Extension SDK loaded');
      
      window.Twitch.ext.onAuthorized((authData: Twitch.ext.Authorized) => {
        setAuth(authData);
        setIsAuthorized(true);
      });

      window.Twitch.ext.onContext((context: Twitch.ext.Context) => {
        // console.log('Context updated:', context);
        if (context.game) {
          setGame(context.game);
        }
      });
    }
  }, []);

  return { isAuthorized, auth, game };
}
