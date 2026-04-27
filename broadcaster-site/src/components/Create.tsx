import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';
import { useEffect, useState } from 'react';
import { FaTrash, FaEdit, FaSave, FaTasks } from 'react-icons/fa';
import { HintCarousel } from './HintCarousel';
import { buildSlides } from '@hint-viewer/shared/buildSlides';
import { useNav } from '../contexts/NavContext';
import { useGame } from '../contexts/GameContext';
import { useManual } from '../hooks/useManual';
import { ClearModal } from './ClearModal';

interface CreateProps { channelId: string; }

function Create({ channelId }: CreateProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editHints, setEditHints] = useState<Record<string, string> | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showClearedToast, setShowClearedToast] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const {
    initialLoading,
    hints,
    revealedHints,
    completedHints,
    setHints,
    handleToggleReveal,
    handleToggleComplete,
    clearAll,
    saveSpoiler,
  } = useManual(channelId);

  const { slides, activeIndex, setActiveIndex, setSlides } = useNav();
  const { game } = useGame();

  // Sync slides into nav context whenever hints or editHints change
  useEffect(() => {
    const sourceHints = isEditing && editHints ? editHints : hints;
    const { slides: newSlides } = sourceHints && Object.keys(sourceHints).length > 0
      ? buildSlides(sourceHints, game.levelOrder, game.sortHints, 5, 5, 5)
      : { slides: [] };
    setSlides(newSlides);
  }, [hints, editHints, isEditing]);

  const handleEditToggle = () => {
    if (!isEditing) {
      // Entering edit mode: make a copy of current hints
      setEditHints({ ...hints });
      setIsEditing(true);
    } else {
      if (editHints) {
        const newHints = { ...editHints };
        const existingFoolish = Object.keys(newHints).filter((k) => k.startsWith('Foolish'));
        let foolishCount = existingFoolish.length + 1;
        const existingWoth = Object.keys(newHints).filter((k) => k.startsWith('WOTH'));
        let wothCount = existingWoth.length + 1;

        Object.entries(editHints).forEach(([, value]) => {
          if (value) {
            const hint = value.toLowerCase();
            // Foolish
            if (hint.includes('foolish')) {
              const alreadyGrouped = Object.entries(newHints).some(
                ([k, v]) => k.startsWith('Foolish') && v === value
              );
              if (!alreadyGrouped) {
                let nextKey = `Foolish ${foolishCount}`;
                while (nextKey in newHints) {
                  foolishCount++;
                  nextKey = `Foolish ${foolishCount}`;
                }
                newHints[nextKey] = value;
                foolishCount++;
              }
            }
            // WOTH
            if (hint.includes('way of the hoard') || hint.includes('woth')) {
              const alreadyGrouped = Object.entries(newHints).some(
                ([k, v]) => k.startsWith('WOTH') && v === value
              );
              if (!alreadyGrouped) {
                let nextKey = `WOTH ${wothCount}`;
                while (nextKey in newHints) {
                  wothCount++;
                  nextKey = `WOTH ${wothCount}`;
                }
                newHints[nextKey] = value;
                wothCount++;
              }
            }
          }
        });

        // Remove grouped keys if their value is no longer present in any non-grouped hint
        const nonGroupedValues = new Set(
          Object.entries(newHints)
            .filter(([k]) => !k.startsWith('Foolish') && !k.startsWith('WOTH'))
            .map(([, v]) => v)
        );
        Object.keys(newHints).forEach((key) => {
          if ((key.startsWith('Foolish') || key.startsWith('WOTH')) && !nonGroupedValues.has(newHints[key])) {
            delete newHints[key];
          }
        });

        // Unreveal any hints that are now empty but were previously revealed
        Object.keys(newHints).forEach((key) => {
          if (
            revealedHints.has(key) &&
            newHints[key].trim() === ''
          ) {
            handleToggleReveal(key);
          }
        });
        setHints(newHints); // update hints (and hintsRef)

        // Reveal changed, non-empty hints
        const changedKeys = Object.keys(newHints).filter(
          (key) => newHints[key] !== hints[key] && newHints[key].trim() !== ''
        );
        if (changedKeys.length > 0) {
          changedKeys.forEach((key) => {
            if (!revealedHints.has(key)) handleToggleReveal(key);
          });
          setShowSavedToast(true);
        }

        saveSpoiler();
      }
      setEditHints(null);
      setIsEditing(false);
    }
  };

  const handleEditHint = (location: string, value: string) => {
    setEditHints((prev) => prev ? { ...prev, [location]: value } : { [location]: value });
  };

  const handleClear = async () => {
    setClearing(true);
    try {
      await clearAll();
      setShowClearModal(false);
      setShowClearedToast(true);
      setActiveIndex(0);
    } finally {
      setClearing(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="upload-header d-flex align-items-center gap-3 mb-3 p-3" style={{ background: '#cce4fa', borderRadius: 8 }}>
        <FaTasks size={60} style={{ color: '#007bff' }} />
        <div>
          <h2 className="mb-1" style={{ color: '#007bff', fontWeight: 700 }}>Create Your Hints</h2>
          <div style={{ fontSize: '1rem', color: '#222' }}>
            Manually enter or edit hints for your seed. Use this page to create custom hint sets, no file upload required! Then mark them as complete as you go for your viewers.
          </div>
        </div>
      </div>

      <ClearModal
        show={showClearModal}
        loading={clearing}
        onCancel={() => setShowClearModal(false)}
        onConfirm={handleClear}
      />

      <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 9999, position: 'fixed', bottom: 0, right: 0 }}>
        <Toast show={showClearedToast} onClose={() => setShowClearedToast(false)} style={{ backgroundColor: '#218838' }} autohide delay={7000} animation>
          <Toast.Header closeButton>
            <strong className="me-auto">Hints successfully cleared</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            Fresh hint template in place.
          </Toast.Body>
        </Toast>
        <Toast show={showSavedToast} onClose={() => setShowSavedToast(false)} style={{ backgroundColor: '#218838' }} autohide delay={7000} animation>
          <Toast.Header closeButton>
            <strong className="me-auto">Hints successfully saved</strong>
          </Toast.Header>
          <Toast.Body className="text-white">
            Your new hints have been updated.
          </Toast.Body>
        </Toast>
      </ToastContainer>

      {initialLoading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : slides.length > 0 && (
        <div className="card">
          <div className="d-flex justify-content-end align-items-center gap-2 p-2">
            <button
              className="btn btn-danger btn-sm d-flex align-items-center gap-1"
              onClick={() => setShowClearModal(true)}
              disabled={isEditing}
              style={{ minWidth: 60 }}
            >
              <FaTrash /> Clear
            </button>
            <button
              className="btn btn-success btn-sm d-flex align-items-center gap-1"
              onClick={handleEditToggle}
              aria-pressed={isEditing}
              style={{ minWidth: 60 }}
            >
              {isEditing ? <FaSave /> : <FaEdit />} {isEditing ? 'Done' : 'Edit'}
            </button>
          </div>
          <div className="hints-preview">
            <HintCarousel
              hints={isEditing && editHints ? editHints : hints}
              className="carousel-container"
              channelId={channelId}
              revealedHints={revealedHints}
              completedHints={completedHints}
              onToggleReveal={handleToggleReveal}
              onToggleComplete={handleToggleComplete}
              activeIndex={activeIndex}
              onSelect={setActiveIndex}
              editable={isEditing}
              onEditHint={handleEditHint}
              showRevealButtons={false}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default Create;
