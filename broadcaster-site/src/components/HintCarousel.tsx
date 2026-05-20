import { Carousel } from 'react-bootstrap';
import RevealButtons from './RevealButtons';
import { buildSlides } from '@hint-viewer/shared/components/buildSlides';
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
  hintedItems?: Record<string, string>;
  onHintedItemChange?: (location: string, item: string) => void;
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
  hintedItems = {},
  onHintedItemChange,
}: HintCarouselProps) {
  const { game } = useGame();

  const categoryOf = (loc: string) => game.getLevelCategory(loc.split(' ')[0]);

  // build a map from cleaned hint text -> locations that have that exact cleaned text
  const cleanedMap = new Map<string, string[]>();
  Object.keys(hints).forEach((loc) => {
    const cleaned = (hints[loc] || '').split('|')[0].trim();
    const arr = cleanedMap.get(cleaned) || [];
    arr.push(loc);
    cleanedMap.set(cleaned, arr);
  });
  cleanedMap.forEach((arr) => arr.sort());

  const getCrossLinked = (location: string) => {
    const cleaned = (hints[location] || '').split('|')[0].trim();
    if (!cleaned) return [];
    const myCategory = categoryOf(location);
    return (cleanedMap.get(cleaned) || []).filter(loc => loc !== location && categoryOf(loc) !== myCategory);
  };

  const revealLinkedHints = (location: string) => {
    const isCurrentlyRevealed = revealedHints.has(location);
    onToggleReveal(location);

    getCrossLinked(location).forEach((loc) => {
      const locRevealed = revealedHints.has(loc);
      if (!isCurrentlyRevealed && !locRevealed) onToggleReveal(loc);
      if (isCurrentlyRevealed && locRevealed) onToggleReveal(loc);
    });
  };

  const completeLinkedHints = (location: string) => {
    const isCurrentlyCompleted = completedHints.has(location);
    onToggleComplete(location);

    getCrossLinked(location).forEach((loc) => {
      const locCompleted = completedHints.has(loc);
      if (!isCurrentlyCompleted && !locCompleted) onToggleComplete(loc);
      if (isCurrentlyCompleted && locCompleted) onToggleComplete(loc);
    });
  };

  const handleBulkToggle = (locations: string[], reveal: boolean) => {
    const toToggle = new Set<string>();
    locations.forEach((loc) => {
      const linked = getCrossLinked(loc);
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

  const { slides, levels, groupedHints } = buildSlides(hints, {
    levelOrder: game.levelOrder, sortHints: game.sortHints, getLevelCategory: game.getLevelCategory,
    regionMerges: game.regionMerges, hintsPerPage: { direct: DIRECT_PER_PAGE, foolish: FOOLISH_PER_PAGE, woth: WOTH_PER_PAGE },
  });

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
        <h3 className="level-title theme-gradient-text">{levelTitle}</h3>

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
              const isFoolishOrWoth = ['foolish', 'woth'].includes(game.getLevelCategory(slide.level));
              return (
                <Carousel.Item key={`${slide.level}-p${slide.pageIndex}-${sIdx}`}>
                  <img src={game.backgroundImage} alt={`${slide.level} background`} style={{ opacity: 0 }} />
                  <Carousel.Caption>
                    <div className="hints-list">
                      {slide.locations.map((location) => {
                        const locationLabel = game.getLocationLabel(location, slide.level);
                        const cleanedHint = (hints[location] || '').split('|')[0].trim();
                        const crossLinked = getCrossLinked(location);
                        const primaryLocation = crossLinked.length > 0 ? [location, ...crossLinked].sort()[0] : location;
                        const isLinked = primaryLocation !== location;

                        return (
                          <HintItem
                            key={location}
                            location={location}
                            locationLabel={game.colorizeHints(locationLabel)}
                            cleanedHint={cleanedHint}
                            colorizedHint={game.colorizeHints(hints[location] || '')}
                            isRevealed={revealedHints.has(location)}
                            isCompleted={completedHints.has(location)}
                            hideReveal={isFoolishOrWoth}
                            onCompleteWithLinks={completeLinkedHints}
                            onRevealWithLinks={revealLinkedHints}
                            editable={isFoolishOrWoth ? false : editable}
                            onEditHint={onEditHint}
                            hintedItemOptions={game.hintedItemOptions}
                            hintedItem={hintedItems[primaryLocation] ?? ''}
                            hintedItemEditable={!isLinked}
                            onHintedItemChange={onHintedItemChange}
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
