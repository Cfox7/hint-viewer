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
    const allLocations = Object.values(groupedHints).flat();
    const hasUnrevealed = allLocations.some((loc) => !revealedHints.has(loc));

    if (hasUnrevealed) {
      onBulkToggle(allLocations, true);
    } else {
      onBulkToggle(allLocations, false);
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      {/* top row: Reveal Level / Reveal All (centered) */}
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
          aria-label="Reveal or hide all hints"
          className="reveal-btn"
        >
          Reveal All
        </Button>
      </div>
    </div>
  );
}