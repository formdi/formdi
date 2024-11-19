import React, { useEffect } from "react";
import ExternalPaymentForm from "../../forms/ExternalPaymentForm";

function ExternalPayment() {
  useEffect(() => {
    document.title = "Forms DI | Pago al Exterior"; // Título de la página de Pago al Exterior
  }, []);

  return <ExternalPaymentForm />;
}

export default ExternalPayment;