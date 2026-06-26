import React from 'react';
import type { GameConfig, LevelCategory, SearchableRegion, SpoilerLog } from './types';
import { highlightParts } from './types';
import OotHome from '../../broadcaster-site/src/components/OotHome';
import { availableSettings, defaultSettings, settingsPresets, extractSettings } from './oot-seed-settings';

const ootColorMap: Record<string, string> = {
  "Red": "#FF5555",
  "Green": "#80FF80",
  "Light Blue": "#6495ED",
  "Yellow": "#FFD700",
  "Pink": "#FF69B4",
  "foolish": "#FF0000",
  "path to": "#FFA010",
};

interface RegionDefinition {
  key: string;
  displayName: string;
  mergeWith?: string;
  abbreviation?: string;
}

const regionDefinitions: RegionDefinition[] = [
  { key: "DMC", displayName: "Death Mountain Crater", mergeWith: "DMT" },
  { key: "DMT", displayName: "Death Mountain Trail" },
  { key: "Dodongos", displayName: "Dodongo's Cavern", mergeWith: "GC", abbreviation: "DC" },
  { key: "GC", displayName: "Goron City" },
  { key: "GV", displayName: "Gerudo Valley", mergeWith: "Colossus" },
  { key: "Colossus", displayName: "Colossus" },
  { key: "Graveyard", displayName: "Graveyard", mergeWith: "Kak" },
  { key: "Kak", displayName: "Kakariko Village" },
  { key: "HC", displayName: "Hyrule Castle" },
  { key: "HF", displayName: "Hyrule Field" },
  { key: "KF", displayName: "Kokiri Forest" },
  { key: "LH", displayName: "Lake Hylia" },
  { key: "LW", displayName: "Lost Woods", mergeWith: "SFM" },
  { key: "SFM", displayName: "Sacred Forest Meadow" },
  { key: "ToT", displayName: "Temple of Time" },
  { key: "ZD", displayName: "Zora's Domain", mergeWith: "ZF" },
  { key: "ZF", displayName: "Zora's Fountain" },
  { key: "ZR", displayName: "Zora's River" },
  { key: "Foolish", displayName: "Foolish Hints" },
  { key: "Path", displayName: "Path/Major Hints" },
];

function deriveRegionData(definitions: RegionDefinition[]) {
  const byKey = new Map(definitions.map(r => [r.key, r]));
  const mergeTargets = new Set(definitions.filter(r => r.mergeWith).map(r => r.mergeWith!));

  const displayNames: Record<string, string> = {};
  const order: string[] = [];
  const merges: [string, string][] = [];
  const abbreviations: Record<string, string> = {};

  for (const region of definitions) {
    // Skip merge partners -- they're handled when processing the primary
    if (mergeTargets.has(region.key)) continue;

    if (region.mergeWith) {
      // Combine into "Key1 + Key2" for grouping and "DisplayName1 + DisplayName2" for titles
      const partner = byKey.get(region.mergeWith)!;
      const mergedKey = `${region.key} + ${region.mergeWith}`;
      displayNames[mergedKey] = `${region.displayName} + ${partner.displayName}`;
      order.push(mergedKey);
      merges.push([region.key, region.mergeWith]);
      // Abbreviations override the hint prefix label (e.g. "Dodongos" -> "DC")
      if (region.abbreviation) abbreviations[region.key] = region.abbreviation;
      if (partner.abbreviation) abbreviations[partner.key] = partner.abbreviation;
    } else {
      displayNames[region.key] = region.displayName;
      order.push(region.key);
    }
  }

  return { displayNames, order, merges, abbreviations };
}

const {
  displayNames: levelDisplayNames,
  order: levelOrder,
  merges: regionMerges,
  abbreviations: regionAbbreviations,
} = deriveRegionData(regionDefinitions);
const backgroundImage = './assets/oot-bg.png';

