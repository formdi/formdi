import React from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function ConfirmationModal({ show, onHide, formData, onConfirm, title, fieldLabels }) {
  const renderData = (data, labels) => {
    return Object.keys(data).map((key) => {
      const value = data[key];

      // Si el valor es una cadena vacía o nulo/undefined, no lo mostramos
      if (value === "" || value === null || value === undefined) {
        return null;
      }

      if (Array.isArray(value)) {
        // Si es un array, iteramos sobre él y mostramos cada elemento con una línea divisoria entre ellos
        return (
          <li key={key}>
            <strong>{labels[key] || key}:</strong>
            <ul>
              {value.map((item, index) => (
                <React.Fragment key={index}>
                  {Object.keys(item).map((subKey) => {
                    // Verificamos si el valor es vacío antes de mostrarlo
                    const subValue = item[subKey];
                    if (subValue === "" || subValue === null || subValue === undefined) {
                      return null;
                    }

                    return (
                      <p key={subKey}>
                        <strong>{labels[`${key}[].${subKey}`] || subKey}:</strong>{' '}
                        {typeof subValue === 'boolean' ? (subValue ? 'Sí' : 'No') : subValue}
                      </p>
                    );
                  })}
                  {index < value.length - 1 && <hr />} {/* Línea divisoria entre elementos */}
                </React.Fragment>
              ))}
            </ul>
          </li>
        );
      } else {
        // Si no es un array, mostramos el valor simple (también manejamos booleanos aquí)
        return (
          <li key={key}>
            <strong>{labels[key] || key}:</strong>{' '}
            {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value}
          </li>
        );
      }
    });
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{title || 'Confirmar datos'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5>Por favor, confirma que los datos ingresados son correctos:</h5>
        <ul>
          {/* Usamos la función auxiliar para mostrar todos los datos del formulario */}
          {renderData(formData, fieldLabels)}
        </ul>
        <p>¿Son estos los datos correctos?</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={onConfirm}>
          Confirmar
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ConfirmationModal;
