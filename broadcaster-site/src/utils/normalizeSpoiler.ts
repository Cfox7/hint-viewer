import type { SpoilerLog } from '../types';

export function normalizeSpoiler(raw: SpoilerLog): SpoilerLog {
  const json: SpoilerLog = { ...raw };
  if (!json['Wrinkly Hints']) json['Wrinkly Hints'] = {};

  const progHints = getProgressiveHintValues(raw);
  if (progHints.progressiveHints) {
    const batchSize = 4; // Progressive is always in batches of 4
    const orig = json['Wrinkly Hints'] || {};
    // skip keys that start with 'First'
    const keys = Object.keys(orig).filter((k) => !k.startsWith('First'));
    const newHints: Record<string, string> = {};

    // default batches of 4, but override final batches as requested
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
      if (newHints[newKey] !== undefined) {
        newHints[`${newKey}-${idx}`] = orig[k];
      } else {
        newHints[newKey] = orig[k];
      }

      countInBatch++;
    });

    json['Wrinkly Hints'] = newHints;
  }

  const keys = Object.keys(json['Wrinkly Hints']);
  let foolishCount = 1;
  let wothCount = 1;

  for (const key of keys) {
    const val = json['Wrinkly Hints'][key];
    if (key.startsWith('First')) {
      delete json['Wrinkly Hints'][key];
      continue;
    }
    if (typeof val === 'string' && val.toLowerCase().includes('foolish')) {
      const foolishKey = `Foolish ${foolishCount++}`;
      if (!(foolishKey in json['Wrinkly Hints'])) json['Wrinkly Hints'][foolishKey] = val;
    }
    if (typeof val === 'string' && val.toLowerCase().includes('way of the hoard')) {
      const wothKey = `WOTH ${wothCount++}`;
      if (!(wothKey in json['Wrinkly Hints'])) json['Wrinkly Hints'][wothKey] = val;
    }
  }

  const direct = json['Direct Item Hints'];
  if (direct && typeof direct === 'object') {
    for (const [k, v] of Object.entries(direct)) {
      const syntheticKey = `Direct ${k}`;
      if (!(syntheticKey in json['Wrinkly Hints'])) {
        json['Wrinkly Hints'][syntheticKey] = `${k}: ` + v;
      }
    }
    delete (json as any)['Direct Item Hints'];
  }
  return json;
}

/**
 * Return { progressiveHints, cap } where:
 * - progressiveHints is true when a 'Progressive Hint Item' exists
 * - cap is an integer when present and parsable, otherwise undefined
 */
function getProgressiveHintValues(raw: SpoilerLog) {
  const spoiler = raw || ({} as SpoilerLog[]);
  const json = (spoiler as any).Settings ?? {};
  // normalize to a string when present; undefined when absent
  const item = json['Progressive Hint Item'] == null ? undefined : String(json['Progressive Hint Item']);
  const capRaw = json['Progressive Hint Cap'];

  // cap will only exist when an item exists; parse directly to number
  const cap = item !== undefined && capRaw != null ? Number(capRaw) : undefined;

  return { progressiveHints: Boolean(item), item, cap };
}