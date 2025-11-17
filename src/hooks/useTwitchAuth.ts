import { useEffect, useState } from 'react';

export function useTwitchAuth() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [auth, setAuth] = useState<Twitch.ext.Authorized | null>(null);
  const [game, setGame] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Wait for Twitch Extension SDK to load
    if (window.Twitch?.ext) {
      console.log('Twitch Extension SDK loaded');
      
      window.Twitch.ext.onAuthorized((authData: Twitch.ext.Authorized) => {
        console.log('Authorized:', authData);
        setAuth(authData);
        setIsAuthorized(true);
      });

      window.Twitch.ext.onContext((context: Twitch.ext.Context) => {
        console.log('Context updated:', context);
        if (context.game) {
          setGame(context.game);
        }
      });

      // Use onChanged() to listen for viewer role updates
      window.Twitch.ext.viewer.onChanged(() => {
        console.log('Viewer role:', window.Twitch.ext.viewer.role);
        setRole(window.Twitch.ext.viewer.role);
      });

      window.Twitch.ext.listen('broadcast', (target: string, contentType: string, message: string) => {
        console.log('Broadcast message received:', { target, contentType, message });
      });
    }
  }, []);

  return { isAuthorized, auth, game, role };
}
