import { useState, useEffect, useCallback, useRef } from 'react';
import { HintCarousel } from './HintCarousel';
import type { SpoilerLog } from '@hint-viewer/shared';
import { useGame } from '../contexts/GameContext';

interface ProcessHintsProps {
  channelId: string | undefined;
}

const API_URL = import.meta.env.VITE_API_URL || 'https://dulrvobi1xht4.cloudfront.net';

function ProcessHints({ channelId }: ProcessHintsProps) {
  const [spoilerData, setSpoilerData] = useState<SpoilerLog | null>(null);
  const { game, setGame, games }= useGame();
  const [revealedHints, setRevealedHints] = useState<Set<string>>(new Set());
  const [completedHints, setCompletedHints] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<string | null>(null);
  const [lastPolled, setLastPolled] = useState<Date | null>(null);
  const [canRefresh, setCanRefresh] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAll = useCallback(async () => {
    if (!channelId) return;
    try {
      const response = await fetch(`${API_URL}/api/state/${channelId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch spoiler data. API error occurred.');
      }

      const body = (await response.json()) as unknown;
      const obj = typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {};

      const gameId = (obj['game'] ?? null) as string | null;
      
      // Update the current game context if the loaded gameId differs
      if (gameId && gameId !== game.id) {
        const found = games.find(g => g.id === gameId);
        if (found) setGame(found);
      }

      const spoiler = (obj['spoilerData'] ?? null) as SpoilerLog | null;
      const uploadedAt = (obj['uploadedAt'] ?? null) as string | null;
      const revealed = Array.isArray(obj['revealed']) ? (obj['revealed'] as string[]) : [];
      const completed = Array.isArray(obj['completed']) ? (obj['completed'] as string[]) : [];

      setSpoilerData(spoiler);
      setLastFetch(uploadedAt);
      setRevealedHints(new Set(revealed));
      setCompletedHints(new Set(completed));
      setLoading(false);
      setError(null);
    } catch (err) {
      setError('Failed to load spoiler data');
      setLoading(false);
      console.error('Fetch error:', err);
    }

    setLastPolled(new Date());
  }, [channelId]);

  const restartInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(fetchAll, 60000);
  }, [fetchAll]);

  useEffect(() => {
    if (!channelId) {
      setLoading(false);
      return;
    }
    fetchAll();
    restartInterval();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [channelId, fetchAll, restartInterval]);

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

  let hints: Record<string, string> | null = null;
  if (spoilerData && game) {
    const result = game.fromServerPayload(spoilerData);
    hints = result.hints;
  }

  return (
    <>
      {channelId && hints && (
        <HintCarousel
          hints={hints}
          className="carousel-container"
          revealedHints={revealedHints}
          completedHints={completedHints}
        />
      )}
      {lastPolled && (
        <div className="refresh-bar">
          {lastFetch && <span>Uploaded: {new Date(lastFetch).toLocaleTimeString()}</span>}
          <span>
            Last Updated: {lastPolled.toLocaleTimeString()}{' '}
            <button
              className="refresh-btn"
              disabled={!canRefresh}
              onClick={() => {
                setCanRefresh(false);
                void fetchAll();
                restartInterval();
                setTimeout(() => setCanRefresh(true), 10000);
              }}
            >
              ↻
            </button>
          </span>
        </div>
      )}
    </>
  );
}

export default ProcessHints;