import { useEffect, useRef, useState } from 'react';
import { getState, postShopTracker } from '../api/spoilerApi';
import { SHOP_KONG_STATE, type ShopKongState, type ShopTrackerKongState, type ShopTrackerItemState } from '@hint-viewer/shared/shop-tracker-types';

interface UseShopTrackerReturn {
  kongState: ShopTrackerKongState;
  itemState: ShopTrackerItemState;
  advanceKong: (key: string) => void;
  retreatKong: (key: string) => void;
  selectItem: (key: string, label: string | undefined) => void;
  resetAll: () => Promise<void>;
  loading: boolean;
  resetting: boolean;
  showResetModal: boolean;
  setShowResetModal: (v: boolean) => void;
}

export function useShopTracker(channelId: string | undefined): UseShopTrackerReturn {
  const [kongState, setKongState] = useState<ShopTrackerKongState>({});
  const [itemState, setItemState] = useState<ShopTrackerItemState>({});
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const kongRef = useRef(kongState);
  useEffect(() => { kongRef.current = kongState; }, [kongState]);

  const itemRef = useRef(itemState);
  useEffect(() => { itemRef.current = itemState; }, [itemState]);

  const syncTimerRef = useRef<number | null>(null);
  const scheduleSync = (delayMs = 250) => {
    if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current);
    syncTimerRef.current = window.setTimeout(() => {
      if (!channelId) return;
      postShopTracker(channelId, { kongs: kongRef.current, items: itemRef.current }).catch((err) =>
        console.error('Shop tracker sync error:', err),
      );
      syncTimerRef.current = null;
    }, delayMs);
  };
  useEffect(() => () => { if (syncTimerRef.current) window.clearTimeout(syncTimerRef.current); }, []);

  useEffect(() => {
    if (!channelId) return;
    let mounted = true;
    (async () => {
      try {
        const data = await getState(channelId);
        if (!mounted || !data) return;
        const tracker = data.shopTracker as { kongs?: Record<string, number>; items?: Record<string, string> } | undefined;
        if (tracker) {
          setKongState((tracker.kongs ?? {}) as ShopTrackerKongState);
          setItemState(tracker.items ?? {});
        }
      } catch (err) {
        console.warn('Failed to load shop tracker state', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [channelId]);

  const advanceKong = (key: string) => {
    setKongState((prev) => {
      const current = (prev[key] ?? SHOP_KONG_STATE.EMPTY) as ShopKongState;
      if (current >= SHOP_KONG_STATE.BOUGHT) return prev;
      const next = (current + 1) as ShopKongState;
      return { ...prev, [key]: next };
    });
    scheduleSync();
  };

  const retreatKong = (key: string) => {
    setKongState((prev) => {
      const current = (prev[key] ?? SHOP_KONG_STATE.EMPTY) as ShopKongState;
      if (current <= SHOP_KONG_STATE.EMPTY) return prev;
      const next = (current - 1) as ShopKongState;
      if (next === SHOP_KONG_STATE.EMPTY) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: next };
    });
    setItemState((prev) => {
      const current = (kongRef.current[key] ?? SHOP_KONG_STATE.EMPTY) as ShopKongState;
      if (current - 1 <= SHOP_KONG_STATE.EMPTY && key in prev) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return prev;
    });
    scheduleSync();
  };

  const selectItem = (key: string, label: string | undefined) => {
    setItemState((prev) => {
      if (!label) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: label };
    });
    scheduleSync();
  };

  const resetAll = async () => {
    setShowResetModal(false);
    setResetting(true);
    try {
      setKongState({});
      setItemState({});
      if (syncTimerRef.current) { window.clearTimeout(syncTimerRef.current); syncTimerRef.current = null; }
      if (channelId) {
        const res = await postShopTracker(channelId, {});
        if (!res.ok) throw new Error('Failed to reset shop tracker');
      }
    } catch (err) {
      console.error('Shop tracker reset error:', err);
    } finally {
      setResetting(false);
    }
  };

  return { kongState, itemState, advanceKong, retreatKong, selectItem, resetAll, loading, resetting, showResetModal, setShowResetModal };
}
