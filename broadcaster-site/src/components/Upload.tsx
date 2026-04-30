import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import { useEffect, useState } from 'react';
import { FaUpload } from 'react-icons/fa';
import { HintCarousel } from './HintCarousel';
import { useUpload } from '../hooks/useUpload';
import { UploadModals } from './UploadModals';
import { buildSlides } from '@hint-viewer/shared/buildSlides';
import { useNav } from '../contexts/NavContext';
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
    uploadedAt,
    spoilerData,
    revealedHints,
    completedHints,
    hintedItems,
    handleUpload,
    handleToggleReveal,
    handleToggleComplete,
    handleHintedItemChange,
  } = useUpload(channelId);

  const { slides, activeIndex, setActiveIndex, setSlides } = useNav();
  const { game } = useGame();
  const [showSuccess, setShowSuccess] = useState(false);

  // Sync slides into nav context whenever spoilerData changes
  useEffect(() => {
    const { slides: newSlides } = spoilerData ? buildSlides(spoilerData.hints, game.levelOrder, game.sortHints, 5, 5, 5) : { slides: [] };
    setSlides(newSlides);
    setActiveIndex(0);
  }, [spoilerData]);

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
            Upload your DK64 spoiler log to instantly populate all hints. You can then reveal/complete them as you go for you viewers. No manual entry required!
          </div>
        </div>
      </div>

      {/* Upload */}
      <div className="form-group mb-4">
        <div className="file-input-row">
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

            <span className="file-chosen" style={{ color: '#007bff', fontWeight: 500 }}>
              {file ? file.name : success ? 'Spoiler loaded' : 'No file chosen'}
            </span>
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
        </ToastContainer>

        {error && <div className="message error">{error}</div>}

        {success && uploadedAt && (
          <div className="timestamp mt-2" style={{ color: '#007bff', fontWeight: 500 }}>
            Uploaded at: {new Date(uploadedAt).toLocaleString()}
          </div>
        )}
      </div>

      {initialLoading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : spoilerData && slides.length > 0 && (
        <div className="card">
          <div className="hints-preview">
            <HintCarousel
              hints={spoilerData.hints}
              className="carousel-container"
              channelId={channelId}
              revealedHints={revealedHints}
              completedHints={completedHints}
              onToggleReveal={handleToggleReveal}
              onToggleComplete={handleToggleComplete}
              activeIndex={activeIndex}
              onSelect={setActiveIndex}
              hintedItems={hintedItems}
              onHintedItemChange={handleHintedItemChange}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default Upload;
