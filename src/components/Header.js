import React from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { NavLink } from "react-router-dom";

// Componente Header que representa la barra de navegación superior
function Header() {
  return (
    <Navbar style={{ backgroundColor: "#001F3E" }} variant="dark" expand="lg" fixed="top" sticky="top" > {/* El componente Navbar de React-Bootstrap para crear una barra de navegación */}
      <Container>
        {/* Marca de la barra de navegación que incluye un logo y un texto */}
        <Navbar.Brand href="/">
          <img
            src="logo-epn.svg"
            alt="Logo"
            width="50"
            height="50"
          />
          Dirección de Investigación
        </Navbar.Brand>

        {/* Toggle para colapsar la barra de navegación en dispositivos móviles */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        {/* Contenedor para agrupar los elementos de navegación */}
        <Navbar.Collapse id="basic-navbar-nav">

          {/* Clase ml-auto para alinear los elementos de navegación a la derecha */}
          <Nav className="ml-auto">

            <Nav.Link as={NavLink} to="/" className={({ isActive }) => (isActive ? "active" : "")} > Home </Nav.Link>
            <Nav.Link as={NavLink} to="/about" className={({ isActive }) => (isActive ? "active" : "")} > About </Nav.Link>

            {/* Dropdown (menú desplegable) para las opciones de formularios */}
            <NavDropdown title="Formularios al Exterior" id="basic-nav-dropdown">
            
              <NavDropdown.Item as={NavLink} to="/ProjectInternationalEvents" 
                className={({ isActive }) => (isActive ? "active" : "")} > 
                Participación en Eventos Dentro de Proyectos
              </NavDropdown.Item>

              <NavDropdown.Item as={NavLink} to="/ExternalInternationalEvents"
                className={({ isActive }) => (isActive ? "active" : "")} >
                Participación en Eventos Fuera de Proyectos
              </NavDropdown.Item>

              
              <NavDropdown.Item as={NavLink} to="/InternationalTechnicalTrips"
                className={({ isActive }) => (isActive ? "active" : "")} >
                Participación en Viajes Técnicos Dentro de Proyectos
              </NavDropdown.Item>

            </NavDropdown>

            <NavDropdown title="Formularios Nacionales" id="basic-nav-dropdown">
              
              <NavDropdown.Item as={NavLink} to="/ExternalNationalEvents"
                className={({ isActive }) => (isActive ? "active" : "")} >
                Participacion en Eventos Fuera de Proyectos
              </NavDropdown.Item>

              <NavDropdown.Item as={NavLink} to="/ProjectNationalEvents"
                className={({ isActive }) => (isActive ? "active" : "")} >
                Participación en Eventos Dentro de Proyectos
              </NavDropdown.Item>

              <NavDropdown.Item as={NavLink} to="/NationalSamplingTrips"
                className={({ isActive }) => (isActive ? "active" : "")} >
                Salidas de campo y de muestreo y/o viajes técnicos dentro de proyectos
              </NavDropdown.Item>

            </NavDropdown>

            <NavDropdown title="Inscripción y otros" id="basic-nav-dropdown">

              <NavDropdown.Item as={NavLink} to="/InscriptionPayment"
                className={({ isActive }) => (isActive ? "active" : "")} >
                Pago de Inscripción
              </NavDropdown.Item>
              
              <NavDropdown.Item as={NavLink} to="/PublicationsPayment"
                className={({ isActive }) => (isActive ? "active" : "")} >
                Pago de Revista
              </NavDropdown.Item>

              <NavDropdown.Item as={NavLink} to="/InstitutionalServices"
                className={({ isActive }) => (isActive ? "active" : "")} >
                Servicios Institucionales
              </NavDropdown.Item>

              <NavDropdown.Item as={NavLink} to="/ExternalPayment"
                className={({ isActive }) => (isActive ? "active" : "")} >
                Pagos al Exterior
              </NavDropdown.Item>

            </NavDropdown>
          </Nav>

        </Navbar.Collapse>

      </Container>
      
    </Navbar>
  );
}
export default Header;
