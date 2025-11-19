import { useState, useEffect } from 'react';
import { HintCarousel } from './HintCarousel';
import type { SpoilerLog, SpoilerResponse } from '@hint-viewer/shared';

interface ProcessHintsProps {
  channelId: string | undefined;
}

const API_URL = 'https://hint-viewer-production.up.railway.app';

function ProcessHints({ channelId }: ProcessHintsProps) {
  const [spoilerData, setSpoilerData] = useState<SpoilerLog | null>(null);
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
          throw new Error('Failed to fetch spoiler data. API error occurred.');
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
    
    // Poll every 15 seconds for updates
    const interval = setInterval(fetchSpoilerData, 15000);
    
    return () => clearInterval(interval);
  }, [channelId]);

  if (loading) {
    return <p style={{ fontSize: '12px', color: '#999' }}>Loading hints...</p>;
  }

  if (error) {
    return <p style={{ fontSize: '12px', color: '#ff6b6b' }}>{error}</p>;
  }

  if (!spoilerData) {
    return (
      <div style={{ fontSize: '10px', opacity: 0.7 }}>
        <p>No spoiler log uploaded yet. Broadcaster should upload via the broadcaster site.</p>
      </div>
    );
  }

  return (
    <>
      <HintCarousel spoilerData={spoilerData} className="carousel-container" />
      {lastFetch && (
        <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '10px' }}>
          <p>Last updated: {new Date(lastFetch).toLocaleTimeString()}</p>
        </div>
      )}
    </>
  );
}

export default ProcessHints;