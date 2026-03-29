import { levelOrder } from '@hint-viewer/shared/level_utils';
import type { SpoilerLog } from '../types';

const DIRECT_HINTS_PER_PAGE = 4;
const FOOLISH_HINTS_PER_PAGE = 5;
const WOTH_HINTS_PER_PAGE = 5;

export interface Slide {
  level: string;
  pageIndex: number;
  locations: string[];
}

export function buildSlides(spoilerData: SpoilerLog): {
  slides: Slide[];
  levels: string[];
  groupedHints: Record<string, string[]>;
} {
  const hints = spoilerData['Wrinkly Hints'] || {};

  const groupedHints: Record<string, string[]> = {};
  Object.keys(hints).forEach((location) => {
    const level = location.split(' ')[0];
    if (!groupedHints[level]) groupedHints[level] = [];
    groupedHints[level].push(location);
  });

  const levels = Object.keys(groupedHints)
    .filter((level) => levelOrder.includes(level))
    .sort((a, b) => levelOrder.indexOf(a) - levelOrder.indexOf(b));

  const slides: Slide[] = [];
  levels.forEach((level) => {
    const locs = (groupedHints[level] || []).slice().sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
    let perPage = locs.length || 1;
    if (level === 'Direct') perPage = DIRECT_HINTS_PER_PAGE;
    else if (level === 'Foolish') perPage = FOOLISH_HINTS_PER_PAGE;
    else if (level.toLowerCase() === 'woth' || level === 'WOTH') perPage = WOTH_HINTS_PER_PAGE;
    for (let i = 0; i < locs.length; i += perPage) {
      slides.push({
        level,
        pageIndex: Math.floor(i / perPage) + 1,
        locations: locs.slice(i, i + perPage),
      });
    }
  });

  return { slides, levels, groupedHints };
}
