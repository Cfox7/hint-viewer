import { createContext, useContext, useState } from 'react';
import type { Slide } from '@hint-viewer/shared/buildSlides';

interface NavContextValue {
  slides: Slide[];
  activeIndex: number;
  revealedHints: Set<string>;
  completedHints: Set<string>;
  setSlides: (slides: Slide[]) => void;
  setActiveIndex: (idx: number) => void;
  setRevealedHints: (hints: Set<string>) => void;
  setCompletedHints: (hints: Set<string>) => void;
}

const EMPTY_SET = new Set<string>();

const NavContext = createContext<NavContextValue>({
  slides: [],
  activeIndex: 0,
  revealedHints: EMPTY_SET,
  completedHints: EMPTY_SET,
  setSlides: () => {},
  setActiveIndex: () => {},
  setRevealedHints: () => {},
  setCompletedHints: () => {},
});

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [revealedHints, setRevealedHints] = useState<Set<string>>(EMPTY_SET);
  const [completedHints, setCompletedHints] = useState<Set<string>>(EMPTY_SET);
  return (
    <NavContext.Provider value={{ slides, activeIndex, revealedHints, completedHints, setSlides, setActiveIndex, setRevealedHints, setCompletedHints }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  return useContext(NavContext);
}
