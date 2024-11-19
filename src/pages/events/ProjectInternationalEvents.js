import React, { useEffect } from "react";
import ProjectInternationalEventsForm from "../../forms/ProjectInternationalEventsForm";
import "../../form1.css"; // Importa el archivo CSS

function ProjectInternationalEvents() {
  useEffect(() => {
    document.title = "Forms DI | Participación en Eventos Dentro Proyectos"; // Título de la página de Participación en Eventos en Proyectos
  }, []);
  return <ProjectInternationalEventsForm />;
}

export default ProjectInternationalEvents;
