import { useState, useEffect } from 'react';
import { HintCarousel } from './HintCarousel';
import type { SpoilerLog } from '@hint-viewer/shared';

interface ProcessHintsProps {
  channelId: string | undefined;
}

const API_URL = 'https://hint-viewer-production.up.railway.app';

function ProcessHints({ channelId }: ProcessHintsProps) {
  const [spoilerData, setSpoilerData] = useState<SpoilerLog | null>(null);
  const [revealedHints, setRevealedHints] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<string | null>(null);

  useEffect(() => {
    if (!channelId) {
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      // Fetch spoiler data
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

        const body = (await response.json()) as unknown;
        const obj = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};

        const spoiler = (obj['spoilerData'] ?? obj['data'] ?? body) as SpoilerLog | null;
        const uploadedAt = (obj['uploadedAt'] ?? obj['uploaded_at'] ?? null) as string | null;
        setSpoilerData(spoiler);
        setLastFetch(uploadedAt);
         setLoading(false);
         setError(null);
       } catch (err) {
        setError('Failed to load spoiler data');
        setLoading(false);
        console.error('Fetch error:', err);
      }

      // Fetch revealed hints
      try {
        const res = await fetch(`${API_URL}/api/hints/${channelId}`);
        const hintsBody = (await res.json()) as unknown;
        const hintsObj = typeof hintsBody === 'object' && hintsBody !== null ? (hintsBody as Record<string, unknown>) : {};
        const arr =
          Array.isArray(hintsObj['revealed']) ? (hintsObj['revealed'] as string[]) :
          Array.isArray(hintsObj['revealedHints']) ? (hintsObj['revealedHints'] as string[]) :
          [];
         if (arr.length) {
           setRevealedHints(new Set(arr));
         }
      } catch {
        // Optionally handle error
      }
    };

    fetchAll();
    const interval = setInterval(fetchAll, 10000);
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
      <div className="no-spoiler-container">
        <div>
          <h2 className="gradient-jumpman" style={{ fontSize: '2rem', marginBottom: '8px' }}>
            No spoiler log uploaded
          </h2>
          <p className="no-spoiler-message">
            Broadcaster should upload the spoiler log via the broadcaster site to populate hints here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {channelId && (
        <HintCarousel
          spoilerData={spoilerData}
          className="carousel-container"
          revealedHints={revealedHints}
        />
      )}
      {lastFetch && (
        <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '10px' }}>
          <p>Last updated: {new Date(lastFetch).toLocaleTimeString()}</p>
        </div>
      )}
    </>
  );
}

export default ProcessHints;