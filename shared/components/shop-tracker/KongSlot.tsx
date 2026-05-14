import { FaCheck } from 'react-icons/fa';
import type { ShopKongState } from '../../shop-tracker-types';
import { SHOP_KONG_STATE } from '../../shop-tracker-types';

interface KongSlotProps {
  kong: string;
  kongState: ShopKongState;
  itemLabel: string | undefined;
  assetBasePath: string;
  onAdvanceKong?: () => void;
  onRetreatKong?: () => void;
  onCycleItem?: (direction: 1 | -1) => void;
  readOnly?: boolean;
}

export function KongSlot({ kong, kongState, itemLabel, assetBasePath, onAdvanceKong, onRetreatKong, onCycleItem, readOnly = false }: KongSlotProps) {
  const iconSrc = `${assetBasePath}/kongs/${kong.toLowerCase()}.png`;
  const isActive = kongState >= SHOP_KONG_STATE.HAS_ITEM;
  const isBought = kongState === SHOP_KONG_STATE.BOUGHT;

  return (
    <div className="kong-slot">
      <button
        className="kong-toggle"
        style={{
          cursor: readOnly ? 'default' : undefined,
        }}
        onClick={readOnly ? undefined : onAdvanceKong}
        onContextMenu={readOnly ? undefined : (e) => { e.preventDefault(); onRetreatKong?.(); }}
        aria-label={`${kong}: ${isBought ? 'bought' : isActive ? 'has item' : 'empty'}`}
        title={kong}
      >
        <img src={iconSrc} alt={kong} className="kong-toggle-icon" draggable={false} style={{ opacity: isBought ? 0.75 : isActive ? 1 : 0.25 }} />
        {isBought && <FaCheck className="kong-toggle-check" />}
      </button>
      <button
        className={`item-cycle${isActive ? '' : ' item-cycle-hidden'}`}
        style={{ cursor: readOnly ? 'default' : undefined }}
        onClick={readOnly ? undefined : () => { if (isActive) onCycleItem?.(1); }}
        onContextMenu={readOnly ? undefined : (e) => { e.preventDefault(); if (isActive) onCycleItem?.(-1); }}
        aria-label={itemLabel ?? 'No item selected'}
        title={itemLabel ?? 'Click to set item'}
        tabIndex={isActive && !readOnly ? 0 : -1}
      >
        {isActive && (
          <img
            src={`${assetBasePath}/items/${itemLabel ? ITEM_ICON_FILES[itemLabel] ?? 'empty.png' : 'empty.png'}`}
            alt={itemLabel ?? 'empty'}
            className="item-cycle-icon"
            draggable={false}
          />
        )}
      </button>
    </div>
  );
}

const ITEM_ICON_FILES: Record<string, string> = {
  'Golden Banana': 'gb.png',
  Potion: 'potion.png',
  Key: 'key.png',
  Bean: 'bean.png',
  Pearl: 'pearl.png',
  Blueprint: 'bp.png',
  'Nintendo Coin': 'nc.png',
  'Rareware Coin': 'rw.png',
  Shop: 'shop.png',
  Fairy: 'fairy.png',
  Medal: 'medal.png',
  Crown: 'crown.png',
};
