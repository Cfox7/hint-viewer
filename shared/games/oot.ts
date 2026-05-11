import React from 'react';
import type { GameConfig, LevelCategory, SpoilerLog } from './types';
import OotHome from '../../broadcaster-site/src/components/OotHome';

const ootColorMap: Record<string, string> = {
  "Red": "#FF5555",
  "Green": "#80FF80",
  "Light Blue": "#6495ED",
  "Yellow": "#FFD700",
  "Pink": "#FF69B4",
  "foolish": "#FF0000",
  "path to": "#FFA010",
};

const levelDisplayNames: Record<string, string> = {
  Colossus: "Colossus",
  DMC: "Death Mountain Crater",
  DMT: "Death Mountain Trail",
  Dodongos: "Dodongo's Cavern",
  GC: "Goron City",
  GV: "Gerudo Valley",
  Graveyard: "Graveyard",
  HC: "Hyrule Castle",
  HF: "Hyrule Field",
  KF: "Kokiri Forest",
  Kak: "Kakariko Village",
  LH: "Lake Hylia",
  LW: "Lost Woods",
  SFM: "Sacred Forest Meadow",
  ToT: "Temple of Time",
  ZD: "Zora's Domain",
  ZF: "Zora's Fountain",
  ZR: "Zora's River",
  Foolish: "Foolish Hints",
  Path: "Path Hints",
};

const levelOrder = Object.keys(levelDisplayNames);
const backgroundImage = './assets/oot-bg.png';

const sectionLabels: Record<LevelCategory, string> = {
  regions: 'Regions',
  direct: 'Direct',
  foolish: 'Foolish',
  woth: 'Path Hints',
};

const gossipStoneNames: string[] = [
  "Colossus (Spirit Temple)",
  "DMC (Bombable Wall)",
  "DMC (Upper Grotto)",
  "DMT (Biggoron)",
  "DMT (Storms Grotto)",
  "Dodongos Cavern (Bombable Wall)",
  "GC (Maze)",
  "GC (Medigoron)",
  "GV (Waterfall)",
  "Graveyard (Shadow Temple)",
  "HC (Malon)",
  "HC (Rock Wall)",
  "HC (Storms Grotto)",
  "HF (Cow Grotto)",
  "HF (Near Market Grotto)",
  "HF (Open Grotto)",
  "HF (Southeast Grotto)",
  "KF (Deku Tree Left)",
  "KF (Deku Tree Right)",
  "KF (Outside Storms)",
  "KF (Storms Grotto)",
  "Kak (Open Grotto)",
  "LH (Lab)",
  "LH (Southeast Corner)",
  "LH (Southwest Corner)",
  "LW (Bridge)",
  "LW (Near Shortcuts Grotto)",
  "SFM (Maze Lower)",
  "SFM (Maze Upper)",
  "SFM (Saria)",
  "ToT (Left)",
  "ToT (Left-Center)",
  "ToT (Right)",
  "ToT (Right-Center)",
  "ZD (Mweep)",
  "ZF (Fairy)",
  "ZF (Jabu)",
  "ZR (Near Domain)",
  "ZR (Near Grottos)",
  "ZR (Open Grotto)",
];

const hintedItemOptions: string[] = [];

interface GossipStoneHint {
  text: string;
  colors: string[];
  hinted_locations?: string[];
  hinted_items?: string[];
}

interface OotSpoilerLog {
  gossip_stones: Record<string, GossipStoneHint>;
}

function getLevelCategory(level: string): LevelCategory {
  if (level === 'Foolish') return 'foolish';
  if (level === 'Path') return 'woth';
  return 'regions';
}

