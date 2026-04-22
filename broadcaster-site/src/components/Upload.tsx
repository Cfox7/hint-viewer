import { useEffect } from 'react';
import { HintCarousel } from './HintCarousel';
import { useUpload } from '../hooks/useUpload';
import { UploadModals } from './UploadModals';
import { buildSlides } from '../utils/buildSlides';
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
    handleUpload,
    handleToggleHint,
    handleToggleComplete,
  } = useUpload(channelId);

  const { slides, activeIndex, setActiveIndex, setSlides } = useNav();
  const { game } = useGame();

  // Sync slides into nav context whenever spoilerData changes
  useEffect(() => {
    const { slides: newSlides } = spoilerData ? buildSlides(spoilerData.hints, game.levelOrder) : { slides: [] };
    setSlides(newSlides);
    setActiveIndex(0);
  }, [spoilerData]);

  return (
    <>
      <UploadModals uploading={uploading} />

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
              onToggleHint={handleToggleHint}
              onToggleComplete={handleToggleComplete}
              activeIndex={activeIndex}
              onSelect={setActiveIndex}
            />
          </div>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="fileUpload">Spoiler Log:</label>
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
