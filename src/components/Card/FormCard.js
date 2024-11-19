import React from "react";
import { Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const FormCard = ({ title, description, imageSrc, altText, buttonText, path, ariaLabel, documentDetails, style, className }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(path);
  };

  return (
    <Card border="primary" style={{ width: "100%", marginBottom: "20px", ...style }} className={className}>
      <Card.Body className="d-flex flex-column">
        <Card.Title>{title}</Card.Title>
        <Card.Img
          variant="top"
          src={imageSrc}
          alt={altText}
          style={{ width: "100%", height: "150px", objectFit: "contain" }}
        />
        <Card.Text>{description}</Card.Text>
        {documentDetails && documentDetails.length > 0 && (
          <div>
            <strong>Documentos que se generarán:</strong>
            <ul>
              {documentDetails.map((detail, index) => (
                <li key={index}>{detail}</li>
              ))}
            </ul>
          </div>
        )}
        <Button variant="outline-primary" onClick={handleCardClick} aria-label={ariaLabel} className="mt-auto">
          {buttonText}
        </Button>
      </Card.Body>
    </Card>
  );
};

export default FormCard;