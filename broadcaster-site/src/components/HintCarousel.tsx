import { Carousel } from 'react-bootstrap';
import type { SpoilerLog } from '../types';

export interface HintCarouselProps {
  spoilerData: SpoilerLog;
  className?: string;
}

export function HintCarousel({ spoilerData, className = '' }: HintCarouselProps) {
  const hints = spoilerData["Wrinkly Hints"];
  
  // Group hints by level (extract level name from location)
  const groupedHints: { [level: string]: string[] } = {};
  
  Object.keys(hints).forEach((location) => {
    // Extract level name (e.g., "Japes DK" -> "Japes", "Aztec Diddy" -> "Aztec")
    const level = location.split(' ')[0];
    
    if (!groupedHints[level]) {
      groupedHints[level] = [];
    }
    groupedHints[level].push(location);
  });

  // Sort levels alphabetically
  const levels = Object.keys(groupedHints).sort();

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
              <h3>{level}</h3>
              <div className="hints-list">
                {groupedHints[level].sort().map((location) => {
                  const cleanedHint = hints[location].split('|')[0].trim();
                  
                  return (
                    <div key={location} className="hint-item">
                      <strong className="hint-location">{location}:</strong>
                      <p className="hint-text">
                        {cleanedHint}
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
