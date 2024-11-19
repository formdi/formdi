import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import ReactGA from 'react-ga4';

// Importación de componentes comunes
import Header from "./components/Header";
import Footer from "./components/Footer";

// Importación de las páginas de la aplicación
import Home from "./pages/Home";
import About from "./pages/About";
import ProjectInternationalEvents from "./pages/events/ProjectInternationalEvents";
import ExternalInternationalEvents from "./pages/events/ExternalInternationalEvents";
import InternationalTechnicalTrips from "./pages/trips/InternationalTechnicalTrips";
import InscriptionPayment from "./pages/services/InscriptionPayment";
import ProjectNationalEvents from "./pages/events/ProjectNationalEvents";
import ExternalNationalEvents from "./pages/events/ExternalNationalEvents";
import PublicationsPayment from "./pages/services/PublicationsPayment";
import NationalSamplingTrips from "./pages/trips/NationalSamplingTrips";
import InstitutionalServices from "./pages/services/InstitutionalServices";
import ExternalPayment from "./pages/services/ExternalPayment";
// Importación del archivo CSS para los estilos de la aplicación
import "./App.css";

ReactGA.initialize([
  { trackingId: 'G-HP0R3K8KHN' },   // ID 1 de Google Analytics Personal
  { trackingId: 'G-95G26Q6TRS' },   // ID 2 de Google Analytics DI
]);
// Componente principal que usa el hook useLocation
function MainApp() {
  const location = useLocation(); // Hook para detectar cambios en la ruta

  useEffect(() => {
    // Datos para el evento de pageview
    const pageViewData = {
      hitType: 'pageview',
      page: location.pathname + location.search,
      title: document.title || 'Página sin título',
    };
    
    // Envía la vista de página a Google Analytics
    ReactGA.send(pageViewData);
  }, [location]); // Se ejecuta cada vez que cambie la ruta

  return (
    <div className="wrapper">
      <Header />
      <div className="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/ProjectInternationalEvents" element={<ProjectInternationalEvents />} />
          <Route path="/ExternalInternationalEvents" element={<ExternalInternationalEvents />} />
          <Route path="/InternationalTechnicalTrips" element={<InternationalTechnicalTrips />} />
          <Route path="/InscriptionPayment" element={<InscriptionPayment />} />
          <Route path="/ProjectNationalEvents" element={<ProjectNationalEvents />} />
          <Route path="/ExternalNationalEvents" element={<ExternalNationalEvents />} />
          <Route path="/PublicationsPayment" element={<PublicationsPayment />} />
          <Route path="/NationalSamplingTrips" element={<NationalSamplingTrips />} />
          <Route path="/InstitutionalServices" element={<InstitutionalServices />} />
          <Route path="/ExternalPayment" element={<ExternalPayment />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

// Componente App donde se define Router
function App() {
  return (
    <Router>  {/* Router envuelve todo el contenido de la aplicación */}
      <MainApp />  {/* Este es el componente donde se usa useLocation */}
    </Router>
  );
}

export default App;
