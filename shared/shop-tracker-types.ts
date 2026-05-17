export const SHOP_KONG_STATE = { EMPTY: 0, HAS_ITEM: 1, BOUGHT: 2 } as const;
export type ShopKongState = (typeof SHOP_KONG_STATE)[keyof typeof SHOP_KONG_STATE];

export type ShopTrackerKongState = Record<string, ShopKongState>;
export type ShopTrackerItemState = Record<string, string>;

export interface ShopTrackerState {
  kongs: ShopTrackerKongState;
  items: ShopTrackerItemState;
}

export const SHOP_TRACKER_ITEMS = [
  'Golden Banana',
  'Potion',
  'Key',
  'Bean',
  'Pearl',
  'Blueprint',
  'Shop',
  'Fairy',
  'Medal',
  'Crown',
  'Nintendo Coin',
  'Rareware Coin',
] as const;
