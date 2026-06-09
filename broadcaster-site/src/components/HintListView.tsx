import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Accordion, Button } from 'react-bootstrap';
import Select from 'react-select';
import type { MultiValue, SelectInstance } from 'react-select';
import { FaEye, FaEyeSlash, FaFilter, FaTimes } from 'react-icons/fa';
import HintItem from './HintItem';
import { useGame } from '../contexts/GameContext';
import { useCrossLinks } from '../hooks/use-cross-links';
import { buildHintIndex } from '../lib/build-hint-index';
import { useSelectTheme } from '../hooks/useSelectTheme';

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
  const selectStyles = useSelectTheme<FilterOption>();
  const [selectedRegions, setSelectedRegions] = useState<FilterOption[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const selectRef = useRef<SelectInstance<FilterOption, true>>(null);
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

  const regions = game.searchableRegions ?? [];
  const isFiltered = selectedRegions.length > 0 || searchInput.length > 0;

  const regionOptions: FilterOption[] = useMemo(
    () => regions.map((r) => ({ value: r.key, label: r.displayName })),
    [regions],
  );

  const filteredLocations = useMemo(() => {
    if (!isFiltered) return null;

    let matchingLocations = new Set(
      visibleLocations.filter((loc) => revealedHints.has(loc)),
    );

    if (selectedRegions.length > 0) {
      matchingLocations = new Set(
        [...matchingLocations].filter((loc) =>
          selectedRegions.some((r) => hintIndex.regionIndex.get(r.value)?.has(loc)),
        ),
      );
    }

    if (searchInput.length > 0) {
      const query = searchInput.toLowerCase();
      matchingLocations = new Set(
        [...matchingLocations].filter((loc) => {
          const entry = hintIndex.entries.find((e) => e.location === loc);
          return entry?.lowerText.includes(query);
        }),
      );
    }

    return matchingLocations;
  }, [isFiltered, selectedRegions, searchInput, visibleLocations, revealedHints, hintIndex]);

  const handleFilterChange = (options: MultiValue<FilterOption>) => {
    setSelectedRegions([...options]);
    setSearchInput('');
  };

  const handleFilterClick = () => {
    setMenuOpen(true);
    selectRef.current?.focus();
  };

  const totalVisible = visibleLocations.length;
  const filteredCount = filteredLocations?.size ?? totalVisible;

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
        <div className="hint-list-filter-row">
          <Select<FilterOption, true>
            ref={selectRef}
            isMulti
            classNamePrefix="hint-filter"
            options={regionOptions}
            value={selectedRegions}
            onChange={handleFilterChange}
            inputValue={searchInput}
            onInputChange={(val, action) => {
              if (action.action === 'input-change') setSearchInput(val);
            }}
            placeholder="Search hints or filter by region..."
            menuPortalTarget={document.body}
            menuPlacement="auto"
            menuIsOpen={menuOpen}
            onMenuClose={() => setMenuOpen(false)}
            openMenuOnClick={false}
            openMenuOnFocus={false}
            isSearchable
            filterOption={() => true}
            styles={{
              ...selectStyles,
              container: (base) => ({ ...base, width: '100%', maxWidth: 'none', minWidth: 0 }),
            }}
            components={{
              DropdownIndicator: () => (
                <>
                  {searchInput.length > 0 && (
                    <button
                      className="hint-filter-add-btn"
                      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setSearchInput(''); }}
                      aria-label="Clear search"
                      title="Clear search"
                    >
                    </button>
                  )}
                  <button
                    className="hint-filter-add-btn"
                    onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); handleFilterClick(); }}
                    aria-label="Filter by region"
                    title="Filter by region"
                  >
                    <FaFilter />
                  </button>
                </>
              ),
              IndicatorSeparator: () => null,
            }}
            isClearable={selectedRegions.length > 0 || searchInput.length > 0}
            noOptionsMessage={() => 'No matching regions'}
          />
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
            <Accordion.Item key={level} eventKey={level} data-level={level}>
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
