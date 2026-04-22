import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { SpoilerLog } from '../types';
import {
  uploadSpoiler,
  deleteSpoiler,
  deleteHints,
  getState,
  postState,
} from '../api/spoilerApi';
import { useGame } from '../contexts/GameContext';

interface UseUploadReturn {
  fileInputRef: RefObject<HTMLInputElement | null>;
  file: File | null;
  uploading: boolean;
  initialLoading: boolean;
  success: boolean;
  error: string | null;
  uploadedAt: string | null;
  clearing: boolean;
  spoilerData: SpoilerLog | null;
  revealedHints: Set<string>;
  completedHints: Set<string>;
  showClearModal: boolean;
  setShowClearModal: (v: boolean) => void;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleClear: () => Promise<void>;
  handleToggleHint: (location: string) => void;
  handleToggleComplete: (location: string) => void;
}

export function useUpload(channelId: string | undefined): UseUploadReturn {
  const { game } = useGame();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedAt, setUploadedAt] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [spoilerData, setSpoilerData] = useState<SpoilerLog | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [revealedHints, setRevealedHints] = useState<Set<string>>(new Set());
  const [completedHints, setCompletedHints] = useState<Set<string>>(new Set());

  const revealedRef = useRef(revealedHints);
  useEffect(() => {
    revealedRef.current = revealedHints;
  }, [revealedHints]);

  const completedRef = useRef(completedHints);
  useEffect(() => {
    completedRef.current = completedHints;
  }, [completedHints]);

  const syncTimerRef = useRef<number | null>(null);
  const scheduleSync = (delayMs = 250) => {
    if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current);
    syncTimerRef.current = window.setTimeout(() => {
      postState(channelId!, Array.from(revealedRef.current), Array.from(completedRef.current)).catch((err) =>
        console.error('Sync state error:', err),
      );
      syncTimerRef.current = null;
    }, delayMs);
  };
  useEffect(() => () => { if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current); }, []);

  // load from server on mount / channel change
  useEffect(() => {
    if (!channelId) return;
    let mounted = true;
    (async () => {
      try {
        const data = await getState(channelId);
        if (!mounted || !data) return;
        if (data.spoilerData) {
          const raw = data.spoilerData as Record<string, unknown>;
          const normalized = game.fromServerPayload(raw);
          setSpoilerData(normalized);
          setUploadedAt(data.uploadedAt ?? null);
          setSuccess(true);
          setRevealedHints(new Set(data.revealed ?? []));
          setCompletedHints(new Set(data.completed ?? []));
        }
      } catch (err) {
        console.warn('Failed to fetch persisted spoiler from server', err);
      } finally {
        if (mounted) setInitialLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [channelId]);

  const deleteResources = (channel: string) => Promise.all([deleteSpoiler(channel), deleteHints(channel)]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !channelId) {
      setError('Please select a valid Spoiler Log');
      return;
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
    setFile(selectedFile);
    setError(null);
    setSuccess(false);
    setUploading(true);

    try {
      await deleteResources(channelId);

      const text = await selectedFile.text();
      const parsed = JSON.parse(text) as Record<string, unknown>;
      const normalized = game.normalize(parsed);
      const result = await uploadSpoiler(channelId, game.toServerPayload(normalized.hints));

      // authoritative read-back
      try {
        const server = await getState(channelId);
        if (server && server.spoilerData) {
          const raw = server.spoilerData as Record<string, unknown>;
          const serverNormalized = game.fromServerPayload(raw);
          setSpoilerData(serverNormalized);
          setUploadedAt(server.uploadedAt ?? result.uploadedAt ?? new Date().toISOString());
          setSuccess(true);
          setRevealedHints(new Set(server.revealed ?? []));
          setCompletedHints(new Set(server.completed ?? []));
        } else {
          setSpoilerData(normalized);
          setUploadedAt(result.uploadedAt ?? new Date().toISOString());
          setSuccess(true);
          setRevealedHints(new Set());
          setCompletedHints(new Set());
        }
      } catch {
        setSpoilerData(normalized);
        setUploadedAt(result.uploadedAt ?? new Date().toISOString());
        setSuccess(true);
        setRevealedHints(new Set());
        setCompletedHints(new Set());
      }

      if (syncTimerRef.current) { window.clearTimeout(syncTimerRef.current); syncTimerRef.current = null; }
      void postState(channelId, [], []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload spoiler log');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleClear = async () => {
    setShowClearModal(false);
    setClearing(true);
    setError(null);

    try {
      const [spoilerResp] = await deleteResources(channelId!);
      if (!spoilerResp.ok) throw new Error('Failed to clear spoiler log');

      setSuccess(false);
      setFile(null);
      setUploadedAt(null);
      setError(null);
      setSpoilerData(null);
      setRevealedHints(new Set());
      setCompletedHints(new Set());
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (syncTimerRef.current) { window.clearTimeout(syncTimerRef.current); syncTimerRef.current = null; }
      void postState(channelId!, [], []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear spoiler log');
      console.error('Clear error:', err);
    } finally {
      setClearing(false);
    }
  };

  const handleToggleHint = (location: string) => {
    setRevealedHints((prev) => {
      const newSet = new Set(prev);
      newSet.has(location) ? newSet.delete(location) : newSet.add(location);
      return newSet;
    });
    setCompletedHints((prev) => {
      if (!prev.has(location)) return prev;
      const newSet = new Set(prev);
      newSet.delete(location);
      return newSet;
    });
    scheduleSync();
  };

  const handleToggleComplete = (location: string) => {
    if (!revealedRef.current.has(location)) return;
    setCompletedHints((prev) => {
      const newSet = new Set(prev);
      newSet.has(location) ? newSet.delete(location) : newSet.add(location);
      return newSet;
    });
    scheduleSync();
  };

  return {
    fileInputRef,
    file,
    uploading,
    initialLoading,
    success,
    error,
    uploadedAt,
    clearing,
    spoilerData,
    revealedHints,
    completedHints,
    showClearModal,
    setShowClearModal,
    handleUpload,
    handleClear,
    handleToggleHint,
    handleToggleComplete,
  };
}