import { useTwitchAuth } from '../hooks/useTwitchAuth';
import ProcessHints from '../components/ProcessHints';

function Panel() {
  const { auth } = useTwitchAuth();

  const channelId = auth?.channelId;

  return (
    <div>
      <ProcessHints channelId={channelId} />
    </div>
  );
}

export default Panel;
