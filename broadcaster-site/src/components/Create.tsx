import { useEffect, useState } from 'react';
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
    } finally {
      setClearing(false);
    }
  };

  return (
    <>
      <ClearModal
        show={showClearModal}
        loading={clearing}
        onCancel={() => setShowClearModal(false)}
        onConfirm={handleClear}
      />
      {initialLoading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : slides.length > 0 && (
        <div className="card">
          <div className="d-flex justify-content-between p-2 align-items-center gap-2">
            <div>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => setShowClearModal(true)}
                disabled={isEditing}
                style={{ minWidth: 60 }}
              >
                Clear
              </button>
            </div>
            <div>
              <button
                className="btn btn-success btn-sm"
                onClick={handleEditToggle}
                aria-pressed={isEditing}
                style={{ minWidth: 60 }}
              >
                {isEditing ? 'Done' : 'Edit'}
              </button>
            </div>
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
            />
          </div>
        </div>
      )}
    </>
  );
}

export default Create;