function categorizeHints(hints: Record<string, string>): Record<string, string> {
  const result = { ...hints };

  Object.keys(result).filter(k => k.startsWith('Foolish') || k.startsWith('Path')).forEach(k => delete result[k]);

  let foolishCount = 1;
  let pathCount = 1;

  const nonCategoryValues = Object.entries(result)
    .filter(([k]) => !k.startsWith('Foolish') && !k.startsWith('Path'))
    .map(([, v]) => v);

  for (const val of nonCategoryValues) {
    const stripped = val.replace(/#/g, '').toLowerCase();
    if (stripped.includes('foolish') || stripped.includes('0 major')) {
      result[`Foolish ${foolishCount++}`] = val;
    }
    if (stripped.includes('path to')) {
      result[`Path ${pathCount++}`] = val;
    }
  }

  return result;
}

function normalize(raw: unknown): SpoilerLog {
  const input = raw as OotSpoilerLog;
  const stones = input.gossip_stones ?? {};
  const hints: Record<string, string> = {};

  for (const [stoneName, stoneData] of Object.entries(stones)) {
    const colorSuffix = stoneData.colors.length > 0 ? `|${stoneData.colors.join(',')}` : '';
    hints[stoneName] = `${stoneData.text.replace(/\^/g, '')}${colorSuffix}`;
  }

  return { hints: categorizeHints(hints) };
}

function sortHints(groupedHints: Record<string, string[]>): Record<string, string[]> {
  const sorted: Record<string, string[]> = {};
  for (const level of Object.keys(groupedHints)) {
    sorted[level] = groupedHints[level].slice().sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
    );
  }
  return sorted;
}

function colorizeHints(text: string): React.ReactNode {
  if (!text) return null;
  const [hintText, colorStr] = text.split('|');
  const colors = colorStr ? colorStr.split(',').map(c => c.trim()) : [];

  const parts: React.ReactNode[] = [];
  let colorIndex = 0;
  let remaining = hintText;

  while (remaining.length > 0) {
    const start = remaining.indexOf('#');
    if (start === -1) {
      parts.push(remaining);
      break;
    }
    const end = remaining.indexOf('#', start + 1);
    if (end === -1) {
      parts.push(remaining);
      break;
    }

    if (start > 0) {
      parts.push(remaining.slice(0, start));
    }

    const segment = remaining.slice(start + 1, end);
    const color = ootColorMap[colors[colorIndex]] ?? 'inherit';
    parts.push(
      React.createElement('span', { style: { color }, key: colorIndex }, segment)
    );
    colorIndex++;
    remaining = remaining.slice(end + 1);
  }

  const finalParts = parts.flatMap((part, partIndex) => {
    if (typeof part !== 'string') return [part];
    return part.split(/\b(foolish|path to)\b/gi).map((seg, segIndex) => {
      const color = ootColorMap[seg.toLowerCase()];
      if (color) return React.createElement('span', { style: { color }, key: `kw-${partIndex}-${segIndex}` }, seg);
      return seg;
    });
  });

  return React.createElement(React.Fragment, null, ...finalParts);
}

function getLocationLabel(location: string): string {
  const match = location.match(/\((.+)\)/);
  return match ? match[1] : location;
}

function getLevelTitle(
  slide: { level: string; pageIndex: number } | undefined,
  slideCountByLevel: Record<string, number>,
  levelDisplayNames: Record<string, string>
) {
  if (!slide) return 'Hints';
  const displayName = (levelDisplayNames[slide.level] || slide.level).replace(/([A-Za-z])(\d)/, '$1 $2');
  const total = slideCountByLevel[slide.level] ?? 1;
  if (total > 1) {
    return `${displayName}  ·  ${slide.pageIndex} / ${total}`;
  }
  return displayName;
}

function getEmptyHintTemplate(): Record<string, string> {
  const template: Record<string, string> = {};
  for (const stone of gossipStoneNames) {
    template[stone] = '';
  }
  return template;
}

export const ootConfig: GameConfig = {
  id: 'oot',
  displayName: 'Ocarina of Time Randomizer',
  levelDisplayNames,
  levelOrder,
  backgroundImage,
  sectionLabels,
  hintOrder: gossipStoneNames,
  hintedItemOptions,
  colorizeHints,
  getLocationLabel,
  getLevelCategory,
  normalize,
  sortHints,
  getLevelTitle,
  categorizeHints,
  getEmptyHintTemplate,
  homeComponent: OotHome,
  toServerPayload: (hints): Record<string, unknown> => ({ gossip_stones: hints }),
  fromServerPayload: (raw) => {
    const obj = raw as Record<string, unknown>;
    if ('hints' in obj) return obj as unknown as SpoilerLog;
    return { hints: (obj['gossip_stones'] ?? {}) as Record<string, string> };
  },
};
