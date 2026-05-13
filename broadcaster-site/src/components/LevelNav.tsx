import { useState } from 'react';
import { Offcanvas, Accordion } from 'react-bootstrap';
import { FaCheck } from 'react-icons/fa';
import { useGame } from '../contexts/GameContext';
import { useNav } from '../contexts/NavContext';
import type { LevelCategory } from '@hint-viewer/shared/games/types';

export interface LevelSlide {
  level: string;
  pageIndex: number;
}

export interface LevelNavProps {
  slides: LevelSlide[];
  activeIndex: number;
  onSelect: (index: number) => void;
  levelDisplayNames: Record<string, string>;
  mode?: 'offcanvas' | 'sidebar';
}

const SECTION_ORDER: LevelCategory[] = ['regions', 'direct', 'foolish', 'woth'];

type SlideStatus = 'empty' | 'revealed' | 'complete';

function getSlideStatus(locations: string[], revealedHints: Set<string>, completedHints: Set<string>): SlideStatus {
  if (locations.length === 0) return 'empty';
  const allCompleted = locations.every((loc) => completedHints.has(loc));
  if (allCompleted) return 'complete';
  const anyRevealed = locations.some((loc) => revealedHints.has(loc));
  if (anyRevealed) return 'revealed';
  return 'empty';
}

export function LevelNav({ slides, activeIndex, onSelect, levelDisplayNames, mode = 'offcanvas' }: LevelNavProps) {
  const [show, setShow] = useState(false);
  const { game } = useGame();
  const { revealedHints, completedHints, slides: navSlides } = useNav();
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

  const activeCategory = game.getLevelCategory(slides[activeIndex]?.level ?? '');

  const accordionContent = (
    <Accordion defaultActiveKey={activeCategory} flush>
      {SECTION_ORDER.filter((cat) => sections[cat].length > 0).map((cat) => (
        <Accordion.Item key={cat} eventKey={cat}>
          <Accordion.Header>{sectionLabels[cat]}</Accordion.Header>
          <Accordion.Body className="p-1">
            <div className="level-nav-chips">
              {sections[cat].map(({ label, idx }) => {
                const status = cat !== 'foolish'
                  ? getSlideStatus(navSlides[idx]?.locations ?? [], revealedHints, completedHints)
                  : 'empty';
                return (
                  <button
                    key={idx}
                    className={`level-nav-chip${idx === activeIndex ? ' active' : ''}`}
                    onClick={() => { onSelect(idx); setShow(false); }}
                  >
                    {label}
                    {status === 'revealed' && <span className="level-nav-dot" />}
                    {status === 'complete' && <FaCheck className="level-nav-check" />}
                  </button>
                );
              })}
            </div>
          </Accordion.Body>
        </Accordion.Item>
      ))}
    </Accordion>
  );

  if (mode === 'sidebar') {
    return (
      <div className="level-nav-sidebar level-nav-offcanvas">
        <div className="level-nav-sidebar-title">Quick Nav</div>
        {accordionContent}
      </div>
    );
  }

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
          <Offcanvas.Title>Levels</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          {accordionContent}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
