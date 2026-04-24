import { useState } from 'react';
import { Offcanvas, Accordion, Nav } from 'react-bootstrap';
import { getLevelCategory, type LevelCategory } from '@hint-viewer/shared/level_utils';
import { useGame } from '../contexts/GameContext';

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

const SECTION_ORDER: LevelCategory[] = ['regions', 'direct', 'foolish', 'woth'];

export function LevelNav({ slides, activeIndex, onSelect, levelDisplayNames }: LevelNavProps) {
  const [show, setShow] = useState(false);
  const { game } = useGame();
  const isProgressive = slides.some((s) => s.level.startsWith('Batch'));
  const sectionLabels = { ...game.sectionLabels, regions: isProgressive ? 'Batches' : 'Levels' };
  const slideCountByLevel: Record<string, number> = {};
  
  slides.forEach((s) => {
    slideCountByLevel[s.level] = (slideCountByLevel[s.level] || 0) + 1;
  });

  const sections: Record<LevelCategory, { label: string; idx: number }[]> = {
    regions: [], direct: [], foolish: [], woth: [],
  };
  slides.forEach((slide, idx) => {
    const cat = getLevelCategory(slide.level);
    const displayName = levelDisplayNames[slide.level] || slide.level;
    const formattedName = isProgressive
      ? displayName.replace(/([A-Za-z])(\d)/, '$1 $2')
      : displayName;
    const label = slideCountByLevel[slide.level] > 1
      ? `${formattedName} ${slide.pageIndex}`
      : formattedName;
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
                <Accordion.Header>{sectionLabels[cat]}</Accordion.Header>
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
