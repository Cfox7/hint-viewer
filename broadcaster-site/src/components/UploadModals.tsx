import { Modal, Spinner, Button } from 'react-bootstrap';

export function UploadModals(props: {
  uploading: boolean;
  showClearModal: boolean;
  setShowClearModal: (v: boolean) => void;
  clearing: boolean;
  onClear: () => void;
}) {
  const { uploading, showClearModal, setShowClearModal, clearing, onClear } = props;
  return (
    <>
      <Modal show={uploading} centered backdrop="static" keyboard={false} contentClassName="upload-modal-content">
        <Modal.Body className="upload-modal-body text-center py-4">
          <Spinner animation="border" role="status" className="mb-3 upload-modal-spinner">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <div>Applying spoiler…</div>
        </Modal.Body>
      </Modal>

      <Modal show={showClearModal} onHide={() => setShowClearModal(false)} centered contentClassName="clear-modal-content">
        <Modal.Header closeButton className="clear-modal-header">
          <Modal.Title>Clear Spoiler Log</Modal.Title>
        </Modal.Header>
        <Modal.Body className="clear-modal-body">
          Are you sure you want to clear the current spoiler log? Viewers will no longer see hints.
        </Modal.Body>
        <Modal.Footer className="clear-modal-footer">
          <Button variant="secondary" onClick={() => setShowClearModal(false)} className="clear-modal-cancel">
            Cancel
          </Button>
          <Button variant="danger" onClick={onClear} disabled={clearing} className="clear-modal-confirm">
            {clearing ? 'Clearing...' : 'Clear Log'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}