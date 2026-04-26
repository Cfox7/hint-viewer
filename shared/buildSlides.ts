export interface Slide {
  level: string;
  pageIndex: number;
  locations: string[];
}

export function buildSlides(
  hints: Record<string, string>,
  levelOrder: string[],
  sortHints: (grouped: Record<string, string[]>) => Record<string, string[]>,
  DIRECT_HINTS_PER_PAGE: number,
  FOOLISH_HINTS_PER_PAGE: number,
  WOTH_HINTS_PER_PAGE: number
): {
  slides: Slide[];
  levels: string[];
  groupedHints: Record<string, string[]>;
} {
  const groupedHints: Record<string, string[]> = {};
  Object.keys(hints).forEach((location) => {
    const level = location.split(' ')[0];
    if (!groupedHints[level]) groupedHints[level] = [];
    groupedHints[level].push(location);
  });

  const levels = Object.keys(groupedHints)
    .filter((level) => levelOrder.includes(level))
    .sort((a, b) => levelOrder.indexOf(a) - levelOrder.indexOf(b));

  // Use the provided sortHints function for game-specific sorting
  const sortedHints = sortHints(groupedHints);

  const slides: Slide[] = [];
  levels.forEach((level) => {
    const locs = (sortedHints[level] || []);
    let perPage = locs.length || 1;
    if (level.startsWith('Direct')) perPage = DIRECT_HINTS_PER_PAGE;
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
