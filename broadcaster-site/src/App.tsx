import { useState } from 'react';
import type { SpoilerLog } from '@hint-viewer/shared';
import './App.css';

const API_URL = 'https://hint-viewer-production.up.railway.app'; // Replace with your Railway URL

function App() {
  const [channelId, setChannelId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedAt, setUploadedAt] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile || !channelId.trim()) {
      setError('Please enter a channel ID first');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(false);
    setUploading(true);

    try {
      const text = await selectedFile.text();
      const json: SpoilerLog = JSON.parse(text);
      
      const response = await fetch(`${API_URL}/api/spoiler/${channelId.trim()}`, {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload spoiler log');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1>🍌 DK64 Randomizer</h1>
        <h2>Broadcaster Upload</h2>
        
        <div className="form-group">
          <label htmlFor="channelId">Twitch Channel ID:</label>
          <input
            id="channelId"
            type="text"
            value={channelId}
            onChange={(e) => setChannelId(e.target.value)}
            placeholder="Enter your Twitch channel ID"
            disabled={uploading}
          />
          <small>Find your channel ID at <a href="https://www.streamweasels.com/tools/convert-twitch-username-to-user-id/" target="_blank" rel="noopener noreferrer">streamweasels.com</a></small>
        </div>

        <div className="form-group">
          <label htmlFor="fileUpload">Spoiler Log:</label>
          <input
            id="fileUpload"
            type="file"
            accept=".json"
            onChange={handleUpload}
            disabled={!channelId.trim() || uploading}
          />
        </div>

        {uploading && (
          <div className="message uploading">
            <span className="spinner">⏳</span> Uploading...
          </div>
        )}

        {success && (
          <div className="message success">
            ✓ Successfully uploaded! Viewers can now see hints.
            {uploadedAt && (
              <div className="timestamp">
                Uploaded at: {new Date(uploadedAt).toLocaleString()}
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="message error">
            ✗ {error}
          </div>
        )}

        {file && !uploading && (
          <div className="file-info">
            📄 File: <strong>{file.name}</strong>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
