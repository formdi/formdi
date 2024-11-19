import React, { useEffect } from "react";
import InstitutionalServicesForm from "../../forms/InstitutionalServicesForm";

function InstitutionalServices() {
  useEffect(() => {
    document.title = "Forms DI | Informe de servicios institucionales";
  }, []);

  return <InstitutionalServicesForm />;
}

export default InstitutionalServices;
