import { useState } from 'react';
import { Offcanvas, Accordion, Nav } from 'react-bootstrap';
import { getLevelCategory, type LevelCategory } from '@hint-viewer/shared/level_utils';

export interface LevelSlide {
  level: string;
  pageIndex: number;
}

export interface LevelNavProps {
  slides: LevelSlide[];
  activeIndex: number;
  onSelect: (index: number) => void;
  levelDisplayNames: Record<string, string>;
}

const SECTION_LABELS: Record<LevelCategory, string> = {
  levels: 'Levels',
  direct: 'Direct',
  foolish: 'Foolish',
  woth: 'Way of the Hoard',
};

const SECTION_ORDER: LevelCategory[] = ['levels', 'direct', 'foolish', 'woth'];

export function LevelNav({ slides, activeIndex, onSelect, levelDisplayNames }: LevelNavProps) {
  const [show, setShow] = useState(false);

  const slideCountByLevel: Record<string, number> = {};
  slides.forEach((s) => {
    slideCountByLevel[s.level] = (slideCountByLevel[s.level] || 0) + 1;
  });

  // Group slide indices by category
  const sections: Record<LevelCategory, { label: string; idx: number }[]> = {
    levels: [], direct: [], foolish: [], woth: [],
  };
  slides.forEach((slide, idx) => {
    const cat = getLevelCategory(slide.level);
    const displayName = levelDisplayNames[slide.level] || slide.level;
    const label = slideCountByLevel[slide.level] > 1
      ? `${displayName} ${slide.pageIndex}`
      : displayName;
    sections[cat].push({ label, idx });
  });

  // Which accordion section should start open (the one containing the active slide)
  const activeCategory = getLevelCategory(slides[activeIndex]?.level ?? '');

  const handleSelect = (idx: number) => {
    onSelect(idx);
    setShow(false);
  };

  return (
    <>
      <button className="level-nav-toggle" onClick={() => setShow(true)} aria-label="Open level navigation">
        Quick Nav
      </button>

      <Offcanvas
        show={show}
        onHide={() => setShow(false)}
        placement="start"
        className="level-nav-offcanvas"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>HINTS</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          <Accordion defaultActiveKey={activeCategory} flush>
            {SECTION_ORDER.filter((cat) => sections[cat].length > 0).map((cat) => (
              <Accordion.Item key={cat} eventKey={cat}>
                <Accordion.Header>{SECTION_LABELS[cat]}</Accordion.Header>
                <Accordion.Body className="p-1">
                  <Nav className="flex-column">
                    {sections[cat].map(({ label, idx }) => (
                      <Nav.Link
                        key={idx}
                        active={idx === activeIndex}
                        onClick={() => handleSelect(idx)}
                      >
                        {label}
                      </Nav.Link>
                    ))}
                  </Nav>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
