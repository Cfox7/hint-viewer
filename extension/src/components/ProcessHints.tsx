import { useState, useEffect, useCallback, useRef } from 'react';
import { FaSearch, FaStore, FaCog } from 'react-icons/fa';
import { HintCarousel } from './HintCarousel';
import type { SpoilerLog } from '@hint-viewer/shared';
import type { ShopTrackerKongState, ShopTrackerItemState } from '@hint-viewer/shared/shop-tracker-types';
import type { SeedSettingsData } from '@hint-viewer/shared/seed-settings-types';
import { ShopTrackerOffcanvas } from './ShopTrackerOffcanvas';
import { SeedSettingsOffcanvas } from './SeedSettingsOffcanvas';
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
  const [hintedItems, setHintedItems] = useState<Record<string, string>>({});
  const [kongState, setKongState] = useState<ShopTrackerKongState>({});
  const [itemState, setItemState] = useState<ShopTrackerItemState>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<string | null>(null);
  const [lastPolled, setLastPolled] = useState<Date | null>(null);
  const [canRefresh, setCanRefresh] = useState(true);
  const [seedSettings, setSeedSettings] = useState<SeedSettingsData>({});
  const [showLevelNav, setShowLevelNav] = useState(false);
  const [showShopTracker, setShowShopTracker] = useState(false);
  const [showSeedSettings, setShowSeedSettings] = useState(false);
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
      const hinted = typeof obj['hinted'] === 'object' && obj['hinted'] !== null ? (obj['hinted'] as Record<string, string>) : {};

      setSpoilerData(spoiler);
      setLastFetch(uploadedAt);
      setRevealedHints(new Set(revealed));
      setCompletedHints(new Set(completed));
      setHintedItems(hinted);

      const tracker = obj['shopTracker'] as { kongs?: Record<string, number>; items?: Record<string, string> } | undefined;
      if (tracker) {
        setKongState((tracker.kongs ?? {}) as ShopTrackerKongState);
        setItemState(tracker.items ?? {});
      }

      const settings = (obj['seedSettings'] ?? {}) as SeedSettingsData;
      setSeedSettings(settings);

      setLoading(false);
      setError(null);
    } catch (err) {
      setError('Failed to load spoiler data');
      setLoading(false);
      console.error('Fetch error:', err);
    }

    setLastPolled(new Date());
  }, [channelId, game.id, games, setGame]);

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
          <h2 className="theme-gradient-text" style={{ fontSize: '2rem', marginBottom: '8px' }}>
            No spoiler log uploaded
          </h2>
          <p className="no-spoiler-message">
            Broadcaster should upload the spoiler log via the broadcaster site to populate hints here.
          </p>
          <button
            className="no-spoiler-refresh-btn"
            disabled={!canRefresh}
            onClick={() => {
              setCanRefresh(false);
              void fetchAll();
              restartInterval();
              setTimeout(() => setCanRefresh(true), 10000);
            }}
          >
            ↻ Refresh
          </button>
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
          hintedItems={hintedItems}
          showLevelNav={showLevelNav}
          onHideLevelNav={() => setShowLevelNav(false)}
        />
      )}
      {game.id === 'dk64' && (
        <ShopTrackerOffcanvas
          show={showShopTracker}
          onHide={() => setShowShopTracker(false)}
          kongState={kongState}
          itemState={itemState}
        />
      )}
      {Object.keys(seedSettings).length > 0 && (
        <SeedSettingsOffcanvas
          show={showSeedSettings}
          onHide={() => setShowSeedSettings(false)}
          seedSettings={seedSettings}
        />
      )}
      {lastPolled && (
        <div className="refresh-bar">
          {lastFetch && <span className="refresh-uploaded">Uploaded: {new Date(lastFetch).toLocaleTimeString()}</span>}
          <div className="refresh-bar-nav">
            <button className="level-nav-toggle" onClick={() => setShowLevelNav(true)}><FaSearch /> Level Nav</button>
            {game.id === 'dk64' && (
              <button className="shop-tracker-toggle" onClick={() => setShowShopTracker(true)}><FaStore /> Shop Tracker</button>
            )}
            {Object.keys(seedSettings).length > 0 && (
              <button className="seed-settings-toggle" onClick={() => setShowSeedSettings(true)}><FaCog /> Seed Settings</button>
            )}
          </div>
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