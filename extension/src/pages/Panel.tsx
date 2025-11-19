import { useTwitchAuth } from '../hooks/useTwitchAuth';
import ProcessHints from '../components/ProcessHints';

function Panel() {
  const { auth } = useTwitchAuth();

  // Get channel ID from auth data
  const channelId = auth?.channelId;

  return (
    <div style={{ color: 'white', padding: '20px' }}>
      <ProcessHints channelId={channelId} />
    </div>
  );
}

export default Panel;
