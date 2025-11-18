import { useState, useEffect } from 'react';
import type { SpoilerLog, SpoilerResponse } from '@hint-viewer/shared';

interface UploadProps {
  setSpoilerData: (data: SpoilerLog | null) => void;
  channelId: string | undefined;
}

const API_URL = 'https://hint-viewer-production.up.railway.app';

function Upload({ setSpoilerData, channelId }: UploadProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<string | null>(null);

  useEffect(() => {
    if (!channelId) {
      setLoading(false);
      return;
    }

    const fetchSpoilerData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/spoiler/${channelId}`);
        
        if (response.status === 404) {
          // No spoiler log uploaded yet
          setSpoilerData(null);
          setLoading(false);
          setError(null);
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch spoiler data');
        }

        const data: SpoilerResponse = await response.json();
        setSpoilerData(data.data);
        setLastFetch(data.uploadedAt);
        setLoading(false);
        setError(null);
      } catch (err) {
        setError('Failed to load spoiler data');
        setLoading(false);
        console.error('Fetch error:', err);
      }
    };

    fetchSpoilerData();
    
    // Poll every 30 seconds for updates
    const interval = setInterval(fetchSpoilerData, 30000);
    
    return () => clearInterval(interval);
  }, [channelId, setSpoilerData]);

  if (loading) {
    return <p style={{ fontSize: '12px', color: '#999' }}>Loading hints...</p>;
  }

  if (error) {
    return <p style={{ fontSize: '12px', color: '#ff6b6b' }}>{error}</p>;
  }
  
  return (
    <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '10px' }}>
      {lastFetch && <p>Last updated: {new Date(lastFetch).toLocaleTimeString()}</p>}
      {!lastFetch && <p>No spoiler log uploaded yet. Broadcaster should upload via the broadcaster site.</p>}
    </div>
  );
}

export default Upload;