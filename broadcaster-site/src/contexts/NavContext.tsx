import { createContext, useContext, useState } from 'react';
import type { Slide } from '../utils/buildSlides';

interface NavContextValue {
  slides: Slide[];
  activeIndex: number;
  setSlides: (slides: Slide[]) => void;
  setActiveIndex: (idx: number) => void;
}

const NavContext = createContext<NavContextValue>({
  slides: [],
  activeIndex: 0,
  setSlides: () => {},
  setActiveIndex: () => {},
});

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  return (
    <NavContext.Provider value={{ slides, activeIndex, setSlides, setActiveIndex }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  return useContext(NavContext);
}
