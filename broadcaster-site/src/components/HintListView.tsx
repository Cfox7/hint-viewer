import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Accordion, Button, Form } from 'react-bootstrap';
import { FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import HintItem from './HintItem';
import { useGame } from '../contexts/GameContext';
import { useCrossLinks } from '../hooks/use-cross-links';
import { buildHintIndex } from '../lib/build-hint-index';

export interface HintListViewProps {
  hints: Record<string, string>;
  revealedHints: Set<string>;
  completedHints: Set<string>;
  hintedItems: Record<string, string>;
  onToggleReveal: (location: string) => void;
  onToggleComplete: (location: string) => void;
  onHintedItemChange?: (location: string, item: string) => void;
  editable?: boolean;
  onEditHint?: (location: string, value: string) => void;
  showRevealButtons?: boolean;
}

const SYNTHETIC_CATEGORIES = ['foolish', 'woth'];

export function HintListView({
  hints,
  revealedHints,
  completedHints,
  hintedItems = {},
  onToggleReveal,
  onToggleComplete,
  onHintedItemChange,
  editable = false,
  onEditHint,
  showRevealButtons = false,
}: HintListViewProps) {
  const { game } = useGame();
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const stickyHeaderRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const header = stickyHeaderRef.current;
    const container = containerRef.current;
    if (!header || !container) return;

    const observer = new ResizeObserver(() => {
      const height = header.offsetHeight;
      container.style.setProperty('--sticky-header-height', `${height}px`);
    });
    observer.observe(header);
    return () => observer.disconnect();
  }, []);

  const hiddenLocations = useMemo(() => {
    const hidden = new Set<string>();
    for (const loc of Object.keys(hints)) {
      const level = loc.split(' ')[0];
      if (SYNTHETIC_CATEGORIES.includes(game.getLevelCategory(level))) {
        hidden.add(loc);
      }
    }
    return hidden;
  }, [hints, game]);

  const { revealWithSync, completeWithSync } = useCrossLinks({
    hints,
    hiddenLocations,
    revealedHints,
    completedHints,
    onToggleReveal,
    onToggleComplete,
  });

  const visibleLocations = useMemo(
    () => Object.keys(hints).filter((loc) => !hiddenLocations.has(loc)),
    [hints, hiddenLocations],
  );

  const groupedByLevel = useMemo(() => {
    const mergeMap: Record<string, string> = {};
    if (game.regionMerges) {
      for (const [a, b] of game.regionMerges) {
        const merged = `${a} + ${b}`;
        mergeMap[a] = merged;
        mergeMap[b] = merged;
      }
    }

    const groups: Record<string, string[]> = {};
    for (const loc of visibleLocations) {
      const raw = loc.split(' ')[0];
      const level = mergeMap[raw] ?? raw;
      if (!groups[level]) groups[level] = [];
      groups[level].push(loc);
    }

    const sorted = game.sortHints(groups);

    const orderedLevels = Object.keys(sorted)
      .filter((level) => game.levelOrder.includes(level))
      .sort((a, b) => game.levelOrder.indexOf(a) - game.levelOrder.indexOf(b));

    return { sorted, orderedLevels };
  }, [visibleLocations, game]);

  const hintIndex = useMemo(
    () => buildHintIndex(hints, game.searchableRegions ?? []),
    [hints, game],
  );

  const isFiltered = selectedRegion !== null || searchQuery.length > 0;

  const filteredLocations = useMemo(() => {
    if (!isFiltered) return null;

    let matchingLocations = new Set(
      visibleLocations.filter((loc) => revealedHints.has(loc)),
    );

    if (selectedRegion) {
      const regionMatches = hintIndex.regionIndex.get(selectedRegion);
      if (regionMatches) {
        matchingLocations = new Set(
          [...matchingLocations].filter((loc) => regionMatches.has(loc)),
        );
      } else {
        matchingLocations = new Set();
      }
    }

    if (searchQuery.length > 0) {
      const query = searchQuery.toLowerCase();
      matchingLocations = new Set(
        [...matchingLocations].filter((loc) => {
          const entry = hintIndex.entries.find((e) => e.location === loc);
          return entry?.lowerText.includes(query);
        }),
      );
    }

    return matchingLocations;
  }, [isFiltered, selectedRegion, searchQuery, visibleLocations, revealedHints, hintIndex]);

  const toggleRegion = (key: string) => {
    setSelectedRegion((prev) => (prev === key ? null : key));
    setSearchQuery('');
  };

  const clearFilters = () => {
    setSelectedRegion(null);
    setSearchQuery('');
  };

  const totalVisible = visibleLocations.length;
  const filteredCount = filteredLocations?.size ?? totalVisible;

  const regions = game.searchableRegions ?? [];

  const handleRevealLevel = useCallback(
    (locations: string[]) => {
      const allRevealed = locations.every((loc) => revealedHints.has(loc));
      for (const loc of locations) {
        if (allRevealed && revealedHints.has(loc)) revealWithSync(loc);
        if (!allRevealed && !revealedHints.has(loc)) revealWithSync(loc);
      }
    },
    [revealedHints, revealWithSync],
  );

  const handleRevealAll = useCallback(() => {
    handleRevealLevel(visibleLocations);
  }, [visibleLocations, handleRevealLevel]);

  const allRevealed = visibleLocations.length > 0 && visibleLocations.every((loc) => revealedHints.has(loc));

  const activeKeys = isFiltered
    ? getSectionsWithMatches(groupedByLevel, filteredLocations)
    : [...openSections];

  const allExpanded = !isFiltered && openSections.size === groupedByLevel.orderedLevels.length;

  const handleAccordionToggle = (eventKey: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(eventKey)) next.delete(eventKey);
      else next.add(eventKey);
      return next;
    });
  };

  const expandAll = () => setOpenSections(new Set(groupedByLevel.orderedLevels));
  const collapseAll = () => setOpenSections(new Set());

  const handleAccordionSelect = (eventKey: string | string[] | null | undefined) => {
    if (isFiltered) return;
    if (Array.isArray(eventKey)) {
      setOpenSections(new Set(eventKey));
    } else if (typeof eventKey === 'string') {
      handleAccordionToggle(eventKey);
    }
  };

  return (
    <div className="hint-list-container" ref={containerRef}>
      <div className="hint-list-sticky-header" ref={stickyHeaderRef}>
        <div className="hint-list-filter-label">Filter revealed hints by area mentioned:</div>
        {regions.length > 0 && (
          <div className="hint-list-chips">
            {regions.map((region) => (
              <button
                key={region.key}
                className={`hint-list-chip${selectedRegion === region.key ? ' active' : ''}`}
                style={{
                  '--chip-color': region.color ?? 'var(--text-primary)',
                } as React.CSSProperties}
                onClick={() => toggleRegion(region.key)}
              >
                {region.displayName}
              </button>
            ))}
          </div>
        )}
        <div className="hint-list-search-row">
          <Form.Control
            type="text"
            placeholder="Search hints..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSelectedRegion(null); }}
            className="hint-list-search"
          />
          {isFiltered && (
            <button
              className="hint-list-clear-btn"
              onClick={clearFilters}
              aria-label="Clear filters"
            >
              <FaTimes />
            </button>
          )}
        </div>
        {isFiltered && (
          <div className="hint-list-count">
            Showing {filteredCount} of {totalVisible} hints
          </div>
        )}
        {!isFiltered && (
          <div className="hint-list-expand-controls">
            <button
              className="hint-list-expand-btn"
              onClick={expandAll}
              disabled={allExpanded}
            >
              Expand All
            </button>
            <button
              className="hint-list-expand-btn"
              onClick={collapseAll}
              disabled={openSections.size === 0}
            >
              Collapse All
            </button>
          </div>
        )}
      </div>

      <Accordion
        alwaysOpen
        activeKey={activeKeys}
        onSelect={handleAccordionSelect}
        className="hint-list-sections"
      >
        {groupedByLevel.orderedLevels.map((level) => {
          const locations = groupedByLevel.sorted[level] || [];
          const displayLocations = filteredLocations
            ? locations.filter((loc) => filteredLocations.has(loc))
            : locations;

          if (filteredLocations && displayLocations.length === 0) return null;

          const displayName = game.levelDisplayNames[level] || level;
          const isBatch = level.startsWith('Batch');
          const formattedName = isBatch
            ? displayName.replace(/([A-Za-z])(\d)/, '$1 $2')
            : displayName;

          return (
            <Accordion.Item key={level} eventKey={level}>
              <Accordion.Header>
                <span className="hint-list-section-title">{formattedName}</span>
                <span className="hint-list-section-count">{displayLocations.length}</span>
              </Accordion.Header>
              <Accordion.Body className="p-0">
                {showRevealButtons && !isFiltered && (() => {
                  const levelRevealed = locations.every((loc) => revealedHints.has(loc));
                  return (
                    <div className="hint-list-section-reveal">
                      <Button
                        size="sm"
                        variant={levelRevealed ? 'outline-secondary' : 'outline-primary'}
                        className="d-flex align-items-center gap-1"
                        onClick={() => handleRevealLevel(locations)}
                      >
                        {levelRevealed ? <FaEyeSlash /> : <FaEye />}
                        {levelRevealed ? `Hide ${formattedName}` : `Reveal ${formattedName}`}
                      </Button>
                    </div>
                  );
                })()}
                <div className="hint-list-items">
                  {displayLocations.map((location) => {
                    const locationLabel = game.getLocationLabel(location, level);
                    const cleanedHint = (hints[location] || '').split('|')[0].trim();

                    return (
                      <HintItem
                        key={location}
                        location={location}
                        locationLabel={game.colorizeHints(locationLabel)}
                        cleanedHint={cleanedHint}
                        colorizedHint={game.colorizeHints(hints[location] || '')}
                        isRevealed={revealedHints.has(location)}
                        isCompleted={completedHints.has(location)}
                        hideReveal={false}
                        onCompleteWithLinks={completeWithSync}
                        onRevealWithLinks={revealWithSync}
                        editable={editable}
                        onEditHint={onEditHint}
                        hintedItemOptions={game.hintedItemOptions}
                        hintedItem={hintedItems[location] ?? ''}
                        hintedItemEditable={true}
                        onHintedItemChange={(_, item) => onHintedItemChange?.(location, item)}
                      />
                    );
                  })}
                </div>
              </Accordion.Body>
            </Accordion.Item>
          );
        })}
      </Accordion>

      {showRevealButtons && !isFiltered && (
        <div className="hint-list-reveal-all">
          <Button
            variant={allRevealed ? 'outline-secondary' : 'outline-primary'}
            className="d-flex align-items-center gap-2"
            onClick={handleRevealAll}
          >
            {allRevealed ? <FaEyeSlash /> : <FaEye />}
            {allRevealed ? 'Hide All Hints' : 'Reveal All Hints'}
          </Button>
        </div>
      )}
    </div>
  );
}

function getSectionsWithMatches(
  groupedByLevel: { sorted: Record<string, string[]>; orderedLevels: string[] },
  filteredLocations: Set<string> | null,
): string[] {
  if (!filteredLocations) return [];
  return groupedByLevel.orderedLevels.filter((level) =>
    (groupedByLevel.sorted[level] || []).some((loc) => filteredLocations.has(loc)),
  );
}
