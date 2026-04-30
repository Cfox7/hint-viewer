import type { GameConfig, LevelCategory, SpoilerLog } from './types';
import DkHome from '../../broadcaster-site/src/components/DkHome';

const levelDisplayNames: Record<string, string> = {
  Isles: "DK Isles",
  Japes: "Jungle Japes",
  Aztec: "Angry Aztec",
  Factory: "Frantic Factory",
  Galleon: "Gloomy Galleon",
  Fungi: "Fungi Forest",
  Caves: "Crystal Caves",
  Castle: "Creepy Castle",
  Helm: "Hideout Helm",
  Direct: "Direct Hints",
  Direct_Instrument: "Direct Instrument Hints",
  Direct_Shop: "Direct Shop Hints",
  Foolish: "Foolish Hints",
  WOTH: "Way Of The Hoard",
};

const BATCH_COUNT = 10;
const batchNames = Array.from({ length: BATCH_COUNT }, (_, i) => `Batch${i + 1}`);
const baseOrder = Object.keys(levelDisplayNames);
baseOrder.splice(8, 0, ...batchNames);
const levelOrder = baseOrder;
const backgroundImage = './assets/bgfinal.webp';

const sectionLabels: Record<LevelCategory, string> = {
  regions: 'Levels',
  direct: 'Direct',
  foolish: 'Foolish',
  woth: 'Way of the Hoard',
};

const hintOrder: string[] = [
  "DK",
  "Diddy",
  "Lanky",
  "Tiny",
  "Chunky"
];

const instrumentOrder: string[] = [
  "Bongos",
  "Guitar",
  "Trombone",
  "Saxophone",
  "Triangle"
];

const shopOrder: string[] = [
  "Cranky",
  "Candy",
  "Funky",
  "Snide"
];

const hintedItemOptions: string[] = [
  // Kongs
  'Donkey Kong',
  'Diddy Kong',
  'Lanky Kong',
  'Tiny Kong',
  'Chunky Kong',
  // Shared moves
  'Vines',
  'Swim',
  'Oranges',
  'Barrels',
  'Climbing',
  'Progressive Slam',
  'Progressive Slam 2',
  // DK moves
  'Baboon Blast',
  'Strong Kong',
  'Gorilla Grab',
  // Diddy moves
  'Chimpy Charge',
  'Rocketbarrel Boost',
  'Simian Spring',
  // Lanky moves
  'Orangstand',
  'Baboon Balloon',
  'Orangstand Sprint',
  // Tiny moves
  'Mini Monkey',
  'Ponytail Twirl',
  'Monkeyport',
  // Chunky moves
  'Hunky Chunky',
  'Primate Punch',
  'Gorilla Gone',
  // Guns
  'Coconut',
  'Peanut',
  'Grape',
  'Feather',
  'Pineapple',
  'Homing Ammo',
  'Sniper Sight',
  'Progressive Ammo Belt',
  'Progressive Ammo Belt 2',
  // Instruments
  'Bongos',
  'Guitar',
  'Trombone',
  'Saxophone',
  'Triangle',
  'Progressive Instrument Upgrade',
  'Progressive Instrument Upgrade 2',
  'Progressive Instrument Upgrade 3',
  // Special items
  'Camera',
  'Shockwave',
  'Camera & Shockwave',
  'Nintendo Coin',
  'Rareware Coin',
  // Keys
  'Key 1',
  'Key 2',
  'Key 3',
  'Key 4',
  'Key 5',
  'Key 6',
  'Key 7',
  'Key 8',
  // Collectibles
  'Golden Banana',
  'Banana Fairy',
  'Banana Medal',
  'Battle Crown',
  'Bean',
  'Pearl',
  'Rainbow Coin',
  // Shop NPCs
  'Cranky',
  'Funky',
  'Candy',
  'Snide',
];

interface DKSpoilerLog {
  "Wrinkly Hints": Record<string, string>;
  "Direct Item Hints"?: Record<string, string>;
  "Progressive Hint Item"?: string;
  "Progressive Hint Cap"?: number | string;
  Settings?: {
    "Progressive Hint Item"?: string;
    "Progressive Hint Cap"?: number | string;
    [key: string]: unknown;
  };
}

function getLevelCategory(level: string): LevelCategory {
  if (level.startsWith('Direct')) return 'direct';
  if (level === 'Foolish') return 'foolish';
  if (level === 'WOTH') return 'woth';
  return 'regions';
}

function getProgressiveHintValues(raw: DKSpoilerLog) {
  const settings = raw.Settings ?? {};
  const itemRaw = settings['Progressive Hint Item'];
  const capRaw = settings['Progressive Hint Cap'];
  const item = itemRaw == null ? undefined : String(itemRaw);
  const cap = item !== undefined && capRaw != null ? Number(capRaw) : undefined;
  return { progressiveHints: Boolean(item), item, cap };
}

