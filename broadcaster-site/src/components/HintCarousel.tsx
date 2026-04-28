import { Carousel } from 'react-bootstrap';
import { colorizeHints } from '@hint-viewer/shared/colorizeHints';
import RevealButtons from './RevealButtons';
import { buildSlides } from '@hint-viewer/shared/buildSlides';
import { useGame } from '../contexts/GameContext';
import HintItem from './HintItem';

export interface HintCarouselProps {
  hints: Record<string, string>;
  className?: string;
  channelId: string;
  revealedHints: Set<string>;
  completedHints: Set<string>;
  onToggleReveal: (location: string) => void;
  onToggleComplete: (location: string) => void;
  activeIndex: number;
  onSelect: (idx: number) => void;
  editable?: boolean;
  onEditHint?: (location: string, value: string) => void;
  showRevealButtons?: boolean;
}

const DIRECT_PER_PAGE = 5;
const FOOLISH_PER_PAGE = 5;
const WOTH_PER_PAGE = 5;

export function HintCarousel({
  hints,
  className = '',
  revealedHints,
  completedHints,
  onToggleReveal,
  onToggleComplete,
  activeIndex,
  onSelect,
  editable = false,
  onEditHint,
  showRevealButtons = true,
}: HintCarouselProps) {
  const { game } = useGame();

  // build a map from cleaned hint text -> locations that have that exact cleaned text
  const cleanedMap = new Map<string, string[]>();
  Object.keys(hints).forEach((loc) => {
    const cleaned = (hints[loc] || '').split('|')[0].trim();
    const arr = cleanedMap.get(cleaned) || [];
    arr.push(loc);
    cleanedMap.set(cleaned, arr);
  });

  // When toggling a location, also toggle any linked locations that have the exact same cleaned hint
  const revealLinkedHints = (location: string) => {
    const isCurrentlyRevealed = revealedHints.has(location);
    const cleaned = (hints[location] || '').split('|')[0].trim();
    const linked = cleaned && cleaned !== '' ? cleanedMap.get(cleaned) || [] : [];

    // toggle the clicked location
    onToggleReveal(location);

    // Only toggle linked if cleaned is non-empty
    if (cleaned && cleaned !== '') {
      linked.forEach((loc) => {
        if (loc === location) return;
        const locRevealed = revealedHints.has(loc);
        if (!isCurrentlyRevealed && !locRevealed) onToggleReveal(loc);
        if (isCurrentlyRevealed && locRevealed) onToggleReveal(loc);
      });
    }
  };

  const completeLinkedHints = (location: string) => {
    const isCurrentlyCompleted = completedHints.has(location);
    const cleaned = (hints[location] || '').split('|')[0].trim();
    const linked = cleaned && cleaned !== '' ? cleanedMap.get(cleaned) || [] : [];

    onToggleComplete(location);

    if (cleaned && cleaned !== '') {
      linked.forEach((loc) => {
        if (loc === location) return;
        const locCompleted = completedHints.has(loc);
        if (!isCurrentlyCompleted && !locCompleted) onToggleComplete(loc);
        if (isCurrentlyCompleted && locCompleted) onToggleComplete(loc);
      });
    }
  };

  // Bulk toggle that expands linked hints based on current revealedHints, then calls onToggleReveal
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

    toToggle.forEach((l) => onToggleReveal(l));
  };

  // Group hints by level (extract level name from location) using game-specific sorting
  const { slides, levels, groupedHints } = buildSlides(hints, game.levelOrder, game.sortHints, DIRECT_PER_PAGE, FOOLISH_PER_PAGE, WOTH_PER_PAGE);

  const currentSlide = slides[activeIndex];
  const currentLevel = currentSlide ? currentSlide.level : undefined;
  const currentLevelSelectedIndex = currentLevel ? levels.indexOf(currentLevel) : undefined;

  const slideCountByLevel = Object.fromEntries(
    levels.map((level) => [level, slides.filter((s) => s.level === level).length])
  );

  const levelTitle = game.getLevelTitle(currentSlide, slideCountByLevel, game.levelDisplayNames);

  return (
    <>
      <div className={`carousel-bg-container ${className}`}>
        <h3 className="level-title gradient-jumpman">{levelTitle}</h3>

        {slides.length > 0 ? (
          <Carousel
            interval={null}
            activeIndex={activeIndex}
            onSelect={(idx) => onSelect(idx ?? 0)}
            slide={false}
            indicators={false}
            nextIcon={<img src="/assets/C_Right.svg" alt="Next" style={{ width: 64, height: 64 }} />}
            prevIcon={<img src="/assets/C_Left.svg" alt="Prev" style={{ width: 64, height: 64 }} />}
          >
            {slides.map((slide, sIdx) => {
              const isFoolishOrWoth = ['foolish', 'woth'].includes(slide.level.toLowerCase());
              return (
                <Carousel.Item key={`${slide.level}-p${slide.pageIndex}-${sIdx}`}>
                  <img src={game.backgroundImage} alt={`${slide.level} background`} style={{ opacity: 0 }} />
                  <Carousel.Caption>
                    <div className="hints-list">
                      {slide.locations.map((location) => {
                        const isProgressive = slide.level.startsWith('Batch');
                        let locationLabel = location;
                        if (isProgressive) {
                          locationLabel = `Hint ${location.slice(slide.level.length).trim()}`;
                        } else {
                          // Always grab the last word after the space
                          const parts = location.split(' ');
                          locationLabel = parts.length > 1 ? parts[parts.length - 1] : location;
                        }

                        return (
                          <HintItem
                            key={location}
                            location={location}
                            locationLabel={colorizeHints(locationLabel)}
                            cleanedHint={(hints[location] || '').split('|')[0].trim()}
                            isRevealed={revealedHints.has(location)}
                            isCompleted={completedHints.has(location)}
                            hideReveal={['foolish', 'woth'].includes(slide.level.toLowerCase())}
                            onCompleteWithLinks={completeLinkedHints}
                            onRevealWithLinks={revealLinkedHints}
                            editable={isFoolishOrWoth ? false : editable}
                            onEditHint={onEditHint}
                            hintedItemOptions={game.hintedItemOptions}
                          />
                        );
                      })}
                    </div>
                  </Carousel.Caption>
                </Carousel.Item>
              );
            })}
          </Carousel>
        ) : (
          <div className="no-hints">No hints available</div>
        )}
      </div>
      {showRevealButtons !== false && (
        <RevealButtons
          levels={levels}
          levelDisplayNames={game.levelDisplayNames}
          groupedHints={groupedHints}
          revealedHints={revealedHints}
          onToggleReveal={revealLinkedHints}
          onBulkToggle={handleBulkToggle}
          selectedLevelIndex={currentLevelSelectedIndex}
        />
      )}
    </>
  );
}
export default HintCarousel;
