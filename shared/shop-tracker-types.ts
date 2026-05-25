export const SHOP_KONG_STATE = { EMPTY: 0, HAS_ITEM: 1, BOUGHT: 2 } as const;
export type ShopKongState = (typeof SHOP_KONG_STATE)[keyof typeof SHOP_KONG_STATE];

export type ShopTrackerKongState = Record<string, ShopKongState>;
export type ShopTrackerItemState = Record<string, string>;

export interface ShopTrackerState {
  kongs: ShopTrackerKongState;
  items: ShopTrackerItemState;
}