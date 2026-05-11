import { Modal, Spinner, Button } from 'react-bootstrap';

export function ConfirmModal({
  show,
  loading,
  message,
  confirmLabel = 'Confirm',
  loadingText = 'Processing...',
  onCancel,
  onConfirm,
}: {
  show: boolean;
  loading: boolean;
  message: string;
  confirmLabel?: string;
  loadingText?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal show={show} centered backdrop="static" keyboard={false} contentClassName="upload-modal-content">
      <Modal.Body className="upload-modal-body text-center py-4">
        {loading ? (
          <>
            <Spinner animation="border" role="status" className="mb-3 upload-modal-spinner">
              <span className="visually-hidden">{loadingText}</span>
            </Spinner>
            <div>{loadingText}</div>
          </>
        ) : (
          <>
            <div className="mb-3">{message}</div>
            <div className="d-flex justify-content-center gap-3">
              <Button variant="secondary" onClick={onCancel} disabled={loading}>
                Cancel
              </Button>
              <Button variant="danger" onClick={onConfirm} disabled={loading}>
                {confirmLabel}
              </Button>
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
}
