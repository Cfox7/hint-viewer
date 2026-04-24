import { Carousel, Button } from 'react-bootstrap';
import { colorizeHints } from '../utils/colorizeHints';
import RevealButtons from './RevealButtons';
import { buildSlides } from '../utils/buildSlides';
import { useGame } from '../contexts/GameContext';

interface HintItemProps {
  location: string;
  locationLabel: string;
  cleanedHint: string;
  isRevealed: boolean;
  isCompleted: boolean;
  hideReveal: boolean;
  onCompleteWithLinks: (location: string) => void;
  onRevealWithLinks: (location: string) => void;
}

function HintItem({ location, locationLabel, cleanedHint, isRevealed, isCompleted, hideReveal, onCompleteWithLinks, onRevealWithLinks }: HintItemProps) {
  return (
    <div className="hint-item">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <span className="hint-location">{locationLabel}:</span>
        <div className="d-flex gap-1">
          {isRevealed && (
            <Button size="sm" variant={isCompleted ? "success" : "outline-success"} className="hint-toggle-btn" aria-label={isCompleted ? "Mark uncompleted" : "Mark completed"} onClick={() => onCompleteWithLinks(location)}>
              <i className={`bi ${isCompleted ? "bi-check-circle-fill" : "bi-check-circle"}`}></i>
            </Button>
          )}
          {!hideReveal && (
            <Button size="sm" variant={isRevealed ? "outline-secondary" : "outline-primary"} className="hint-toggle-btn" aria-label={isRevealed ? "Hide hint" : "Reveal hint"} onClick={() => onRevealWithLinks(location)}>
              <i className={`bi ${isRevealed ? "bi-eye-slash" : "bi-eye"}`}></i>
            </Button>
          )}
        </div>
      </div>
      <p className={`hint-text${isCompleted ? ' completed' : ''}`}>
        {isRevealed ? colorizeHints(cleanedHint) : "???"}
      </p>
    </div>
  );
}

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
}

export function HintCarousel({
  hints,
  className = '',
  revealedHints,
  completedHints,
  onToggleReveal,
  onToggleComplete,
  activeIndex,
  onSelect,
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
    const linked = cleanedMap.get(cleaned) || [];

    // toggle the clicked location
    onToggleReveal(location);

    // for each linked location (excluding the clicked one) toggle if it needs the same action
    linked.forEach((loc) => {
      if (loc === location) return;
      const locRevealed = revealedHints.has(loc);
      // if we're revealing (was not revealed) reveal any linked unrevealed ones
      if (!isCurrentlyRevealed && !locRevealed) onToggleReveal(loc);
      // if we're hiding (was revealed) hide any linked revealed ones
      if (isCurrentlyRevealed && locRevealed) onToggleReveal(loc);
    });
  };

  const completeLinkedHints = (location: string) => {
    const isCurrentlyCompleted = completedHints.has(location);
    const cleaned = (hints[location] || '').split('|')[0].trim();
    const linked = cleanedMap.get(cleaned) || [];

    // toggle the clicked location
    onToggleComplete(location);

    // for each linked location (excluding the clicked one) toggle if it needs the same action
    linked.forEach((loc) => {
      if (loc === location) return;
      const locCompleted = completedHints.has(loc);
      // if we're marking complete, mark any linked uncompleted ones
      if (!isCurrentlyCompleted && !locCompleted) onToggleComplete(loc);
      // if we're marking uncomplete, uncomplete any linked completed ones
      if (isCurrentlyCompleted && locCompleted) onToggleComplete(loc);
    });
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

  // Group hints by level (extract level name from location)
  const { slides, levels, groupedHints } = buildSlides(hints, game.levelOrder);

  const currentSlide = slides[activeIndex];
  const currentLevel = currentSlide ? currentSlide.level : undefined;
  const currentLevelSelectedIndex = currentLevel ? levels.indexOf(currentLevel) : undefined;

  const slideCountByLevel = Object.fromEntries(
    levels.map((level) => [level, slides.filter((s) => s.level === level).length])
  );

  const displayName = currentSlide
    ? (game.levelDisplayNames[currentSlide.level] || currentSlide.level).replace(/([A-Za-z])(\d)/, '$1 $2')
    : '';
  const total = currentSlide ? slideCountByLevel[currentSlide.level] ?? 1 : 1;
  const levelTitle = !currentSlide
    ? 'Hints'
    : total > 1
      ? `${displayName}  ·  ${currentSlide.pageIndex} / ${total}`
      : displayName;

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
            {slides.map((slide, sIdx) => (
              <Carousel.Item key={`${slide.level}-p${slide.pageIndex}-${sIdx}`}>
                <img src={game.backgroundImage} alt={`${slide.level} background`} style={{ opacity: 0 }} />
                <Carousel.Caption>
                  <div className="hints-list">
                    {slide.locations.map((location) => {
                      const isProgressive = slide.level.startsWith('Batch');
                      const locationLabel = isProgressive
                        ? `Hint ${location.slice(slide.level.length).trim()}`
                        : location;

                      return (
                        <HintItem
                          key={location}
                          location={location}
                          locationLabel={locationLabel}
                          cleanedHint={(hints[location] || '').split('|')[0].trim()}
                          isRevealed={revealedHints.has(location)}
                          isCompleted={completedHints.has(location)}
                          hideReveal={['foolish', 'woth'].includes(slide.level.toLowerCase())}
                          onCompleteWithLinks={completeLinkedHints}
                          onRevealWithLinks={revealLinkedHints}
                        />
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
        levelDisplayNames={game.levelDisplayNames}
        groupedHints={groupedHints}
        revealedHints={revealedHints}
        onToggleReveal={revealLinkedHints}
        onBulkToggle={handleBulkToggle}
        selectedLevelIndex={currentLevelSelectedIndex}
      />
    </>
  );
}
export default HintCarousel;
