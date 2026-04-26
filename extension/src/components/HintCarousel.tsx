import { Carousel } from 'react-bootstrap';
import { useState } from 'react';
import { colorizeHints } from '../utils/colorizeHints';
import { LevelNav } from './LevelNav';
import { buildSlides } from '@hint-viewer/shared/buildSlides';
import { useGame } from '../contexts/GameContext';

export interface HintCarouselProps {
  hints: Record<string, string>;
  className?: string;
  revealedHints: Set<string>;
  completedHints: Set<string>;
}

const DIRECT_PER_PAGE = 5;
const FOOLISH_PER_PAGE = 5;
const WOTH_PER_PAGE = 5;

export function HintCarousel({ hints, className = '', revealedHints, completedHints }: HintCarouselProps) {
  const { game } = useGame();
  // Group hints by level (extract level name from location)
  const { slides, levels } = buildSlides(hints, game.levelOrder, game.sortHints, DIRECT_PER_PAGE, FOOLISH_PER_PAGE, WOTH_PER_PAGE);
  

  const [activeIndex, setActiveIndex] = useState(0);
  const currentSlide = slides[activeIndex];

  const slideCountByLevel = Object.fromEntries(
    levels.map((level) => [level, slides.filter((s) => s.level === level).length])
  );

  const levelTitle = game.getLevelTitle(currentSlide, slideCountByLevel, game.levelDisplayNames);

  return (
    <div className={`carousel-bg-container ${className}`}>
      <h3 className="level-title gradient-jumpman">{levelTitle}</h3>
      <LevelNav
        slides={slides}
        activeIndex={activeIndex}
        onSelect={setActiveIndex}
        levelDisplayNames={game.levelDisplayNames}
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
              src={game.backgroundImage}
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