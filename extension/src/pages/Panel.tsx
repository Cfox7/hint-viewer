import { useEffect } from 'react';
import { useTwitchAuth } from '../hooks/useTwitchAuth';
import ProcessHints from '../components/ProcessHints';
import { useGame } from '../contexts/GameContext';

function Panel() {
  const { auth } = useTwitchAuth();
  const { game } = useGame();

  useEffect(() => {
    document.documentElement.dataset.theme = game.id;
  }, [game.id]);

  const channelId = auth?.channelId;

  return (
    <div>
      <ProcessHints channelId={channelId} />
    </div>
  );
}

export default Panel;
