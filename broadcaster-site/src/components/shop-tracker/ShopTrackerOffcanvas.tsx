import { Offcanvas, Accordion } from 'react-bootstrap';
import { useShopTracker } from '../../hooks/use-shop-tracker';
import { ConfirmModal } from '../ConfirmModal';
import { ShopTrackerGrid } from '@hint-viewer/shared/components/shop-tracker/ShopTrackerGrid';

interface ShopTrackerOffcanvasProps {
  show: boolean;
  onHide: () => void;
  channelId: string;
}

const ASSET_BASE_PATH = '/assets/ShopTracker';

export function ShopTrackerOffcanvas({ show, onHide, channelId }: ShopTrackerOffcanvasProps) {
  const { kongState, itemState, advanceKong, retreatKong, selectItem, resetAll, loading, resetting, showResetModal, setShowResetModal } = useShopTracker(channelId);

  return (
    <>
      <Offcanvas show={show} onHide={onHide} placement="end" className="shop-tracker-offcanvas">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Shop Tracker</Offcanvas.Title>
          <button
            className="twitch-btn shop-tracker-reset"
            onClick={() => setShowResetModal(true)}
            aria-label="Reset all shop tracking"
          >
            Reset
          </button>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0">
          {loading ? (
            <div className="shop-tracker-loading">Loading...</div>
          ) : (
            <>
              <ShopTrackerGrid
                kongState={kongState}
                itemState={itemState}
                assetBasePath={ASSET_BASE_PATH}
                onAdvanceKong={advanceKong}
                onRetreatKong={retreatKong}
                onSelectItem={selectItem}
              />
              <div className="shop-tracker-instructions">
                <Accordion flush>
                  <Accordion.Item eventKey="instructions">
                    <Accordion.Header>Instructions</Accordion.Header>
                    <Accordion.Body>
                      <ul className="shop-tracker-instructions-list">
                        <li><strong>Left click</strong> a kong circle to advance its state: dimmed (empty) to bright (has item) to checkmark (bought).</li>
                        <li><strong>Right click</strong> a kong circle to go back a step.</li>
                        <li>When a kong is active, an item slot appears below it. <strong>Click</strong> to open a picker and select the item.</li>
                        <li>Use the level chips above to switch between levels.</li>
                        <li>All changes are saved automatically.</li>
                      </ul>
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </div>
            </>
          )}
        </Offcanvas.Body>
      </Offcanvas>
      <ConfirmModal
        show={showResetModal}
        loading={resetting}
        message="Reset all shop tracking data? This cannot be undone."
        confirmLabel="Reset"
        loadingText="Resetting..."
        onCancel={() => setShowResetModal(false)}
        onConfirm={resetAll}
      />
    </>
  );
}
