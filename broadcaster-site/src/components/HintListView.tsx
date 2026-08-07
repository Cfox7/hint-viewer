import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Accordion, Button } from 'react-bootstrap';
import { FaEye, FaEyeSlash, FaFilter, FaTimes } from 'react-icons/fa';
import HintItem from './HintItem';
import { useGame } from '../contexts/GameContext';
import { useCrossLinks } from '../hooks/use-cross-links';
import { buildHintIndex } from '../lib/build-hint-index';

interface FilterOption {
  value: string;
  label: string;
}

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
  const [searchInput, setSearchInput] = useState('');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const filterMenuRef = useRef<HTMLDivElement>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const jumpTargetRef = useRef<string | null>(null);
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

  useEffect(() => {
    const level = jumpTargetRef.current;
    const container = containerRef.current;
    if (!level || !container) return;
    jumpTargetRef.current = null;
    requestAnimationFrame(() => {
      container.classList.remove('hint-list-no-transition');
      const el = container.querySelector(`[data-level="${level}"]`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [openSections]);

  const { revealWithSync, completeWithSync } = useCrossLinks({
    hints,
    revealedHints,
    completedHints,
    onToggleReveal,
    onToggleComplete,
  });

  const visibleLocations = useMemo(
    () => Object.keys(hints),
    [hints],
  );

  const syntheticLevels = useMemo(() => {
    const levels = new Set<string>();
    for (const loc of visibleLocations) {
      const level = loc.split(' ')[0];
      const category = game.getLevelCategory(level);
      if (category === 'foolish' || category === 'woth') {
        levels.add(level);
      }
    }
    return levels;
  }, [visibleLocations, game]);

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

  const syntheticHintedItems = useMemo(() => {
    const textToSourceLoc = new Map<string, string>();
    for (const loc of visibleLocations) {
      const level = loc.split(' ')[0];
      if (syntheticLevels.has(level)) continue;
      const cleaned = (hints[loc] || '').split('|')[0].trim();
      if (cleaned) textToSourceLoc.set(cleaned, loc);
    }

    const result: Record<string, string> = {};
    for (const loc of visibleLocations) {
      const level = loc.split(' ')[0];
      if (!syntheticLevels.has(level)) continue;
      const cleaned = (hints[loc] || '').split('|')[0].trim();
      const sourceLoc = textToSourceLoc.get(cleaned);
      if (sourceLoc && hintedItems[sourceLoc]) {
        result[loc] = hintedItems[sourceLoc];
      }
    }
    return result;
  }, [visibleLocations, syntheticLevels, hints, hintedItems]);

  const regions = game.searchableRegions ?? [];
  const isFiltered = searchInput.length > 0;

  const regionOptions: FilterOption[] = useMemo(
    () => regions.map((r) => ({ value: r.aliases[0], label: r.displayName })),
    [regions],
  );

  const filteredLocations = useMemo(() => {
    if (!isFiltered) return null;

    const query = searchInput.toLowerCase();
    return new Set(
      visibleLocations.filter((loc) => {
        const level = loc.split(' ')[0];
        if (syntheticLevels.has(level)) return false;
        if (!revealedHints.has(loc)) return false;
        const entry = hintIndex.entries.find((e) => e.location === loc);
        return entry?.lowerText.includes(query);
      }),
    );
  }, [isFiltered, searchInput, visibleLocations, revealedHints, hintIndex, syntheticLevels]);

  const handleFilterSelect = (value: string) => {
    setSearchInput(value);
    setFilterMenuOpen(false);
    searchInputRef.current?.focus();
  };

  useEffect(() => {
    if (!filterMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target as Node)) {
        setFilterMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterMenuOpen]);

  const nonSyntheticLocations = useMemo(
    () => visibleLocations.filter((loc) => !syntheticLevels.has(loc.split(' ')[0])),
    [visibleLocations, syntheticLevels],
  );
  const totalVisible = nonSyntheticLocations.length;
  const filteredCount = filteredLocations?.size ?? totalVisible;

  const handleRevealLevel = useCallback(
    (locations: string[]) => {
      const allRevealed = locations.every((loc) => revealedHints.has(loc));
      for (const loc of locations) {
        if (allRevealed && revealedHints.has(loc)) onToggleReveal(loc);
        if (!allRevealed && !revealedHints.has(loc)) onToggleReveal(loc);
      }
    },
    [revealedHints, onToggleReveal],
  );

  const handleRevealAll = useCallback(() => {
    handleRevealLevel(visibleLocations);
  }, [visibleLocations, handleRevealLevel]);

  const allRevealed = visibleLocations.length > 0 && visibleLocations.every((loc) => revealedHints.has(loc));

  const activeKeys = [...openSections];

  const allExpanded = openSections.size === groupedByLevel.orderedLevels.length;

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
        <div className="hint-list-filter-row">
          <div className="hint-search-bar">
            <input
              ref={searchInputRef}
              type="text"
              className="hint-search-input"
              placeholder="Search hints..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            {isFiltered && (
              <button
                className="hint-filter-add-btn"
                onClick={() => setSearchInput('')}
                aria-label="Clear search"
                title="Clear search"
              >
                <FaTimes />
              </button>
            )}
            <div className="hint-filter-dropdown-wrapper" ref={filterMenuRef}>
              <button
                className="hint-filter-add-btn"
                onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                aria-label="Pre-made Filters"
                title="Pre-made Filters"
              >
                <FaFilter />
              </button>
              {filterMenuOpen && (
                <div className="hint-filter-dropdown">
                  {regionOptions.map((r) => (
                    <button
                      key={r.value}
                      className="hint-filter-dropdown-option"
                      onClick={() => handleFilterSelect(r.value)}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        {isFiltered && (
          <div className="hint-list-count">
            Showing {filteredCount} of {totalVisible} hints
          </div>
        )}
        {!isFiltered && (
          <div className="hint-list-expand-controls">
            <select
              className="hint-list-jump-select"
              value=""
              onChange={(e) => {
                const level = e.target.value;
                if (!level) return;
                jumpTargetRef.current = level;
                containerRef.current?.classList.add('hint-list-no-transition');
                setOpenSections(new Set([level]));
                e.target.value = '';
              }}
            >
              <option value="" disabled hidden>Jump to...</option>
              {groupedByLevel.orderedLevels.map((level) => {
                const name = game.levelDisplayNames[level] || level;
                return <option key={level} value={level}>{name}</option>;
              })}
            </select>
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

      {isFiltered ? (
        <div className="hint-list-filtered">
          {[...filteredLocations!].map((location) => {
            const cleanedHint = (hints[location] || '').split('|')[0].trim();

            return (
              <HintItem
                key={location}
                location={location}
                locationLabel=""
                cleanedHint={cleanedHint}
                colorizedHint={game.colorizeHints(hints[location] || '', searchInput || undefined)}
                isRevealed={revealedHints.has(location)}
                isCompleted={completedHints.has(location)}
                hideReveal={false}
                hideLocation
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
      ) : (
        <Accordion
          alwaysOpen
          activeKey={activeKeys}
          onSelect={handleAccordionSelect}
          className="hint-list-sections"
        >
          {groupedByLevel.orderedLevels.map((level) => {
            const locations = groupedByLevel.sorted[level] || [];
            const isSynthetic = syntheticLevels.has(level);

            const displayName = game.levelDisplayNames[level] || level;
            const isBatch = level.startsWith('Batch');
            const formattedName = isBatch
              ? displayName.replace(/([A-Za-z])(\d)/, '$1 $2')
              : displayName;

            return (
              <Accordion.Item key={level} eventKey={level} data-level={level}>
                <Accordion.Header>
                  <span className="hint-list-section-title">{formattedName}</span>
                  <span className="hint-list-section-count">{locations.length}</span>
                </Accordion.Header>
                <Accordion.Body className="p-0">
                  {showRevealButtons && !isSynthetic && (() => {
                    const levelRevealed = locations.every((loc) => revealedHints.has(loc));
                    return (
                      <div className="hint-list-section-reveal">
                        <Button
                          size="sm"
                          variant={levelRevealed ? 'secondary' : 'primary'}
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
                    {locations.map((location) => {
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
                          hideReveal={isSynthetic}
                          onCompleteWithLinks={completeWithSync}
                          onRevealWithLinks={revealWithSync}
                          editable={editable && !isSynthetic}
                          onEditHint={onEditHint}
                          hintedItemOptions={game.hintedItemOptions}
                          hintedItem={isSynthetic ? (syntheticHintedItems[location] ?? '') : (hintedItems[location] ?? '')}
                          hintedItemEditable={!isSynthetic}
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
      )}

      {showRevealButtons && !isFiltered && (
        <div className="hint-list-reveal-all">
          <Button
            variant={allRevealed ? 'secondary' : 'primary'}
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

