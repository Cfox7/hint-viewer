import { useState } from 'react';
import { useTwitchAuth } from '../hooks/useTwitchAuth';
import Upload from '../components/Upload';
import DisplayHints from '../components/DisplayHints';
import type { SpoilerLog } from '@hint-viewer/shared';

function Panel() {
  const { game, role, auth } = useTwitchAuth();
  const [spoilerData, setSpoilerData] = useState<SpoilerLog | null>(null);

  // Get channel ID from auth data
  const channelId = auth?.channelId;

  return (
    <div style={{ color: 'white', padding: '20px' }}>
      {!spoilerData && (
        <>
          {game && <p>Current Game: {game}</p>}
          {role && <p>Role: {role}</p>}
        </>
      )}
      {spoilerData && <DisplayHints spoilerData={spoilerData} />}
      <Upload setSpoilerData={setSpoilerData} channelId={channelId} />
    </div>
  );
}

export default Panel;
