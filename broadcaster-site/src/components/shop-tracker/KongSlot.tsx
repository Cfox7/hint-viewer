import { FaCheck } from 'react-icons/fa';
import { KONG_COLORS } from '@hint-viewer/shared/games/dk64-shops';
import type { ShopKongState } from '@hint-viewer/shared/shop-tracker-types';
import { SHOP_KONG_STATE } from '@hint-viewer/shared/shop-tracker-types';

interface KongSlotProps {
  kong: string;
  kongState: ShopKongState;
  itemLabel: string | undefined;
  onAdvanceKong: () => void;
  onRetreatKong: () => void;
  onCycleItem: (direction: 1 | -1) => void;
  readOnly?: boolean;
}

export function KongSlot({ kong, kongState, itemLabel, onAdvanceKong, onRetreatKong, onCycleItem, readOnly = false }: KongSlotProps) {
  const color = KONG_COLORS[kong] ?? '#888';
  const isActive = kongState >= SHOP_KONG_STATE.HAS_ITEM;
  const isBought = kongState === SHOP_KONG_STATE.BOUGHT;

  return (
    <div className="kong-slot">
      <button
        className="kong-toggle"
        style={{
          backgroundColor: color,
          opacity: isActive ? 1 : 0.25,
          cursor: readOnly ? 'default' : undefined,
        }}
        onClick={readOnly ? undefined : onAdvanceKong}
        onContextMenu={readOnly ? undefined : (e) => { e.preventDefault(); onRetreatKong(); }}
        aria-label={`${kong}: ${isBought ? 'bought' : isActive ? 'has item' : 'empty'}`}
        title={kong}
      >
        {isBought && <FaCheck className="kong-toggle-check" />}
      </button>
      <button
        className={`item-cycle${isActive ? '' : ' item-cycle-hidden'}`}
        style={{ cursor: readOnly ? 'default' : undefined }}
        onClick={readOnly ? undefined : () => { if (isActive) onCycleItem(1); }}
        onContextMenu={readOnly ? undefined : (e) => { e.preventDefault(); if (isActive) onCycleItem(-1); }}
        aria-label={itemLabel ?? 'No item selected'}
        title={itemLabel ?? 'Click to set item'}
        tabIndex={isActive && !readOnly ? 0 : -1}
      >
        {isActive ? (itemLabel ? abbreviateItem(itemLabel) : '?') : ''}
      </button>
    </div>
  );
}

const ITEM_ABBREVIATIONS: Record<string, string> = {
  'Golden Banana': 'GB',
  Potion: 'Potion',
  Key: 'Key',
  Bean: 'Bean',
  Pearl: 'Pearl',
  Blueprint: 'BP',
  'Nintendo Coin': 'NC',
  'Rareware Coin': 'RW',
  Shop: 'Shop',
  Fairy: 'Fairy',
  Medal: 'Medal',
  Crown: 'Crown',
  'Rainbow Coin': 'RC',
};

function abbreviateItem(item: string): string {
  return ITEM_ABBREVIATIONS[item] ?? item;
}
