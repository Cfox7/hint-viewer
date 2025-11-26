import { Button } from 'react-bootstrap';

interface Props {
  levels: string[];
  levelDisplayNames: Record<string, string>;
  groupedHints: Record<string, string[]>;
  revealedHints: Set<string>;
  onToggleHint: (location: string) => void;
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
  const selectedLevel = selectedLevelIndex != null ? levels[selectedLevelIndex] : undefined;
  const selectedLevelLocations = selectedLevel ? groupedHints[selectedLevel] || [] : [];

  // disable Reveal Level for Foolish and WOTH pages
  const disableLevelButton =
    selectedLevelIndex == null ||
    ['foolish', 'woth'].includes((selectedLevel || '').toLowerCase());

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

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          onClick={handleRevealLevel}
          disabled={disableLevelButton}
          aria-label={isLevelRevealed ? 'Hide current level' : 'Reveal current level'}
          className="reveal-btn"
          style={{ minWidth: 250 }}
        >
          {selectedLevelIndex != null
            ? (isLevelRevealed ? `Hide Level (${levelDisplayNames[levels[selectedLevelIndex]] || levels[selectedLevelIndex]})`
                               : `Reveal Level (${levelDisplayNames[levels[selectedLevelIndex]] || levels[selectedLevelIndex]})`)
            : 'Reveal Level'}
        </Button>

        <Button
          onClick={handleRevealAll}
          aria-label={isAllRevealed ? 'Hide all hints' : 'Reveal all hints'}
          className="reveal-btn"
          style={{ minWidth: 100 }}
        >
          {isAllRevealed ? 'Hide All' : 'Reveal All'}
        </Button>
      </div>
    </div>
  );
}