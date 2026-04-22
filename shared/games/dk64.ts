import type { GameConfig, LevelCategory, SpoilerLog } from './types';

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
  Foolish: "Foolish Hints",
  WOTH: "Way Of The Hoard",
};

const BATCH_COUNT = 10;
const batchNames = Array.from({ length: BATCH_COUNT }, (_, i) => `Batch${i + 1}`);
const baseOrder = Object.keys(levelDisplayNames);
baseOrder.splice(8, 0, ...batchNames);
const levelOrder = baseOrder;

function getLevelCategory(level: string): LevelCategory {
  if (level === 'Direct') return 'direct';
  if (level === 'Foolish') return 'foolish';
  if (level === 'WOTH') return 'woth';
  return 'regions';
}

const sectionLabels: Record<LevelCategory, string> = {
  regions: 'Levels',
  direct: 'Direct',
  foolish: 'Foolish',
  woth: 'Way of the Hoard',
};

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
  if (direct && typeof direct === 'object') {
    for (const [k, v] of Object.entries(direct)) {
      const syntheticKey = `Direct ${k}`;
      if (!(syntheticKey in wrinkly)) wrinkly[syntheticKey] = `${k}: ${v}`;
    }
  }

  return { hints: wrinkly };
}

export const dk64Config: GameConfig = {
  id: 'dk64',
  displayName: 'DK64 Randomizer',
  normalize,
  levelDisplayNames,
  levelOrder,
  getLevelCategory,
  sectionLabels,
  toServerPayload: (hints) => ({ "Wrinkly Hints": hints }),
  fromServerPayload: (raw) => {
    const obj = raw as Record<string, unknown>;
    if ('hints' in obj) return obj as unknown as SpoilerLog;
    return { hints: (obj['Wrinkly Hints'] ?? {}) as Record<string, string> };
  },
};
