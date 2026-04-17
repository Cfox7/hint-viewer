import { Modal, Spinner } from 'react-bootstrap';

export function UploadModals({ uploading }: { uploading: boolean }) {
  return (
    <Modal show={uploading} centered backdrop="static" keyboard={false} contentClassName="upload-modal-content">
      <Modal.Body className="upload-modal-body text-center py-4">
        <Spinner animation="border" role="status" className="mb-3 upload-modal-spinner">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <div>Applying spoiler…</div>
      </Modal.Body>
    </Modal>
  );
}