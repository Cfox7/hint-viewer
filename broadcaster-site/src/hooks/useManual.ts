import { useState, useRef, useEffect } from 'react';
import { postState, getState, uploadSpoiler, deleteSpoiler, deleteHints } from '../api/spoilerApi';
import { useGame } from '../contexts/GameContext';

interface UseManualReturn {
  initialLoading: boolean;
  hints: Record<string, string>;
  revealedHints: Set<string>;
  completedHints: Set<string>;
  hintedItems: Record<string, string>;
  setHints: (hints: Record<string, string>) => void;
  handleToggleReveal: (key: string) => void;
  handleToggleComplete: (key: string) => void;
  handleHintedItemChange: (location: string, item: string) => void;
  clearAll: () => void;
  error: string | null;
  saveState: () => Promise<void>;
  saveSpoiler: () => Promise<void>;
}

export function useManual(channelId: string | undefined): UseManualReturn {
  const { game } = useGame();
  const [hints, setHints] = useState<Record<string, string>>({});
  const [revealedHints, setRevealedHints] = useState<Set<string>>(new Set());
  const [completedHints, setCompletedHints] = useState<Set<string>>(new Set());
  const [hintedItems, setHintedItems] = useState<Record<string, string>>({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs for up-to-date state in async/debounced handlers
  const hintsRef = useRef(hints);
  const revealedRef = useRef(revealedHints);
  const completedRef = useRef(completedHints);
  const hintedRef = useRef(hintedItems);
  useEffect(() => { hintsRef.current = hints; }, [hints]);
  useEffect(() => { revealedRef.current = revealedHints; }, [revealedHints]);
  useEffect(() => { completedRef.current = completedHints; }, [completedHints]);
  useEffect(() => { hintedRef.current = hintedItems; }, [hintedItems]);

  // Debounced sync to server (like useUpload)
  const syncTimerRef = useRef<number | null>(null);
  const scheduleSync = (delayMs = 250) => {
    if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current);
    syncTimerRef.current = window.setTimeout(() => {
      if (!channelId) return;
      setError(null);
      postState(
        channelId,
        Array.from(revealedRef.current),
        Array.from(completedRef.current),
        hintedRef.current,
      ).catch(() => setError('Failed to sync hints'));
      syncTimerRef.current = null;
    }, delayMs);
  };
  useEffect(() => () => { if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current); }, []);

  // Load from server on mount/channel change
  useEffect(() => {
    if (!channelId) return;
    let mounted = true;
    (async () => {
      setInitialLoading(true);
      try {
        const data = await getState(channelId);
        if (!mounted || !data) return;
        if (data.spoilerData) {
          const raw = data.spoilerData as Record<string, unknown>;
          const normalized = game.fromServerPayload(raw);
          setHints(normalized.hints || {});
          setRevealedHints(new Set(data.revealed ?? []));
          setCompletedHints(new Set(data.completed ?? []));
          setHintedItems(data.hinted ?? {});
        } else {
          setHints({});
          setRevealedHints(new Set());
          setCompletedHints(new Set());
          setHintedItems({});
        }
      } catch (err) {
        setError('Failed to load hints');
      } finally {
        if (mounted) setInitialLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [channelId]);



  const handleToggleReveal = (key: string) => {
    // Don't reveal if the hint is empty
    if (hintsRef.current[key].trim() === '') {
      return;
    }
    setRevealedHints((prev) => {
      const copy = new Set(prev);
      copy.has(key) ? copy.delete(key) : copy.add(key);
      return copy;
    });
    setCompletedHints((prev) => {
      if (!prev.has(key)) return prev;
      const copy = new Set(prev);
      copy.delete(key);
      return copy;
    });
    scheduleSync();
  };

  const handleToggleComplete = (key: string) => {
    if (!revealedRef.current.has(key)) return;
    setCompletedHints((prev) => {
      const copy = new Set(prev);
      copy.has(key) ? copy.delete(key) : copy.add(key);
      return copy;
    });
    scheduleSync();
  };


  const clearAll = async () => {
    const emptyTemplate = game.getEmptyHintTemplate();
    if (!channelId) {
      setHints(emptyTemplate);
      setRevealedHints(new Set());
      setCompletedHints(new Set());
      return;
    }
    try {
      await deleteSpoiler(channelId);
      await deleteHints(channelId);
      setHints(emptyTemplate);
      setRevealedHints(new Set());
      setCompletedHints(new Set());
      setHintedItems({});
      // Upload the empty template and reset state in backend
      await uploadSpoiler(channelId, game.id, game.toServerPayload(emptyTemplate));
      await postState(channelId, [], [], {});
    } catch (err) {
      setError('Failed to clear hints');
    }
  };


  // Save revealed/completed state
  const saveState = async () => {
    if (!channelId) return;
    try {
      setError(null);
      await postState(
        channelId,
        Array.from(revealedRef.current),
        Array.from(completedRef.current),
        hintedRef.current,
      );
    } catch (err) {
      setError('Failed to save state');
    }
  };

  // Save actual hint data (spoiler)
  const saveSpoiler = async () => {
    if (!channelId) return;
    try {
      setError(null);
      await uploadSpoiler(channelId, game.id, game.toServerPayload(hintsRef.current));
      await postState(
        channelId,
        Array.from(revealedRef.current),
        Array.from(completedRef.current),
        hintedRef.current,
      );
    } catch (err) {
      setError('Failed to save spoiler');
    }
  };

  const setHintsLocal = (newHints: Record<string, string>) => {
    setHints(newHints);
    hintsRef.current = newHints;
  };

  const handleHintedItemChange = (location: string, item: string) => {
    setHintedItems(prev => ({ ...prev, [location]: item }));
    scheduleSync();
  };

  return {
    hints,
    revealedHints,
    completedHints,
    hintedItems,
    setHints: setHintsLocal,
    handleToggleReveal,
    handleToggleComplete,
    handleHintedItemChange,
    clearAll,
    initialLoading,
    error,
    saveState,
    saveSpoiler,
  };
}