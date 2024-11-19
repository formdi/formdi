import React from "react";
import { Button, Spinner } from "react-bootstrap";

const ActionButton = ({ onClick, label, variant = "primary", type = "button", loading = false }) => {
  return (
    <Button type={type} onClick={onClick} variant={variant} disabled={loading}>
      {loading ? (
        <>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
          />
          <span className="visually-hidden">Loading...</span>
        </>
      ) : (
        label
      )}
    </Button>
  );
};

export default ActionButton;
