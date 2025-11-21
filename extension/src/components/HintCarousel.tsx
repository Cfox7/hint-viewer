import { Carousel } from 'react-bootstrap';
import type { SpoilerLog } from '@hint-viewer/shared';
import { useState } from 'react';

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
    Isles: "DK Isles",
    Japes: "Jungle Japes",
    Aztec: "Angry Aztec",
    Factory: "Frantic Factory",
    Galleon: "Gloomy Galleon",
    Fungi: "Fungi Forest",
    Caves: "Crystal Caves",
    Castle: "Creepy Castle",
    Helm: "Hideout Helm"
  };

  const levelOrder = Object.keys(levelDisplayNames);
  const levels = Object.keys(groupedHints)
    .filter(level => levelOrder.includes(level)) // only include known levels
    .sort((a, b) => levelOrder.indexOf(a) - levelOrder.indexOf(b));

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className={`carousel-bg-container ${className}`}>
      <h3 className="level-title">Hints</h3>
      <h3 className="level-title">
        {levelDisplayNames[levels[activeIndex]] || levels[activeIndex]}
      </h3>
      <Carousel
        interval={null}
        activeIndex={activeIndex}
        onSelect={setActiveIndex}
        slide={false}
        nextIcon={<img src="/assets/C_Right.svg" alt="Next" style={{ width: 64, height: 64 }} />}
        prevIcon={<img src="/assets/C_Left.svg" alt="Prev" style={{ width: 64, height: 64 }} />}
      >
        {levels.map((level) => (
          <Carousel.Item key={level}>
            <img
              src="/assets/C_Left.svg"
              alt={`${level} background`}
              style={{ opacity: 0.3 }}
            />
            <Carousel.Caption>
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
