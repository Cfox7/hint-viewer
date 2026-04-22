import { Carousel } from 'react-bootstrap';
import type { SpoilerLog } from '@hint-viewer/shared';
import { levelDisplayNames, levelOrder } from '@hint-viewer/shared/level_utils';
import { useState } from 'react';
import { colorizeHints } from '../utils/colorizeHints';
import { LevelNav } from './LevelNav';

export interface HintCarouselProps {
  spoilerData: SpoilerLog;
  className?: string;
  revealedHints: Set<string>;
  completedHints: Set<string>;
}

const DIRECT_HINTS_PER_PAGE = 3;
const FOOLISH_HINTS_PER_PAGE = 5;
const WOTH_HINTS_PER_PAGE = 5;

export function HintCarousel({ spoilerData, className = '', revealedHints, completedHints }: HintCarouselProps) {
  const hints = spoilerData["Wrinkly Hints"];

  // Group hints by level (extract level name from location)
  const groupedHints: { [level: string]: string[] } = {};
  Object.keys(hints).forEach((location) => {
    const level = location.split(' ')[0];
    if (!groupedHints[level]) groupedHints[level] = [];
    groupedHints[level].push(location);
  });

  const levels = Object.keys(groupedHints)
    .filter(level => levelOrder.includes(level))
    .sort((a, b) => levelOrder.indexOf(a) - levelOrder.indexOf(b));

  // Build paged slides: each slide is { level, pageIndex, locations: string[] }
  const slides: { level: string; pageIndex: number; locations: string[] }[] = [];
  levels.forEach((level) => {
    const locs = (groupedHints[level] || []).slice().sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
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

  const slideCountByLevel = Object.fromEntries(
    levels.map((level) => [level, slides.filter((s) => s.level === level).length])
  );

  const displayName = currentSlide
    ? (levelDisplayNames[currentSlide.level] || currentSlide.level).replace(/([A-Za-z])(\d)/, '$1 $2')
    : '';
  const total = currentSlide ? slideCountByLevel[currentSlide.level] ?? 1 : 1;
  const levelTitle = !currentSlide
    ? 'Hints'
    : total > 1
      ? `${displayName}  ·  ${currentSlide.pageIndex} / ${total}`
      : displayName;

  return (
    <div className={`carousel-bg-container ${className}`}>
      <h3 className="level-title gradient-jumpman">{levelTitle}</h3>
      <LevelNav
        slides={slides}
        activeIndex={activeIndex}
        onSelect={setActiveIndex}
        levelDisplayNames={levelDisplayNames}
      />

      <Carousel
        interval={null}
        activeIndex={activeIndex}
        onSelect={(idx) => setActiveIndex(idx ?? 0)}
        slide={false}
        indicators={false}
        nextIcon={<img src="assets/C_Right.svg" alt="Next" style={{ width: 64, height: 64 }} />}
        prevIcon={<img src="assets/C_Left.svg" alt="Prev" style={{ width: 64, height: 64 }} />}
      >
        {slides.map((slide, sIdx) => (
          <Carousel.Item key={`${slide.level}-p${slide.pageIndex}-${sIdx}`}>
            <img
              src="assets/bgfinal.webp"
              alt={`${slide.level} background`}
              style={{ opacity: 0 }}
            />
            <Carousel.Caption>
              <div className="hints-list">
                {slide.locations.map((location) => {
                  const cleanedHint = (hints[location] || '').split('|')[0].trim();
                  const isRevealed = revealedHints.has(location);
                  const isCompleted = completedHints.has(location);

                  return (
                    <div key={location} className="hint-item">
                      <p className={`hint-text${isCompleted ? ' completed' : ''}`}>
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
    </div>
  );
}

export default HintCarousel;