const sectionLabels: Record<LevelCategory, string> = {
  regions: 'Regions',
  direct: 'Direct',
  foolish: 'Foolish',
  woth: 'Path/Major Hints',
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

const hintedItemOptions: string[] = [
  'Biggoron Sword',
  'Boomerang',
  'Lens of Truth',
  'Megaton Hammer',
  'Iron Boots',
  'Goron Tunic',
  'Zora Tunic',
  'Hover Boots',
  'Mirror Shield',
  'Fire Arrows',
  'Light Arrows',
  'Ice Arrows',
  'Dins Fire',
  'Farores Wind',
  'Nayrus Love',
  'Progressive Hookshot',
  'Progressive Strength Upgrade',
  'Progressive Scale',
  'Progressive Wallet',
  'Magic Meter',
  'Deku Stick Capacity',
  'Deku Nut Capacity',
  'Bow',
  'Slingshot',
  'Bomb Bag',
  'Bombchus',
  'Double Defense',
  'Stone of Agony',
  'Kokiri Emerald',
  'Goron Ruby',
  'Zora Sapphire',
  'Light Medallion',
  'Forest Medallion',
  'Fire Medallion',
  'Water Medallion',
  'Shadow Medallion',
  'Spirit Medallion',
  'Zeldas Lullaby',
  'Eponas Song',
  'Suns Song',
  'Sarias Song',
  'Song of Time',
  'Song of Storms',
  'Minuet of Forest',
  'Prelude of Light',
  'Bolero of Fire',
  'Serenade of Water',
  'Nocturne of Shadow',
  'Requiem of Spirit',
  'Ocarina',
  'Kokiri Sword',
  'Boss Key (Ganons Castle)',
  'Boss Key (Forest Temple)',
  'Boss Key (Fire Temple)',
  'Boss Key (Water Temple)',
  'Boss Key (Shadow Temple)',
  'Boss Key (Spirit Temple)',
  'Gerudo Membership Card',
  'Small Key (Treasure Chest Game)',
  'Small Key (Thieves Hideout)',
  'Small Key (Shadow Temple)',
  'Small Key (Ganons Castle)',
  'Small Key (Forest Temple)',
  'Small Key (Spirit Temple)',
  'Small Key (Fire Temple)',
  'Small Key (Water Temple)',
  'Small Key (Bottom of the Well)',
  'Small Key (Gerudo Training Ground)',
  'Small Key Ring (Treasure Chest Game)',
  'Small Key Ring (Thieves Hideout)',
  'Small Key Ring (Shadow Temple)',
  'Small Key Ring (Ganons Castle)',
  'Small Key Ring (Forest Temple)',
  'Small Key Ring (Spirit Temple)',
  'Small Key Ring (Fire Temple)',
  'Small Key Ring (Water Temple)',
  'Small Key Ring (Bottom of the Well)',
  'Small Key Ring (Gerudo Training Ground)',
  'Magic Bean Pack',
  'Weird Egg',
  'Chicken',
  'Zeldas Letter',
  'Keaton Mask',
  'Skull Mask',
  'Spooky Mask',
  'Bunny Hood',
  'Mask of Truth',
  'Pocket Egg',
  'Pocket Cucco',
  'Cojiro',
  'Odd Mushroom',
  'Odd Potion',
  'Poachers Saw',
  'Broken Sword',
  'Prescription',
  'Eyeball Frog',
  'Eyedrops',
  'Claim Check',
  'Silver Rupee (Dodongos Cavern Staircase)',
  'Silver Rupee (Ice Cavern Spinning Scythe)',
  'Silver Rupee (Ice Cavern Push Block)',
  'Silver Rupee (Bottom of the Well Basement)',
  'Silver Rupee (Shadow Temple Scythe Shortcut)',
  'Silver Rupee (Shadow Temple Invisible Blades)',
  'Silver Rupee (Shadow Temple Huge Pit)',
  'Silver Rupee (Shadow Temple Invisible Spikes)',
  'Silver Rupee (Gerudo Training Ground Slopes)',
  'Silver Rupee (Gerudo Training Ground Lava)',
  'Silver Rupee (Gerudo Training Ground Water)',
  'Silver Rupee (Spirit Temple Child Early Torches)',
  'Silver Rupee (Spirit Temple Adult Boulders)',
  'Silver Rupee (Spirit Temple Lobby and Lower Adult)',
  'Silver Rupee (Spirit Temple Sun Block)',
  'Silver Rupee (Spirit Temple Adult Climb)',
  'Silver Rupee (Ganons Castle Spirit Trial)',
  'Silver Rupee (Ganons Castle Light Trial)',
  'Silver Rupee (Ganons Castle Fire Trial)',
  'Silver Rupee (Ganons Castle Shadow Trial)',
  'Silver Rupee (Ganons Castle Water Trial)',
  'Silver Rupee (Ganons Castle Forest Trial)',
  'Silver Rupee Pouch (Dodongos Cavern Staircase)',
  'Silver Rupee Pouch (Ice Cavern Spinning Scythe)',
  'Silver Rupee Pouch (Ice Cavern Push Block)',
  'Silver Rupee Pouch (Bottom of the Well Basement)',
  'Silver Rupee Pouch (Shadow Temple Scythe Shortcut)',
  'Silver Rupee Pouch (Shadow Temple Invisible Blades)',
  'Silver Rupee Pouch (Shadow Temple Huge Pit)',
  'Silver Rupee Pouch (Shadow Temple Invisible Spikes)',
  'Silver Rupee Pouch (Gerudo Training Ground Slopes)',
  'Silver Rupee Pouch (Gerudo Training Ground Lava)',
  'Silver Rupee Pouch (Gerudo Training Ground Water)',
  'Silver Rupee Pouch (Spirit Temple Child Early Torches)',
  'Silver Rupee Pouch (Spirit Temple Adult Boulders)',
  'Silver Rupee Pouch (Spirit Temple Lobby and Lower Adult)',
  'Silver Rupee Pouch (Spirit Temple Sun Block)',
  'Silver Rupee Pouch (Spirit Temple Adult Climb)',
  'Silver Rupee Pouch (Ganons Castle Spirit Trial)',
  'Silver Rupee Pouch (Ganons Castle Light Trial)',
  'Silver Rupee Pouch (Ganons Castle Fire Trial)',
  'Silver Rupee Pouch (Ganons Castle Shadow Trial)',
  'Silver Rupee Pouch (Ganons Castle Water Trial)',
  'Silver Rupee Pouch (Ganons Castle Forest Trial)',
  'Ocarina A Button',
  'Ocarina C up Button',
  'Ocarina C left Button',
  'Ocarina C down Button',
  'Ocarina C right Button',
  'Triforce Piece',
  'Gold Skulltula Token',
  'Rutos Letter',
];

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
    const majorMatch = stripped.match(/(\d+)\s*major/);
    if (stripped.includes('foolish') || (majorMatch && majorMatch[1] === '0')) {
      result[`Foolish ${foolishCount++}`] = val;
    }
    if (stripped.includes('path to') || (majorMatch && majorMatch[1] !== '0')) {
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

function colorizeHints(text: string, highlight?: string): React.ReactNode {
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

  let finalParts: React.ReactNode[] = parts.flatMap((part, partIndex) => {
    if (typeof part !== 'string') return [part];
    return part.split(/\b(foolish|path to)\b/gi).map((seg, segIndex) => {
      const color = ootColorMap[seg.toLowerCase()];
      if (color) return React.createElement('span', { style: { color }, key: `kw-${partIndex}-${segIndex}` }, seg);
      return seg;
    });
  });

  if (highlight) {
    finalParts = highlightParts(finalParts, highlight, colorIndex);
  }

  return React.createElement(React.Fragment, null, ...finalParts);
}

function getLocationLabel(location: string, level: string): string {
  const match = location.match(/\((.+)\)/);
  const label = match ? match[1] : location;
  if (level.includes(' + ')) {
    const prefix = location.split(' ')[0];
    return `${regionAbbreviations[prefix] ?? prefix} ${label}`;
  }
  return label;
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

const searchableRegions: SearchableRegion[] = [
  { key: 'DMC', displayName: 'Death Mountain Crater', aliases: ['dmc', 'death mountain crater'] },
  { key: 'DMT', displayName: 'Death Mountain Trail', aliases: ['dmt', 'death mountain trail'] },
  { key: 'Dodongos', displayName: "Dodongo's Cavern", aliases: ['dodongos', "dodongo's cavern", 'dodongo'] },
  { key: 'GC', displayName: 'Goron City', aliases: ['gc', 'goron city', 'goron'] },
  { key: 'GV', displayName: 'Gerudo Valley', aliases: ['gv', 'gerudo valley', 'gerudo'] },
  { key: 'Colossus', displayName: 'Colossus', aliases: ['colossus', 'spirit temple'] },
  { key: 'Graveyard', displayName: 'Graveyard', aliases: ['graveyard', 'shadow temple'] },
  { key: 'Kak', displayName: 'Kakariko Village', aliases: ['kak', 'kakariko'] },
  { key: 'HC', displayName: 'Hyrule Castle', aliases: ['hc', 'hyrule castle', 'hyrule'] },
  { key: 'HF', displayName: 'Hyrule Field', aliases: ['hf', 'hyrule field'] },
  { key: 'KF', displayName: 'Kokiri Forest', aliases: ['kf', 'kokiri forest', 'kokiri'] },
  { key: 'LH', displayName: 'Lake Hylia', aliases: ['lh', 'lake hylia', 'water temple'] },
  { key: 'LW', displayName: 'Lost Woods', aliases: ['lw', 'lost woods', 'forest temple'] },
  { key: 'SFM', displayName: 'Sacred Forest Meadow', aliases: ['sfm', 'sacred forest meadow'] },
  { key: 'ToT', displayName: 'Temple of Time', aliases: ['tot', 'temple of time'] },
  { key: 'ZD', displayName: "Zora's Domain", aliases: ['zd', "zora's domain", 'zora'] },
  { key: 'ZF', displayName: "Zora's Fountain", aliases: ['zf', "zora's fountain"] },
  { key: 'ZR', displayName: "Zora's River", aliases: ['zr', "zora's river"] },
  { key: 'Path', displayName: 'Path/Major Hints', color: '#FFA010', aliases: ['path', 'woth', 'path to'] },
  { key: 'Foolish', displayName: 'Foolish', color: '#FF0000', aliases: ['foolish'] },
];

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
  availableSettings,
  defaultSettings,
  settingsPresets,
  extractSettings,
  regionMerges,
  searchableRegions,
  toServerPayload: (hints): Record<string, unknown> => ({ gossip_stones: hints }),
  fromServerPayload: (raw) => {
    const obj = raw as Record<string, unknown>;
    if ('hints' in obj) return obj as unknown as SpoilerLog;
    return { hints: (obj['gossip_stones'] ?? {}) as Record<string, string> };
  },
  validateSpoilerLog: (raw) => {
    const obj = raw as Record<string, unknown>;
    return 'gossip_stones' in obj;
  },
};
