export interface Slide {
  level: string;
  pageIndex: number;
  locations: string[];
}

export interface BuildSlidesConfig {
  levelOrder: string[];
  sortHints: (grouped: Record<string, string[]>) => Record<string, string[]>;
  getLevelCategory: (level: string) => string;
  regionMerges?: [string, string][];
  hintsPerPage: { direct: number; foolish: number; woth: number };
}

export function buildSlides(
  hints: Record<string, string>,
  config: BuildSlidesConfig
): {
  slides: Slide[];
  levels: string[];
  groupedHints: Record<string, string[]>;
} {
  const { levelOrder, sortHints, getLevelCategory, regionMerges, hintsPerPage } = config;

  const mergeMap: Record<string, string> = {};
  if (regionMerges) {
    for (const [a, b] of regionMerges) {
      const merged = `${a} + ${b}`;
      mergeMap[a] = merged;
      mergeMap[b] = merged;
    }
  }

  const groupedHints: Record<string, string[]> = {};
  Object.keys(hints).forEach((location) => {
    const raw = location.split(' ')[0];
    const level = mergeMap[raw] ?? raw;
    if (!groupedHints[level]) groupedHints[level] = [];
    groupedHints[level].push(location);
  });

  const levels = Object.keys(groupedHints)
    .filter((level) => levelOrder.includes(level))
    .sort((a, b) => levelOrder.indexOf(a) - levelOrder.indexOf(b));

  const sortedHints = sortHints(groupedHints);

  const slides: Slide[] = [];
  levels.forEach((level) => {
    const locs = (sortedHints[level] || []);
    const category = getLevelCategory(level);
    let perPage = locs.length || 1;
    if (category === 'direct') perPage = hintsPerPage.direct;
    else if (category === 'foolish') perPage = hintsPerPage.foolish;
    else if (category === 'woth') perPage = hintsPerPage.woth;
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
