import { Offcanvas, Accordion } from 'react-bootstrap';
import { useGame } from '../contexts/GameContext';
import type { LevelCategory } from '@hint-viewer/shared/games/types';

export interface LevelSlide {
  level: string;
  pageIndex: number;
}

export interface LevelNavProps {
  show: boolean;
  onHide: () => void;
  slides: LevelSlide[];
  activeIndex: number;
  onSelect: (index: number) => void;
  levelDisplayNames: Record<string, string>;
}

const SECTION_ORDER: LevelCategory[] = ['regions', 'direct', 'foolish', 'woth'];

export function LevelNav({ show, onHide, slides, activeIndex, onSelect, levelDisplayNames }: LevelNavProps) {
  const { game } = useGame();
  const isProgressive = slides.some((s) => s.level.startsWith('Batch'));
  const sectionLabels = { ...game.sectionLabels, regions: isProgressive ? 'Batches' : game.sectionLabels.regions };
  const slideCountByLevel: Record<string, number> = {};
  
  slides.forEach((s) => {
    slideCountByLevel[s.level] = (slideCountByLevel[s.level] || 0) + 1;
  });

  const sections: Record<LevelCategory, { label: string; idx: number }[]> = {
    regions: [], direct: [], foolish: [], woth: [],
  };
  slides.forEach((slide, idx) => {
    const cat = game.getLevelCategory(slide.level);
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
  const activeCategory = game.getLevelCategory(slides[activeIndex]?.level ?? '');

  const handleSelect = (idx: number) => {
    onSelect(idx);
    onHide();
  };

  return (
    <Offcanvas
      show={show}
      onHide={onHide}
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
                  <div className="level-nav-list">
                    {sections[cat].map(({ label, idx }) => (
                      <button
                        key={idx}
                        className={`level-nav-item${idx === activeIndex ? ' active' : ''}`}
                        onClick={() => handleSelect(idx)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Offcanvas.Body>
    </Offcanvas>
  );
}
