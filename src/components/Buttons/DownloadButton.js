import React from "react";
import { Button, Spinner } from "react-bootstrap";

const DownloadButton = ({ onClick, icon, altText, label, variant = "light", type = "button", loading = false }) => {
  return (
    <Button type={type} onClick={onClick} variant={variant} disabled={loading} >
      {loading ? (
        <>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
            style={{ marginRight: "8px" }}
          />
          <span>Generando...</span>
        </>
      ) : (
        <>
          {icon && (
            <img
              src={icon}
              alt={altText}
              className="download-icon"
              style={{ marginRight: "8px" }}
            />
          )}
          <span>{label}</span>
        </>
      )}
    </Button>
  );
};

export default DownloadButton;
