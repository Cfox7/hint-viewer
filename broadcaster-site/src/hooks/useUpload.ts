import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { SpoilerLog } from '../types';
import {
  uploadSpoiler,
  deleteSpoiler,
  deleteHints,
  postRevealedHints,
  getSpoiler,
} from '../api/spoilerApi';
import { normalizeSpoiler } from '../utils/normalizeSpoiler';

interface UseUploadReturn {
  fileInputRef: RefObject<HTMLInputElement | null>;
  file: File | null;
  uploading: boolean;
  success: boolean;
  error: string | null;
  uploadedAt: string | null;
  clearing: boolean;
  spoilerData: SpoilerLog | null;
  revealedHints: Set<string>;
  showClearModal: boolean;
  setShowClearModal: (v: boolean) => void;
  handleUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleClear: () => Promise<void>;
  handleToggleHint: (location: string) => void;
}

export function useUpload(channelId: string | undefined): UseUploadReturn {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedAt, setUploadedAt] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [spoilerData, setSpoilerData] = useState<SpoilerLog | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [revealedHints, setRevealedHints] = useState<Set<string>>(new Set());

  const revealedRef = useRef(revealedHints);
  useEffect(() => {
    revealedRef.current = revealedHints;
  }, [revealedHints]);

  const syncTimerRef = useRef<number | null>(null);
  const scheduleSync = (delayMs = 250) => {
    if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current);
    syncTimerRef.current = window.setTimeout(() => {
      postRevealedHints(channelId!, Array.from(revealedRef.current)).catch((err) =>
        console.error('Sync reveal error:', err),
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
        const data = await getSpoiler(channelId);
        if (!mounted || !data) return;
        if (data.spoilerData) {
          setSpoilerData(data.spoilerData);
          setUploadedAt(data.uploadedAt ?? null);
          setSuccess(Boolean(data.spoilerData));
          setRevealedHints(new Set(data.revealed ?? []));
        }
      } catch (err) {
        console.warn('Failed to fetch persisted spoiler from server', err);
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
      const parsed: SpoilerLog = JSON.parse(text);
      const json = normalizeSpoiler(parsed);
      const result = await uploadSpoiler(channelId, json);

      // authoritative read-back
      try {
        const server = await getSpoiler(channelId);
        if (server && server.spoilerData) {
          setSpoilerData(server.spoilerData);
          setUploadedAt(server.uploadedAt ?? result.uploadedAt ?? new Date().toISOString());
          setSuccess(true);
          setRevealedHints(new Set(server.revealed ?? []));
        } else {
          setSpoilerData(json);
          setUploadedAt(result.uploadedAt ?? new Date().toISOString());
          setSuccess(true);
          setRevealedHints(new Set());
        }
      } catch {
        setSpoilerData(json);
        setUploadedAt(result.uploadedAt ?? new Date().toISOString());
        setSuccess(true);
        setRevealedHints(new Set());
      }

      if (syncTimerRef.current) { window.clearTimeout(syncTimerRef.current); syncTimerRef.current = null; }
      postRevealedHints(channelId, []);
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
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (syncTimerRef.current) { window.clearTimeout(syncTimerRef.current); syncTimerRef.current = null; }
      postRevealedHints(channelId!, []);
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
    scheduleSync();
  };

  return {
    fileInputRef,
    file,
    uploading,
    success,
    error,
    uploadedAt,
    clearing,
    spoilerData,
    revealedHints,
    showClearModal,
    setShowClearModal,
    handleUpload,
    handleClear,
    handleToggleHint,
  };
}