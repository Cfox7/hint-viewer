import React, { useState, useRef, useEffect } from 'react';
import { Modal, Spinner, Button } from 'react-bootstrap';
import type { SpoilerLog } from '../types';
import { HintCarousel } from './HintCarousel';
import { uploadSpoiler, deleteSpoiler, deleteHints, postRevealedHints } from '../api/spoilerApi';
import { normalizeSpoiler } from '../utils/normalizeSpoiler';

interface UploadProps { channelId: string; }

function Upload({ channelId }: UploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedAt, setUploadedAt] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [spoilerData, setSpoilerData] = useState<SpoilerLog | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [revealedHints, setRevealedHints] = useState<Set<string>>(new Set());

  // keep a ref to the latest revealedHints for reliable POST payloads
  const revealedRef = useRef(revealedHints);
  useEffect(() => {
    revealedRef.current = revealedHints;
  }, [revealedHints]);

  // debounce timer for syncing reveals to the server
  const syncTimerRef = useRef<number | null>(null);

  const syncRevealedHints = () => {
    postRevealedHints(channelId, Array.from(revealedRef.current)).catch((err) =>
      console.error('Sync reveal error:', err),
    );
  };

  const scheduleSync = (delay = 250) => {
    if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current);
    syncTimerRef.current = window.setTimeout(() => {
      syncRevealedHints();
      syncTimerRef.current = null;
    }, delay);
  };

  // clear timer on unmount
  useEffect(() => {
    return () => {
      if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current);
    };
  }, []);

  const deleteResources = (channel: string) =>
    Promise.all([deleteSpoiler(channel), deleteHints(channel)]);

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

      setSuccess(true);
      setUploadedAt(result.uploadedAt);
      setSpoilerData(json);
      setRevealedHints(new Set());
      // immediate sync of empty reveals so server state is clean
      if (syncTimerRef.current) {
        window.clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }
      syncRevealedHints();
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
      const [spoilerResp] = await deleteResources(channelId);
      if (!spoilerResp.ok) throw new Error('Failed to clear spoiler log');

      setSuccess(false);
      setFile(null);
      setUploadedAt(null);
      setError(null);
      setSpoilerData(null);
      setRevealedHints(new Set());
      if (fileInputRef.current) fileInputRef.current.value = '';
      // immediately sync cleared state to server
      if (syncTimerRef.current) {
        window.clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }
      syncRevealedHints();
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
    // schedule a debounced sync so rapid toggles batch into one POST
    scheduleSync();
  };

  return (
    <>
      <Modal show={uploading} centered backdrop="static" keyboard={false} contentClassName="upload-modal-content">
        <Modal.Body className="upload-modal-body text-center py-4">
          <Spinner animation="border" role="status" className="mb-3 upload-modal-spinner">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <div>Uploading spoiler log...</div>
        </Modal.Body>
      </Modal>

      <Modal show={showClearModal} onHide={() => setShowClearModal(false)} centered contentClassName="clear-modal-content">
        <Modal.Header closeButton className="clear-modal-header">
          <Modal.Title>Clear Spoiler Log</Modal.Title>
        </Modal.Header>
        <Modal.Body className="clear-modal-body">
          Are you sure you want to clear the current spoiler log? Viewers will no longer see hints.
        </Modal.Body>
        <Modal.Footer className="clear-modal-footer">
          <Button variant="secondary" onClick={() => setShowClearModal(false)} className="clear-modal-cancel">
            Cancel
          </Button>
          <Button variant="danger" onClick={handleClear} disabled={clearing} className="clear-modal-confirm">
            {clearing ? 'Clearing...' : 'Clear Log'}
          </Button>
        </Modal.Footer>
      </Modal>

      {spoilerData && (
        <div className="card">
          <div className="hints-preview">
            <HintCarousel
              spoilerData={spoilerData}
              className="carousel-container"
              channelId={channelId}
              revealedHints={revealedHints}
              onToggleHint={handleToggleHint}
            />
          </div>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="fileUpload">Spoiler Log:</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
            <input
              id="fileUpload"
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleUpload}
              disabled={uploading}
              style={{ display: 'none' }}
            />

            <button
              type="button"
              className="twitch-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              Choose file
            </button>

            <span className="file-chosen" style={{ color: '#dee2e6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {file ? file.name : 'No file chosen'}
            </span>
          </div>

          {success && (
            <button
              onClick={() => setShowClearModal(true)}
              disabled={clearing}
              className="clear-btn"
              style={{ marginLeft: 8 }}
            >
              Clear Spoiler Log
            </button>
          )}
        </div>
      </div>

      {success && (
        <div className="message success">
          Successfully uploaded! Viewers can now see hints.
          {uploadedAt && <div className="timestamp">Uploaded at: {new Date(uploadedAt).toLocaleString()}</div>}
        </div>
      )}

      {error && <div className="message error">{error}</div>}
    </>
  );
}

export default Upload;
