import React, { useEffect } from "react";
import ExternalNationalEventsForm from "../../forms/ExternalNationalEventsForm";

function ExternalNationalEvents() {
  useEffect(() => {
    document.title = "Forms DI | Participación Nacional Fuera de Proyectos"; // Título de la página de Participación Nacional Fuera de Proyectos
  }, []);

  return <ExternalNationalEventsForm />;
}

export default ExternalNationalEvents;
