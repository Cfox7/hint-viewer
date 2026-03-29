import { useEffect, useState } from 'react';

const isLocal = import.meta.env.VITE_LOCAL === 'true';
const devChannelId = import.meta.env.VITE_DEV_CHANNEL_ID || '';

export function useTwitchAuth() {
  const [isAuthorized, setIsAuthorized] = useState(isLocal);
  const [auth, setAuth] = useState<Twitch.ext.Authorized | null>(
    isLocal ? ({ channelId: devChannelId } as Twitch.ext.Authorized) : null
  );
  const [game, setGame] = useState<string | null>(null);

  useEffect(() => {
    if (isLocal) return;

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
