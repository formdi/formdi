import React, { useEffect } from "react";
import ProjectNationalEventsForm from "../../forms/ProjectNationalEventsForm";

function ProjectNationalEvents() {
  useEffect(() => {
    document.title = "Forms DI | Participación Nacional Dentro de Proyectos"; // Título de la página de Participación Nacional en Proyectos
  }, []);

  return <ProjectNationalEventsForm />;
}

export default ProjectNationalEvents;
