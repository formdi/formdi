import React, { useEffect } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";

function About() {
  useEffect(() => {
    document.title = "Forms DI | Acerca de"; // Título de la página de Acerca de
  }, []);

  return (
    <Container className="mt-4">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title as="h2" className="text-center">
                Acerca de Di-Forms
              </Card.Title>
              <Card.Text>
                Di-Forms es una aplicación desarrollada para agilizar el proceso
                de creación y manejo de formularios digitales. Nuestra misión es
                simplificar la manera en que se gestionan los formularios para
                la Dirección de Investigación, permitiendo a los usuarios
                generar documentos en formato PDF de manera rápida y eficiente.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default About;
