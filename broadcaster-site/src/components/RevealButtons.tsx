import { Button } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useGame } from '../contexts/GameContext';

interface Props {
  levels: string[];
  levelDisplayNames: Record<string, string>;
  groupedHints: Record<string, string[]>;
  revealedHints: Set<string>;
  onToggleReveal: (location: string) => void;
  onBulkToggle: (locations: string[], reveal: boolean) => void;
  selectedLevelIndex?: number;
}

export default function RevealButtons({
  levels,
  levelDisplayNames,
  groupedHints,
  revealedHints,
  onBulkToggle,
  selectedLevelIndex
}: Props) {
  const { game } = useGame();
  const selectedLevel = selectedLevelIndex != null ? levels[selectedLevelIndex] : undefined;
  const selectedLevelLocations = selectedLevel ? groupedHints[selectedLevel] || [] : [];

  const disableLevelButton =
    selectedLevelIndex == null ||
    ['foolish', 'woth'].includes(game.getLevelCategory(selectedLevel || ''));

  const isLevelRevealed =
    selectedLevelLocations.length > 0 && selectedLevelLocations.every((loc) => revealedHints.has(loc));

  const allLocations = Object.values(groupedHints).flat();
  const isAllRevealed = allLocations.length > 0 && allLocations.every((loc) => revealedHints.has(loc));

  const handleRevealLevel = () => {
    if (selectedLevelIndex == null) return;
    const lvl = levels[selectedLevelIndex];
    const levelLocations = groupedHints[lvl] || [];
    const hasUnrevealed = levelLocations.some((loc) => !revealedHints.has(loc));

    // use bulk handler so linked hints are expanded using the current revealedHints snapshot
    if (hasUnrevealed) {
      onBulkToggle(levelLocations, true);
    } else {
      onBulkToggle(levelLocations, false);
    }
  };

  const handleRevealAll = () => {
    if (isAllRevealed) {
      onBulkToggle(allLocations, false);
    } else {
      onBulkToggle(allLocations, true);
    }
  };

  const levelName = selectedLevelIndex != null
    ? (levelDisplayNames[levels[selectedLevelIndex]] || levels[selectedLevelIndex])
    : null;

  const levelButtonLabel = levelName
    ? (isLevelRevealed ? `Hide Area (${levelName})` : `Reveal Area (${levelName})`)
    : 'Reveal Area';

  return (
    <div className="reveal-buttons">
      <Button
        onClick={handleRevealLevel}
        disabled={disableLevelButton}
        aria-label={isLevelRevealed ? 'Hide current area' : 'Reveal current area'}
        className="reveal-btn reveal-btn-area"
      >
        {isLevelRevealed ? <FaEyeSlash className="reveal-btn-icon" /> : <FaEye className="reveal-btn-icon" />}
        {levelButtonLabel}
      </Button>

      <Button
        onClick={handleRevealAll}
        aria-label={isAllRevealed ? 'Hide all areas' : 'Reveal all areas'}
        className="reveal-btn reveal-btn-all"
      >
        {isAllRevealed ? <FaEyeSlash className="reveal-btn-icon" /> : <FaEye className="reveal-btn-icon" />}
        {isAllRevealed ? 'Hide All' : 'Reveal All'}
      </Button>
    </div>
  );
}