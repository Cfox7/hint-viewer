import { useState } from 'react';
import { useTwitchAuth } from '../hooks/useTwitchAuth';
import Upload from '../components/Upload';
import DisplayHints from '../components/DisplayHints';

interface SpoilerLog {
  "Wrinkly Hints": {
    [hintLocation: string]: string;
  };
}

function Panel() {
  const { game, role } = useTwitchAuth();
  const [spoilerData, setSpoilerData] = useState<SpoilerLog | null>(null);

  return (
    <div style={{ color: 'white', padding: '20px' }}>
      {!spoilerData && (
        <>
          {game && <p>Current Game: {game}</p>}
          {role && <p>Role: {role}</p>}
        </>
      )}
      {spoilerData && <DisplayHints spoilerData={spoilerData} />}
      {role === 'broadcaster' && <Upload setSpoilerData={setSpoilerData} />}
    </div>
  );
}

export default Panel;
