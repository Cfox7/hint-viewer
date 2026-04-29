import { Modal, Spinner, Button } from 'react-bootstrap';

export function ClearModal({
  show,
  loading,
  onCancel,
  onConfirm,
}: {
  show: boolean;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal show={show} centered backdrop="static" keyboard={false} contentClassName="upload-modal-content">
      <Modal.Body className="upload-modal-body text-center py-4">
        {loading ? (
          <>
            <Spinner animation="border" role="status" className="mb-3 upload-modal-spinner">
              <span className="visually-hidden">Clearing...</span>
            </Spinner>
            <div>Clearing…</div>
          </>
        ) : (
          <>
            <div className="mb-3">Are you sure you want make a new template and delete any existing hints?</div>
            <div className="d-flex justify-content-center gap-3">
              <Button variant="secondary" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
              <Button variant="danger" onClick={onConfirm} disabled={loading}>
                New Template
              </Button>
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}