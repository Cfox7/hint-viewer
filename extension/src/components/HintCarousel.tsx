import { Carousel } from 'react-bootstrap';
import type { SpoilerLog } from '@hint-viewer/shared';

export interface HintCarouselProps {
  spoilerData: SpoilerLog;
  className?: string;
  revealedHints: Set<string>;
}

export function HintCarousel({ spoilerData, className = '', revealedHints }: HintCarouselProps) {
  const hints = spoilerData["Wrinkly Hints"];

  // Group hints by level (extract level name from location)
  const groupedHints: { [level: string]: string[] } = {};

  Object.keys(hints).forEach((location) => {
    const level = location.split(' ')[0];
    if (!groupedHints[level]) {
      groupedHints[level] = [];
    }
    groupedHints[level].push(location);
  });

  const levelDisplayNames: Record<string, string> = {
    Japes: "Jungle Japes",
    Aztec: "Angry Aztec",
    Factory: "Frantic Factory",
    Galleon: "Gloomy Galleon",
    Fungi: "Fungi Forest",
    Caves: "Crystal Caves",
    Castle: "Creepy Castle",
    Isles: "DK Isles",
    Helm: "Hideout Helm"
  };

  const levelOrder = Object.keys(levelDisplayNames);
  const levels = Object.keys(groupedHints)
    .filter(level => levelOrder.includes(level)) // only include known levels
    .sort((a, b) => levelOrder.indexOf(a) - levelOrder.indexOf(b));

  return (
    <div className={className}>
      <Carousel interval={null}>
        {levels.map((level) => (
          <Carousel.Item key={level}>
            <img
              className="d-block w-100"
              src="/assets/bgfinal.webp"
              alt={`${level} background`}
            />
            <Carousel.Caption>
              <h3>{levelDisplayNames[level] || level}</h3>
              <div className="hints-list">
                {groupedHints[level].sort().map((location) => {
                  const cleanedHint = hints[location].split('|')[0].trim();
                  const isRevealed = revealedHints.has(location);

                  return (
                    <div key={location} className="hint-item">
                      <p className="hint-text">
                        {isRevealed ? cleanedHint : "???"}
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
