import { Carousel, OverlayTrigger, Popover } from 'react-bootstrap';
import { useState } from 'react';
import { MdNotificationImportant } from 'react-icons/md';
import CRightSvg from '../assets/C_Right.svg';
import CLeftSvg from '../assets/C_Left.svg';
import { LevelNav } from './LevelNav';
import { buildSlides } from '@hint-viewer/shared/components/buildSlides';
import { useGame } from '../contexts/GameContext';

export interface HintCarouselProps {
  hints: Record<string, string>;
  className?: string;
  revealedHints: Set<string>;
  completedHints: Set<string>;
  hintedItems: Record<string, string>;
  showLevelNav: boolean;
  onHideLevelNav: () => void;
}

const DIRECT_PER_PAGE = 5;
const FOOLISH_PER_PAGE = 5;
const WOTH_PER_PAGE = 5;

export function HintCarousel({ hints, className = '', revealedHints, completedHints, hintedItems, showLevelNav, onHideLevelNav }: HintCarouselProps) {
  const { game } = useGame();
  const { slides, levels } = buildSlides(hints, game.levelOrder, game.sortHints, game.getLevelCategory, DIRECT_PER_PAGE, FOOLISH_PER_PAGE, WOTH_PER_PAGE);

  const cleanedMap = new Map<string, string[]>();
  Object.keys(hints).forEach((loc) => {
    const cleaned = (hints[loc] || '').split('|')[0].trim();
    const arr = cleanedMap.get(cleaned) || [];
    arr.push(loc);
    cleanedMap.set(cleaned, arr);
  });
  cleanedMap.forEach((arr) => arr.sort());

  const [activeIndex, setActiveIndex] = useState(0);
  const currentSlide = slides[activeIndex];

  const slideCountByLevel = Object.fromEntries(
    levels.map((level) => [level, slides.filter((s) => s.level === level).length])
  );

  const levelTitle = game.getLevelTitle(currentSlide, slideCountByLevel, game.levelDisplayNames);

  return (
    <div className={`carousel-bg-container ${className}`}>
      <h3 className="level-title theme-gradient-text">{levelTitle}</h3>
      <LevelNav
        show={showLevelNav}
        onHide={onHideLevelNav}
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
        nextIcon={<img src={CRightSvg} alt="Next" style={{ width: 64, height: 64 }} />}
        prevIcon={<img src={CLeftSvg} alt="Prev" style={{ width: 64, height: 64 }} />}
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
                  const linkedGroup = cleanedMap.get(cleanedHint) || [location];
                  const hintedLoc = linkedGroup.find(loc => hintedItems[loc]);
                  const hintedItem = hintedLoc ? hintedItems[hintedLoc] : undefined;

                  if (isCompleted && hintedItem) {
                    return (
                      <OverlayTrigger
                        key={location}
                        trigger="click"
                        placement="top"
                        rootClose
                        overlay={
                          <Popover className="hint-popover">
                            <Popover.Header as="h3">Hinted Item</Popover.Header>
                            <Popover.Body><strong>{hintedItem}</strong></Popover.Body>
                          </Popover>
                        }
                      >
                        <div className="hint-item hint-item-hinted">
                          <MdNotificationImportant className="hint-notification-icon" />
                          <p className="hint-text completed">
                            {isRevealed ? game.colorizeHints(hints[location] || '') : "???"}
                          </p>
                        </div>
                      </OverlayTrigger>
                    );
                  }

                  return (
                    <div key={location} className="hint-item">
                      <p className={`hint-text${isCompleted ? ' completed' : ''}`}>
                        {isRevealed ? game.colorizeHints(hints[location] || '') : "???"}
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