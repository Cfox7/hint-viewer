import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import { useEffect, useState } from 'react';
import { FaUpload, FaCog } from 'react-icons/fa';
import { HintListView } from './HintListView';
import { useUpload } from '../hooks/useUpload';
import { UploadModals } from './UploadModals';
import { SeedSettingsOffcanvas } from './seed-settings/SeedSettingsOffcanvas';
import { useGame } from '../contexts/GameContext';

interface UploadProps { channelId: string; }

function Upload({ channelId }: UploadProps) {
  const {
    fileInputRef,
    file,
    uploading,
    initialLoading,
    success,
    error,
    clearError,
    uploadedAt,
    spoilerData,
    revealedHints,
    completedHints,
    hintedItems,
    extractedSettings,
    handleUpload,
    handleToggleReveal,
    handleToggleComplete,
    handleHintedItemChange,
  } = useUpload(channelId);

  const { game } = useGame();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showSeedSettings, setShowSeedSettings] = useState(false);
  const [showSettingsSavedToast, setShowSettingsSavedToast] = useState(false);

  useEffect(() => {
    if (success && file) setShowSuccess(true);
    else setShowSuccess(false);
  }, [success, file]);

  return (
    <>
      <UploadModals uploading={uploading} />

      {/* Header */}
      <div className="upload-header d-flex align-items-center gap-3 mb-3 p-3" style={{ background: '#cce4fa', borderRadius: 8 }}>
        <FaUpload size={36} style={{ color: '#007bff' }} />
        <div>
          <h2 className="mb-1" style={{ color: '#007bff', fontWeight: 700 }}>Upload Spoiler Log</h2>
          <div style={{ fontSize: '1rem', color: '#222' }}>
            Upload your spoiler log to instantly populate all hints. You can then reveal/complete them as you go for you viewers. No manual entry required!
          </div>
        </div>
      </div>

      {/* Upload */}
      <div className="form-group mb-4">
        <div className="file-input-row d-flex justify-content-between align-items-center">
          <div className="file-input-inner">
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
              className="twitch-btn btn btn-primary d-flex align-items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{ fontWeight: 600 }}
            >
              <FaUpload /> Choose file
            </button>

            <span
              className="file-chosen"
              style={{ color: '#007bff', fontWeight: 500 }}
              title={uploadedAt ? `Uploaded at: ${new Date(uploadedAt).toLocaleString()}` : undefined}
            >
              {file ? file.name : success ? 'Spoiler loaded' : 'No file chosen'}
            </span>
          </div>
          <div className="d-flex gap-2">
            {game.availableSettings && success && (
              <button
                type="button"
                className="twitch-btn btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                onClick={() => setShowSeedSettings(true)}
              >
                <FaCog /> Seed Settings
              </button>
            )}
          </div>
        </div>

        <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 9999, position: 'fixed', bottom: 0, right: 0 }}>
          <Toast
            show={success && showSuccess}
            onClose={() => setShowSuccess(false)}
            style={{ backgroundColor: '#1b6b2d' }}
            autohide
            delay={7000}
            animation
          >
            <Toast.Header closeButton>
              <strong className="me-auto">Successfully uploaded!</strong>
            </Toast.Header>
            <Toast.Body className="text-white">
              Viewers can now see hints.
            </Toast.Body>
          </Toast>
          <Toast
            show={!!error}
            onClose={clearError}
            style={{ backgroundColor: '#8b1a1a' }}
            autohide
            delay={7000}
            animation
          >
            <Toast.Header closeButton>
              <strong className="me-auto">Upload Error</strong>
            </Toast.Header>
            <Toast.Body className="text-white">
              {error}
            </Toast.Body>
          </Toast>
          <Toast show={showSettingsSavedToast} onClose={() => setShowSettingsSavedToast(false)} style={{ backgroundColor: '#218838' }} autohide delay={7000} animation>
            <Toast.Header closeButton>
              <strong className="me-auto">Settings saved!</strong>
            </Toast.Header>
            <Toast.Body className="text-white">
              Viewers can now see your seed settings.
            </Toast.Body>
          </Toast>
        </ToastContainer>

      </div>

      {initialLoading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : spoilerData && Object.keys(spoilerData.hints).length > 0 && (
        <HintListView
          hints={spoilerData.hints}
          revealedHints={revealedHints}
          completedHints={completedHints}
          hintedItems={hintedItems}
          onToggleReveal={handleToggleReveal}
          onToggleComplete={handleToggleComplete}
          onHintedItemChange={handleHintedItemChange}
          showRevealButtons
        />
      )}

      {game.availableSettings && (
        <SeedSettingsOffcanvas
          show={showSeedSettings}
          onHide={() => setShowSeedSettings(false)}
          onSaveSuccess={() => setShowSettingsSavedToast(true)}
          channelId={channelId}
          extractedSettings={extractedSettings}
        />
      )}
    </>
  );
}

export default Upload;
