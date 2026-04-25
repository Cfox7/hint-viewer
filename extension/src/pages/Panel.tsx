import { useTwitchAuth } from '../hooks/useTwitchAuth';
import ProcessHints from '../components/ProcessHints';
import { useDynamicTheme } from '@hint-viewer/shared/useDynamicTheme';
import { useGame } from '../contexts/GameContext';

function Panel() {
  const { auth } = useTwitchAuth();

  // Get channel ID from auth data
  const channelId = auth?.channelId;
  const { game }= useGame();

  useDynamicTheme(game.id);

  return (
    <div style={{ color: 'white', padding: '20px' }}>
      <ProcessHints channelId={channelId} />
    </div>
  );
}

export default Panel;
