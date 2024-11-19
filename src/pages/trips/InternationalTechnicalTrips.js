import React, { useEffect } from "react";
import InternationalTechnicalTripsForm from "../../forms/InternationalTechnicalTripsForm";

function InternationalTechnicalTrips() {
  useEffect(() => {
    document.title = "Forms DI | Viajes Técnicos Dentro de Proyectos"; // Título de la página de Viajes Técnicos en Proyectos
  }, []);

  return <InternationalTechnicalTripsForm />;
}

export default InternationalTechnicalTrips;
