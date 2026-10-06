import type { SearchableRegion } from '@hint-viewer/shared/games/types';

export interface HintEntry {
  location: string;
  cleanedText: string;
  lowerText: string;
}

export interface HintIndex {
  regionIndex: Map<string, Set<string>>;
  entries: HintEntry[];
}

function cleanHintText(text: string): string {
  return text.split('|')[0].replace(/#/g, '').trim();
}

export function buildHintIndex(
  hints: Record<string, string>,
  regions: SearchableRegion[],
): HintIndex {
  const entries: HintEntry[] = Object.entries(hints).map(([location, raw]) => {
    const cleanedText = cleanHintText(raw);
    return { location, cleanedText, lowerText: cleanedText.toLowerCase() };
  });

  const regionIndex = new Map<string, Set<string>>();

  for (const region of regions) {
    const patterns = region.aliases.map(
      (alias) => new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i'),
    );
    const matching = new Set<string>();

    for (const entry of entries) {
      if (patterns.some((p) => p.test(entry.cleanedText))) {
        matching.add(entry.location);
      }
    }

    if (matching.size > 0) {
      regionIndex.set(region.key, matching);
    }
  }

  return { regionIndex, entries };
}
