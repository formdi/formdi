import React, { useEffect } from "react";
import NationalSamplingTripsForm from "../../forms/NationalSamplingTripsForm";

function NationalSamplingTrips() {
  useEffect(() => {
    document.title = "Forms DI | Viajes de Muestreo Dentro de Proyectos"; // Título de la página de Viajes de Muestreo en Proyectos
  }, []);

  return <NationalSamplingTripsForm />;
}

export default NationalSamplingTrips;
