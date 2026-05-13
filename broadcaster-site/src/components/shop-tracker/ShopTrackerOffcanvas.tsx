import { useState } from 'react';
import { Offcanvas, Accordion } from 'react-bootstrap';
import { FaCheck } from 'react-icons/fa';
import { DK64_SHOP_LEVELS, DK64_KONGS } from '@hint-viewer/shared/games/dk64-shops';
import { SHOP_KONG_STATE } from '@hint-viewer/shared/shop-tracker-types';
import type { ShopKongState } from '@hint-viewer/shared/shop-tracker-types';
import { useShopTracker } from '../../hooks/use-shop-tracker';
import { ConfirmModal } from '../ConfirmModal';
import { KongSlot } from './KongSlot';

interface ShopTrackerOffcanvasProps {
  show: boolean;
  onHide: () => void;
  channelId: string;
  readOnly?: boolean;
}

const LEVEL_NAMES = Object.keys(DK64_SHOP_LEVELS);

function buildKey(level: string, shop: string, kong: string): string {
  return `${level}:${shop}:${kong}`;
}

type LevelStatus = 'empty' | 'active' | 'complete';

function getLevelStatus(level: string, kongState: Record<string, number>): LevelStatus {
  const prefix = `${level}:`;
  const levelEntries = Object.entries(kongState).filter(([key]) => key.startsWith(prefix));
  if (levelEntries.length === 0) return 'empty';
  if (levelEntries.some(([, state]) => state === SHOP_KONG_STATE.HAS_ITEM)) return 'active';
  if (levelEntries.some(([, state]) => state === SHOP_KONG_STATE.BOUGHT)) return 'complete';
  return 'empty';
}

export function ShopTrackerOffcanvas({ show, onHide, channelId, readOnly = false }: ShopTrackerOffcanvasProps) {
  const { kongState, itemState, advanceKong, retreatKong, cycleItem, resetAll, loading, resetting, showResetModal, setShowResetModal } = useShopTracker(channelId, readOnly);
  const [activeLevel, setActiveLevel] = useState(LEVEL_NAMES[0]);

  const shops = DK64_SHOP_LEVELS[activeLevel] ?? [];

  return (
    <>
      <Offcanvas show={show} onHide={onHide} placement="end" className="shop-tracker-offcanvas">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Shop Tracker</Offcanvas.Title>
          {!readOnly && (
            <button
              className="twitch-btn shop-tracker-reset"
              onClick={() => setShowResetModal(true)}
              aria-label="Reset all shop tracking"
            >
              Reset
            </button>
          )}
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          {loading ? (
            <div className="shop-tracker-loading">Loading...</div>
          ) : (
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
                    <span className="shop-tracker-label">{shop}</span>
                    <div className="shop-tracker-kongs">
                      {DK64_KONGS.map((kong) => {
                        const key = buildKey(activeLevel, shop, kong);
                        return (
                          <KongSlot
                            key={kong}
                            kong={kong}
                            kongState={(kongState[key] ?? SHOP_KONG_STATE.EMPTY) as ShopKongState}
                            itemLabel={itemState[key]}
                            onAdvanceKong={() => advanceKong(key)}
                            onRetreatKong={() => retreatKong(key)}
                            onCycleItem={(dir) => cycleItem(key, dir)}
                            readOnly={readOnly}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {!readOnly && (
                <div className="shop-tracker-instructions">
                  <Accordion flush>
                    <Accordion.Item eventKey="instructions">
                      <Accordion.Header>Instructions</Accordion.Header>
                      <Accordion.Body>
                        <ul className="shop-tracker-instructions-list">
                          <li><strong>Left click</strong> a kong circle to advance its state: dimmed (empty) to bright (has item) to checkmark (bought).</li>
                          <li><strong>Right click</strong> a kong circle to go back a step.</li>
                          <li>When a kong is active, an item slot appears below it. <strong>Left click</strong> to cycle forward through items, <strong>right click</strong> to cycle backward.</li>
                          <li>Use the level chips above to switch between levels.</li>
                          <li>All changes are saved automatically.</li>
                        </ul>
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </div>
              )}
            </>
          )}
        </Offcanvas.Body>
      </Offcanvas>
      {!readOnly && (
        <ConfirmModal
          show={showResetModal}
          loading={resetting}
          message="Reset all shop tracking data? This cannot be undone."
          confirmLabel="Reset"
          loadingText="Resetting..."
          onCancel={() => setShowResetModal(false)}
          onConfirm={resetAll}
        />
      )}
    </>
  );
}
