import { useState, useRef } from 'react';
import { Modal, Spinner, Button } from 'react-bootstrap';
import type { SpoilerLog } from '../types';
import { HintCarousel } from './HintCarousel';

interface UploadProps {
  channelId: string;
}

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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !channelId) {
      setError('Please select a valid Spoiler Log');
      return;
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(false);
    setUploading(true);

    try {
      // Clear old spoiler log and revealed hints before uploading new log
      await fetch(`${API_URL}/api/spoiler/${channelId}`, { method: 'DELETE' });
      await fetch(`${API_URL}/api/hints/${channelId}`, { method: 'DELETE' });

      const text = await selectedFile.text();
      const json: SpoilerLog = JSON.parse(text);

      // Filter out First Hint from Wrinkly Hints before uploading
      if (json["Wrinkly Hints"]) {
        Object.keys(json["Wrinkly Hints"]).forEach(key => {
          if (key.startsWith("First")) {
            delete json["Wrinkly Hints"][key];
          }
        });
      }

      const response = await fetch(`${API_URL}/api/spoiler/${channelId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(json),
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

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
      // Delete spoiler log
      const response = await fetch(`${API_URL}/api/spoiler/${channelId}`, {
        method: 'DELETE',
      });

      // Delete revealed hints
      await fetch(`${API_URL}/api/hints/${channelId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to clear spoiler log');
      }

      setSuccess(false);
      setFile(null);
      setUploadedAt(null);
      setError(null);
      setSpoilerData(null);
      setRevealedHints(new Set());
      
      // Reset file input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear spoiler log');
      console.error('Clear error:', err);
    } finally {
      setClearing(false);
    }
  };

  const handleToggleHint = (location: string) => {
    setRevealedHints(prev => {
      const newSet = new Set(prev);
      if (newSet.has(location)) {
        newSet.delete(location);
      } else {
        newSet.add(location);
      }
      // Sync with backend
      fetch(`${API_URL}/api/hints/reveal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channelId, revealedHints: Array.from(newSet) })
      });
      return newSet;
    });
  };

  return (
    <>
      <Modal show={uploading} centered backdrop="static" keyboard={false}>
        <Modal.Body className="text-center py-4">
          <Spinner animation="border" role="status" variant="primary" className="mb-3">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <div>Uploading spoiler log...</div>
        </Modal.Body>
      </Modal>

      <Modal show={showClearModal} onHide={() => setShowClearModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Clear Spoiler Log</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to clear the current spoiler log? Viewers will no longer see hints.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClearModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleClear} disabled={clearing}>
            {clearing ? 'Clearing...' : 'Clear Log'}
          </Button>
        </Modal.Footer>
      </Modal>

      {spoilerData && (
        <div className="hints-preview">
          <HintCarousel
            spoilerData={spoilerData}
            className="carousel-container"
            channelId={channelId}
            revealedHints={revealedHints}
            onToggleHint={handleToggleHint}
          />
        </div>
      )}

      <div className="form-group">
        <label htmlFor="fileUpload">Spoiler Log:</label>
        <input
          id="fileUpload"
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleUpload}
          disabled={uploading}
        />
      </div>

      {success && (
        <div className="message success">
          Successfully uploaded! Viewers can now see hints.
          {uploadedAt && (
            <div className="timestamp">
              Uploaded at: {new Date(uploadedAt).toLocaleString()}
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="message error">
          {error}
        </div>
      )}

      {file && !uploading && (
        <div className="file-info">
          File: <strong>{file.name}</strong>
        </div>
      )}

      {success && (
        <button 
          onClick={() => setShowClearModal(true)} 
          disabled={clearing}
          className="clear-btn"
        >
          Clear Spoiler Log
        </button>
      )}
    </>
  );
}

export default Upload;
