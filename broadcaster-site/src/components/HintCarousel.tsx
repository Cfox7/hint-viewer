import { useState } from 'react';
import { Carousel, Button } from 'react-bootstrap';
import type { SpoilerLog } from '../types';
import { colorizeHints } from '../utils/colorizeHints';
import RevealButtons from './RevealButtons';

export interface HintCarouselProps {
  spoilerData: SpoilerLog;
  className?: string;
  channelId: string;
  revealedHints: Set<string>;
  onToggleHint: (location: string) => void;
}

const levelDisplayNames: Record<string, string> = {
  Isles: "DK Isles",
  Japes: "Jungle Japes",
  Aztec: "Angry Aztec",
  Factory: "Frantic Factory",
  Galleon: "Gloomy Galleon",
  Fungi: "Fungi Forest",
  Caves: "Crystal Caves",
  Castle: "Creepy Castle",
  Helm: "Hideout Helm",
  Direct: "Direct Hints",
  Foolish: "Foolish Hints",
  WOTH: "WOTH Hints",
};

const levelOrder = Object.keys(levelDisplayNames);
const DIRECT_HINTS_PER_PAGE = 4;
const FOOLISH_HINTS_PER_PAGE = 5;
const WOTH_HINTS_PER_PAGE = 5;

export function HintCarousel({
  spoilerData,
  className = '',
  revealedHints,
  onToggleHint,
}: HintCarouselProps) {
  const hints = spoilerData["Wrinkly Hints"] || {};

  // build a map from cleaned hint text -> locations that have that exact cleaned text
  const cleanedMap = new Map<string, string[]>();
  Object.keys(hints).forEach((loc) => {
    const cleaned = (hints[loc] || '').split('|')[0].trim();
    const arr = cleanedMap.get(cleaned) || [];
    arr.push(loc);
    cleanedMap.set(cleaned, arr);
  });

  // When toggling a location, also toggle any linked locations that have the exact same cleaned hint
  const handleToggleWithLinks = (location: string) => {
    const isCurrentlyRevealed = revealedHints.has(location);
    const cleaned = (hints[location] || '').split('|')[0].trim();
    const linked = cleanedMap.get(cleaned) || [];

    // toggle the clicked location
    onToggleHint(location);

    // for each linked location (excluding the clicked one) toggle if it needs the same action
    linked.forEach((loc) => {
      if (loc === location) return;
      const locRevealed = revealedHints.has(loc);
      // if we're revealing (was not revealed) reveal any linked unrevealed ones
      if (!isCurrentlyRevealed && !locRevealed) onToggleHint(loc);
      // if we're hiding (was revealed) hide any linked revealed ones
      if (isCurrentlyRevealed && locRevealed) onToggleHint(loc);
    });
  };

  // Bulk toggle that expands linked hints based on current revealedHints, then calls onToggleHint
  const handleBulkToggle = (locations: string[], reveal: boolean) => {
    const toToggle = new Set<string>();
    locations.forEach((loc) => {
      const cleaned = (hints[loc] || '').split('|')[0].trim();
      const linked = cleanedMap.get(cleaned) || [];

      if (reveal) {
        if (!revealedHints.has(loc)) toToggle.add(loc);
        linked.forEach((l) => { if (!revealedHints.has(l)) toToggle.add(l); });
      } else {
        if (revealedHints.has(loc)) toToggle.add(loc);
        linked.forEach((l) => { if (revealedHints.has(l)) toToggle.add(l); });
      }
    });

    toToggle.forEach((l) => onToggleHint(l));
  };

  // Group hints by level (extract level name from location)
  const groupedHints: Record<string, string[]> = {};
  Object.keys(hints).forEach((location) => {
    const level = location.split(' ')[0];
    if (!groupedHints[level]) {
      groupedHints[level] = [];
    }
    groupedHints[level].push(location);
  });

  const levels = Object.keys(groupedHints)
    .filter((level) => levelOrder.includes(level))
    .sort((a, b) => levelOrder.indexOf(a) - levelOrder.indexOf(b));

  // Build slides: each slide is a { level, pageIndex, locations[] }
  const slides: { level: string; pageIndex: number; locations: string[] }[] = [];
  levels.forEach((level) => {
    // natural numeric-aware sort (e.g. "1, 2, 10") on a copy to avoid mutating groupedHints
    const locs = (groupedHints[level] || []).slice().sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
    // paginate only for specific levels
    let perPage = locs.length || 1;
    if (level === 'Direct') perPage = DIRECT_HINTS_PER_PAGE;
    else if (level === 'Foolish') perPage = FOOLISH_HINTS_PER_PAGE;
    else if (level.toLowerCase() === 'woth' || level === 'WOTH') perPage = WOTH_HINTS_PER_PAGE;
    for (let i = 0; i < locs.length; i += perPage) {
      slides.push({
        level,
        pageIndex: Math.floor(i / perPage) + 1,
        locations: locs.slice(i, i + perPage),
      });
    }
  });

  const [activeIndex, setActiveIndex] = useState(0);

  const currentSlide = slides[activeIndex];
  const currentLevel = currentSlide ? currentSlide.level : undefined;
  const currentLevelSelectedIndex = currentLevel ? levels.indexOf(currentLevel) : undefined;

  return (
    <>
      <div className={`carousel-bg-container ${className}`}>
        <h3 className="level-title gradient-jumpman">Hints</h3>
        <h3 className="level-title gradient-jumpman">
          {currentSlide ? (levelDisplayNames[currentSlide.level] || currentSlide.level) : ''}
        </h3>

        {slides.length > 0 ? (
          <Carousel
            interval={null}
            activeIndex={activeIndex}
            onSelect={(idx) => setActiveIndex(idx ?? 0)}
            slide={false}
            nextIcon={<img src="/assets/C_Right.svg" alt="Next" style={{ width: 64, height: 64 }} />}
            prevIcon={<img src="/assets/C_Left.svg" alt="Prev" style={{ width: 64, height: 64 }} />}
          >
            {slides.map((slide, sIdx) => (
              <Carousel.Item key={`${slide.level}-p${slide.pageIndex}-${sIdx}`}>
                <img src="/assets/bgfinal.webp" alt={`${slide.level} background`} style={{ opacity: 0 }} />
                <Carousel.Caption>
                  <div className="hints-list">
                    {slide.locations.map((location) => {
                      const cleanedHint = (hints[location] || '').split('|')[0].trim();
                      const isRevealed = revealedHints.has(location);
                      const hideReveal = ['foolish', 'woth'].includes((slide.level || '').toLowerCase());

                      return (
                        <div key={location} className="hint-item">
                          <div className="d-flex justify-content-between align-items-center mb-1 hint-row-modern">
                            <span className="hint-location">{location}:</span>
                            {!hideReveal && (
                              <Button
                                size="sm"
                                variant={isRevealed ? "outline-secondary" : "outline-primary"}
                                className="hint-toggle-btn"
                                aria-label={isRevealed ? "Hide hint" : "Reveal hint"}
                                onClick={() => handleToggleWithLinks(location)}
                              >
                                <i className={`bi ${isRevealed ? "bi-eye-slash" : "bi-eye"}`}></i>
                              </Button>
                            )}
                          </div>
                          <p className="hint-text">
                            {isRevealed ? colorizeHints(cleanedHint) : "???"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </Carousel.Caption>
              </Carousel.Item>
            ))}
          </Carousel>
        ) : (
          <div className="no-hints">No hints available</div>
        )}
      </div>

      <RevealButtons
        levels={levels}
        levelDisplayNames={levelDisplayNames}
        groupedHints={groupedHints}
        revealedHints={revealedHints}
        onToggleHint={handleToggleWithLinks}
        onBulkToggle={handleBulkToggle}
        selectedLevelIndex={currentLevelSelectedIndex}
      />
    </>
  );
}
export default HintCarousel;
