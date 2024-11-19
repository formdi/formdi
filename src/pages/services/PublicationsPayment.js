import React, { useEffect } from "react";
import PublicationsPaymentForm from "../../forms/PublicationsPaymentForm";
function PublicationsPayment() {
  useEffect(() => {
    document.title = "Forms DI | Pago de Publicaciones"; // Título de la página de Pago de Publicaciones
  }, []);

  return <PublicationsPaymentForm />;
}

export default PublicationsPayment;
