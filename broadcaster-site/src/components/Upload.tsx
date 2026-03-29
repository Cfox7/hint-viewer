import { useEffect } from 'react';
import { HintCarousel } from './HintCarousel';
import { useUpload } from '../hooks/useUpload';
import { UploadModals } from './UploadModals';
import { buildSlides } from '../utils/buildSlides';
import { useNav } from '../contexts/NavContext';

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
    clearing,
    spoilerData,
    revealedHints,
    showClearModal,
    setShowClearModal,
    handleUpload,
    handleClear,
    handleToggleHint,
  } = useUpload(channelId);

  const { slides, activeIndex, setActiveIndex, setSlides } = useNav();

  // Sync slides into nav context whenever spoilerData changes
  useEffect(() => {
    const { slides: newSlides } = spoilerData ? buildSlides(spoilerData) : { slides: [] };
    setSlides(newSlides);
    setActiveIndex(0);
  }, [spoilerData]);

  return (
    <>
      <UploadModals
        uploading={uploading}
        showClearModal={showClearModal}
        setShowClearModal={setShowClearModal}
        clearing={clearing}
        onClear={handleClear}
      />

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
              spoilerData={spoilerData}
              className="carousel-container"
              channelId={channelId}
              revealedHints={revealedHints}
              onToggleHint={handleToggleHint}
              activeIndex={activeIndex}
              onSelect={setActiveIndex}
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
