import { useState, useRef } from 'react';
import { Modal, Spinner, Button } from 'react-bootstrap';
import type { SpoilerLog } from '../types';
import { HintCarousel } from './HintCarousel';

interface UploadProps { channelId: string; }
const API_URL = 'https://hint-viewer-production.up.railway.app';

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

  const deleteResources = (channel: string) =>
    Promise.all([
      fetch(`${API_URL}/api/spoiler/${channel}`, { method: 'DELETE' }),
      fetch(`${API_URL}/api/hints/${channel}`, { method: 'DELETE' }),
    ]);

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
      const json: SpoilerLog = JSON.parse(text);

      if (json['Wrinkly Hints']) {
        Object.keys(json['Wrinkly Hints']).forEach((key) => {
          if (key.startsWith('First')) delete json['Wrinkly Hints'][key];
        });
      }

      const response = await fetch(`${API_URL}/api/spoiler/${channelId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      setSuccess(true);
      setUploadedAt(result.uploadedAt);
      setSpoilerData(json);
      setRevealedHints(new Set());
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
      // fire-and-forget sync
      fetch(`${API_URL}/api/hints/reveal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId, revealedHints: Array.from(newSet) }),
      }).catch((err) => console.error('Sync reveal error:', err));
      return newSet;
    });
  };

  return (
    <>
      <Modal
        show={uploading}
        centered
        backdrop="static"
        keyboard={false}
        contentClassName="upload-modal-content"
      >
        <Modal.Body className="upload-modal-body text-center py-4">
          <Spinner animation="border" role="status" variant="primary" className="mb-3 upload-modal-spinner">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <div>Uploading spoiler log...</div>
        </Modal.Body>
      </Modal>

      <Modal
        show={showClearModal}
        onHide={() => setShowClearModal(false)}
        centered
        contentClassName="clear-modal-content"
      >
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
          {/* left side: choose button + filename (takes remaining space) */}
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

            <span className="file-chosen">
              {file ? file.name : 'No file chosen'}
            </span>
          </div>

          {/* right side: clear button (visible only when success) */}
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
