import { Offcanvas } from 'react-bootstrap';
import { ShopTrackerGrid } from '@hint-viewer/shared/components/shop-tracker/ShopTrackerGrid';
import type { ShopTrackerKongState, ShopTrackerItemState } from '@hint-viewer/shared/shop-tracker-types';

interface ShopTrackerOffcanvasProps {
  show: boolean;
  onHide: () => void;
  kongState: ShopTrackerKongState;
  itemState: ShopTrackerItemState;
}

const ASSET_BASE_PATH = '/assets/ShopTracker';

export function ShopTrackerOffcanvas({ show, onHide, kongState, itemState }: ShopTrackerOffcanvasProps) {
  return (
    <Offcanvas
      show={show}
      onHide={onHide}
      placement="end"
      className="shop-tracker-offcanvas"
    >
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>Shop Tracker</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="p-0">
        <ShopTrackerGrid
          kongState={kongState}
          itemState={itemState}
          assetBasePath={ASSET_BASE_PATH}
          readOnly
        />
      </Offcanvas.Body>
    </Offcanvas>
  );
}