function normalize(raw: unknown): SpoilerLog {
  const input = raw as DKSpoilerLog;
  const wrinkly: Record<string, string> = { ...(input['Wrinkly Hints'] ?? {}) };

  const progHints = getProgressiveHintValues(input);
  if (progHints.progressiveHints) {
    const batchSize = 4;
    const keys = Object.keys(wrinkly).filter((k) => !k.startsWith('First'));
    const newHints: Record<string, string> = {};
    const customSizes: Record<number, number> = { 9: 2, 10: 1 };

    let batchIndex = 1;
    let countInBatch = 0;
    let currentBatchSize = customSizes[batchIndex] ?? batchSize;

    keys.forEach((k, idx) => {
      if (countInBatch >= currentBatchSize) {
        batchIndex++;
        countInBatch = 0;
        currentBatchSize = customSizes[batchIndex] ?? batchSize;
      }
      const withinIndex = countInBatch + 1;
      const newKey = `Batch${batchIndex} ${withinIndex}`;
      newHints[newKey !== undefined && newHints[newKey] !== undefined ? `${newKey}-${idx}` : newKey] = wrinkly[k];
      countInBatch++;
    });

    Object.keys(wrinkly).forEach((k) => delete wrinkly[k]);
    Object.assign(wrinkly, newHints);
  }

  let foolishCount = 1;
  let wothCount = 1;

  for (const key of Object.keys(wrinkly)) {
    const val = wrinkly[key];
    if (key.startsWith('First')) {
      delete wrinkly[key];
      continue;
    }
    if (val.toLowerCase().includes('foolish')) {
      const foolishKey = `Foolish ${foolishCount++}`;
      if (!(foolishKey in wrinkly)) wrinkly[foolishKey] = val;
    }
    if (val.toLowerCase().includes('way of the hoard')) {
      const wothKey = `WOTH ${wothCount++}`;
      if (!(wothKey in wrinkly)) wrinkly[wothKey] = val;
    }
  }

  const direct = input['Direct Item Hints'];
  const shopKeys = ["Cranky", "Candy", "Funky", "Snide"];
  const instrumentKeys = ["Bongos", "Guitar", "Trombone", "Saxophone", "Triangle"];
  if (direct && typeof direct === 'object') {
    for (const [k, v] of Object.entries(direct)) {
      let syntheticKey;
      let value = `${v}`;
      if (shopKeys.includes(k)) {
        syntheticKey = `Direct_Shop ${k}`;
      } else if (instrumentKeys.includes(k)) {
        syntheticKey = `Direct_Instrument ${k}`;
        value = `${k}: ${v}`;
      }
      if (syntheticKey && !(syntheticKey in wrinkly)) wrinkly[syntheticKey] = value;
    }
  }

  return { hints: wrinkly };
}

function sortHints(groupedHints: Record<string, string[]>): Record<string, string[]> {
  const orderMap = Object.fromEntries(hintOrder.map((k, i) => [k, i]));
  const sorted: Record<string, string[]> = {};
  Object.keys(groupedHints).forEach(level => {
    sorted[level] = groupedHints[level].slice().sort((a, b) => {
      const aKong = a.split(' ')[1] || a;
      const bKong = b.split(' ')[1] || b;
      const aOrder = orderMap[aKong];
      const bOrder = orderMap[bKong];
      if (aOrder !== undefined && bOrder !== undefined) {
        return aOrder - bOrder;
      }
      // Numeric sort for WOTH and Foolish
      const aNum = Number(aKong);
      const bNum = Number(bKong);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return aNum - bNum;
      }
      // Fallback: alphabetical
      return aKong.localeCompare(bKong, undefined, { numeric: true, sensitivity: 'base' });
    });
  });
  return sorted;
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

function getEmptyHintTemplate(isProgressive = false): Record<string, string> {
  const template: Record<string, string> = {};
  const filteredLevels = Object.keys(levelDisplayNames).filter(
    key => key !== 'Isles' &&
      !key.startsWith('Direct') &&
      key !== 'Helm' &&
      key !== 'Foolish' &&
      key !== 'WOTH'
  );
  hintOrder.forEach(kong => {
    filteredLevels.forEach(level => {
      template[`${level} ${kong}`] = '';
    });
  });

  // Add Direct_Instrument keys in instrumentOrder
  instrumentOrder.forEach(instr => {
    template[`Direct_Instrument ${instr}`] = '';
  });

  // Add Direct_Shop keys in shopOrder
  shopOrder.forEach(shop => {
    template[`Direct_Shop ${shop}`] = '';
  });

  if (isProgressive) {
    const batchNamesLocal = Array.from({ length: BATCH_COUNT }, (_, i) => `Batch${i + 1}`);
    batchNamesLocal.forEach(batch => {
      template[batch] = '';
    });
  }
  return template;
}

export const dk64Config: GameConfig = {
  id: 'dk64',
  displayName: 'Donkey Kong 64 Randomizer',
  levelDisplayNames,
  levelOrder,
  backgroundImage,
  sectionLabels,
  hintOrder,
  hintedItemOptions,
  getLevelCategory,
  normalize,
  sortHints,
  getLevelTitle,
  getEmptyHintTemplate,
  homeComponent: DkHome,
  toServerPayload: (hints): Record<string, unknown> => ({ "Wrinkly Hints": hints }),
  fromServerPayload: (raw) => {
    const obj = raw as Record<string, unknown>;
    if ('hints' in obj) return obj as unknown as SpoilerLog;
    return { hints: (obj['Wrinkly Hints'] ?? {}) as Record<string, string> };
  },
};
