// ConfirmClearModal.js
import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function ConfirmClearModal({ show, onHide, onClear, onDownload, title }) {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{title || "Confirmación de limpieza del formulario"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5>¿Estás seguro que quieres limpiar el formulario?</h5>
        <p>Esto eliminará todos los datos que has llenado.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="info" onClick={onDownload}>
          Descargar datos en .json
        </Button>
        <Button variant="danger" onClick={onClear}>
          Limpiar el formulario
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmClearModal;
