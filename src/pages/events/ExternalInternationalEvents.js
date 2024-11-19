import React, { useEffect } from "react";
import ExternalInternationalEventsForm from "../../forms/ExternalInternationalEventsForm";

function ExternalInternationalEvents() {
  useEffect(() => {
    document.title = "Forms DI | Participación en Eventos Fuera de Proyectos"; // Título de la página de Participación en Eventos Fuera de Proyectos
  }, []);

  return <ExternalInternationalEventsForm />;
}

export default ExternalInternationalEvents;
