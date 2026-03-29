export const levelDisplayNames: Record<string, string> = {
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

export type LevelCategory = 'levels' | 'direct' | 'foolish' | 'woth';

export function getLevelCategory(level: string): LevelCategory {
  if (level === 'Direct') return 'direct';
  if (level === 'Foolish') return 'foolish';
  if (level === 'WOTH') return 'woth';
  return 'levels';
}

const BATCH_COUNT = 10;
const batchNames = Array.from({ length: BATCH_COUNT }, (_, i) => `Batch${i + 1}`);
const baseOrder = Object.keys(levelDisplayNames);
baseOrder.splice(8, 0, ...batchNames);
export const levelOrder = baseOrder;
