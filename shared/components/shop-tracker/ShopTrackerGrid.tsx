import { useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import { DK64_SHOP_LEVELS, DK64_KONGS } from '../../games/dk64-shops';
import { SHOP_KONG_STATE } from '../../shop-tracker-types';
import type { ShopKongState, ShopTrackerKongState, ShopTrackerItemState } from '../../shop-tracker-types';
import { KongSlot } from './KongSlot';

interface ShopTrackerGridProps {
  kongState: ShopTrackerKongState;
  itemState: ShopTrackerItemState;
  assetBasePath: string;
  readOnly?: boolean;
  onAdvanceKong?: (key: string) => void;
  onRetreatKong?: (key: string) => void;
  onCycleItem?: (key: string, direction: 1 | -1) => void;
}

const LEVEL_NAMES = Object.keys(DK64_SHOP_LEVELS);

type LevelStatus = 'empty' | 'active' | 'complete';

function buildKey(level: string, shop: string, kong: string): string {
  return `${level}:${shop}:${kong}`;
}

function getLevelStatus(level: string, kongState: Record<string, number>): LevelStatus {
  const prefix = `${level}:`;
  const levelEntries = Object.entries(kongState).filter(([key]) => key.startsWith(prefix));
  if (levelEntries.length === 0) return 'empty';
  if (levelEntries.some(([, state]) => state === SHOP_KONG_STATE.HAS_ITEM)) return 'active';
  if (levelEntries.some(([, state]) => state === SHOP_KONG_STATE.BOUGHT)) return 'complete';
  return 'empty';
}

export function ShopTrackerGrid({ kongState, itemState, assetBasePath, readOnly = false, onAdvanceKong, onRetreatKong, onCycleItem }: ShopTrackerGridProps) {
  const [activeLevel, setActiveLevel] = useState(LEVEL_NAMES[0]);
  const shops = DK64_SHOP_LEVELS[activeLevel] ?? [];

  return (
    <>
      <div className="shop-tracker-levels">
        {LEVEL_NAMES.map((level) => {
          const status = getLevelStatus(level, kongState);
          return (
            <button
              key={level}
              className={`shop-tracker-level-chip${level === activeLevel ? ' active' : ''}`}
              onClick={() => setActiveLevel(level)}
            >
              {level}
              {status === 'active' && <span className="shop-tracker-level-dot" />}
              {status === 'complete' && <FaCheck className="shop-tracker-level-check" />}
            </button>
          );
        })}
      </div>
      <div className="shop-tracker-grid">
        {shops.map((shop) => (
          <div key={shop} className="shop-tracker-row">
            <span className="shop-tracker-label">
              <img
                src={`${assetBasePath}/shops/${shop.toLowerCase()}.png`}
                alt={shop}
                className="shop-tracker-shop-icon"
                draggable={false}
              />
              {shop}
            </span>
            <div className="shop-tracker-kongs">
              {DK64_KONGS.map((kong) => {
                const key = buildKey(activeLevel, shop, kong);
                return (
                  <KongSlot
                    key={kong}
                    kong={kong}
                    kongState={(kongState[key] ?? SHOP_KONG_STATE.EMPTY) as ShopKongState}
                    itemLabel={itemState[key]}
                    assetBasePath={assetBasePath}
                    onAdvanceKong={onAdvanceKong ? () => onAdvanceKong(key) : undefined}
                    onRetreatKong={onRetreatKong ? () => onRetreatKong(key) : undefined}
                    onCycleItem={onCycleItem ? (dir) => onCycleItem(key, dir) : undefined}
                    readOnly={readOnly}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
