import { FaCheck } from 'react-icons/fa';
import type { ShopKongState } from '../../shop-tracker-types';
import { SHOP_KONG_STATE } from '../../shop-tracker-types';
import { ItemPicker } from './ItemPicker';

interface KongSlotProps {
  kong: string;
  kongState: ShopKongState;
  itemLabel: string | undefined;
  assetBasePath: string;
  onAdvanceKong?: () => void;
  onRetreatKong?: () => void;
  onSelectItem?: (label: string | undefined) => void;
  readOnly?: boolean;
}

export function KongSlot({ kong, kongState, itemLabel, assetBasePath, onAdvanceKong, onRetreatKong, onSelectItem, readOnly = false }: KongSlotProps) {
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
      <ItemPicker
        items={ITEM_PICKER_ITEMS}
        selectedLabel={itemLabel}
        assetBasePath={assetBasePath}
        onSelect={(label) => onSelectItem?.(label)}
        readOnly={readOnly}
        visible={isActive}
      />
    </div>
  );
}

const ITEM_PICKER_ITEMS = [
  { label: 'Golden Banana', iconPath: 'items/gb.png' },
  { label: 'Potion', iconPath: 'items/potion.png' },
  { label: 'Key', iconPath: 'items/key.png' },
  { label: 'Bean', iconPath: 'items/bean.png' },
  { label: 'Pearl', iconPath: 'items/pearl.png' },
  { label: 'Blueprint', iconPath: 'items/bp.png' },
  { label: 'Fairy', iconPath: 'items/fairy.png' },
  { label: 'Medal', iconPath: 'items/medal.png' },
  { label: 'Crown', iconPath: 'items/crown.png' },
  { label: 'Nintendo Coin', iconPath: 'items/nc.png' },
  { label: 'Rareware Coin', iconPath: 'items/rw.png' },
  { label: 'DK', iconPath: 'kongs/dk.png' },
  { label: 'Diddy', iconPath: 'kongs/diddy.png' },
  { label: 'Lanky', iconPath: 'kongs/lanky.png' },
  { label: 'Tiny', iconPath: 'kongs/tiny.png' },
  { label: 'Chunky', iconPath: 'kongs/chunky.png' },
  { label: 'Cranky', iconPath: 'shops/cranky.png' },
  { label: 'Candy', iconPath: 'shops/candy.png' },
  { label: 'Funky', iconPath: 'shops/funky.png' },
  { label: 'Snide', iconPath: 'shops/snide.png' },
];
