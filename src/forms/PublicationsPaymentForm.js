import React, { useState, useEffect } from "react";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { Container, Button, Row, Col, Form } from "react-bootstrap";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importación de los componentes del formulario
import Label from "../components/Labels/Label.js";
import LabelTitle from "../components/Labels/LabelTitle.js";
import LabelText from "../components/Labels/LabelText.js";
import InputSelect from "../components/Inputs/InputSelect.js";
import InputText from "../components/Inputs/InputText.js";
import InputTextArea from "../components/Inputs/InputTextArea.js";
import ActionButton from "../components/Buttons/ActionButton.js";
import DownloadButton from "../components/Buttons/DownloadButton.js";
// Modals
import ConfirmationModal from "../components/Modals/ConfirmationModal.js";
import ConfirmClearModal from "../components/Modals/ConfirmClearModal.js";

// Importación de las funciones para generar documentos
import {
  generateMemoPublicationPaymentProject,
  generateAnexo1PublicationPaymentWithin,
  generateAnexo2PublicationPaymentOutside,
} from "../utils/generatorDocuments/services/serviceDocuments";
import { validarCedulaEcuatoriana } from "../utils/validaciones.js";
const formStorageKey = "formPublicationsPayment"; // Clave para almacenar el formulario en localStorage
const formData = JSON.parse(sessionStorage.getItem(formStorageKey)) || {}; // Datos del formulario desde localStorage

const fieldLabels = {
  codigoProyecto: 'Código del Proyecto',
  nombreDirector: 'Nombre del Director',
  cargoDirector: 'Cargo del Director',

  inscripciones: 'Inscripciones',
  'inscripciones[].valorInscripcion': 'Valor de la Inscripción',
  'inscripciones[].pagoLimite': 'Límite de Pago',
  'inscripciones[].limiteFecha': 'Fecha Límite',

  publicaciones: 'Publicaciones',
  'publicaciones[].monedaPago': 'Moneda de Pago',
  'publicaciones[].valorPublicacion': 'Valor de la Publicación',
  'publicaciones[].limiteFecha': 'Fecha Límite',

  metodoPago: 'Método de Pago',
  nombres: 'Nombres',
  apellidos: 'Apellidos',
  cedula: 'Cédula',
  departamento: 'Departamento',
  participacionProyecto: 'Participación en el Proyecto',
  tituloPublicacion: 'Título de la Publicación',
  nombreRevista: 'Nombre de la Revista',
  autoresEPN: 'Autores de la EPN',
  autoresExternos: 'Autores Externos',
  baseDatos: 'Base de Datos',
  cuartilPublicacion: 'Cuartil de la Publicación'
};

function PublicationsPaymentForm() {
 
  // Configuración del formulario con react-hook-form y valores predeterminados desde localStorage
  const methods = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: formData,
  });

  const { register, control, watch, reset, setValue, formState:{errors} } = methods;

  const { fields, append, remove } = useFieldArray({ control, name: "inscripciones"});

  // Observadores para campos clave
  const participacionProyecto = watch("participacionProyecto");
  const rolEnProyecto = watch("rolEnProyecto");
  const fechaFinEvento = watch("fechaFinEvento");
  const seleccionArticulo = watch("articuloPublicado");
  const metodoPago = watch("metodoPago");
  
  const [showDownloadSection, setShowDownloadSection] = useState(false);
  const [showInputParticipacion, setShowInputParticipacion] = useState(false);
  const [showInputDirector, setShowInputDirector] = useState(false);
  const [showInputFueraProyecto, setShowInputFueraProyecto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [modalClearShow, setModalClearShow] = useState(false);


  // Efecto principal
  useEffect(() => {
    reset(formData); 

    // Suscribirse a los cambios en el formulario para guardar en localStorage
    const subscription = watch((data) => {
      sessionStorage.setItem(formStorageKey, JSON.stringify(data));

      // Lógica para mostrar u ocultar campos basados en los valores del formulario
      setShowInputParticipacion(data.participacionProyecto === "dentroProyecto");
      setShowInputDirector(data.rolEnProyecto === "Colaborador"||data.rolEnProyecto === "Codirector");
      setShowInputFueraProyecto(data.participacionProyecto === "fueraProyecto");
    });

    // Limpiar la suscripción al desmontar el componente
    return () => subscription.unsubscribe();
  }, [watch, reset]);

  // Efecto para sincronizar con localStorage y manejar la inicialización
  useEffect(() => {
    
    // Mostrar u ocultar campos según las selecciones del formulario
    if (participacionProyecto === "dentroProyecto") {
      setShowInputParticipacion(true);
    } else {
      setShowInputParticipacion(false);
      setValue("codigoProyecto", "");
      setValue("nombreDirector", "");
    }

    if(participacionProyecto === "fueraProyecto"){
      setShowInputFueraProyecto(true);
    }else{
       setShowInputFueraProyecto(false);
    }

    if (rolEnProyecto === "Codirector" || rolEnProyecto === "Colaborador") {
      setShowInputDirector(true);
    } else {
      setShowInputDirector(false);
      setValue("nombreDirector", "");
      setValue("cargoDirector", "");
    }

    if (fields.length === 0) {
      append({
        valorInscripcion: "",
        pagoLimite: "",
        limiteFecha: "",
      });
    }

  }, [
    participacionProyecto,
    rolEnProyecto,
    seleccionArticulo,
    append,
    fields.length,
    watch,
    reset,
    setValue,
  ]);

  // Función que se ejecuta al enviar el formulario
  const onSubmitPublicationsPayment = (data) => {
    toast.success("Datos del Formulario validados correctamente");
    setModalShow(true); 
  };

  const handleConfirm = () => {
    toast.success("Confirmación del usuaio que los datos son correctos"); // Notificación de éxito
    setShowDownloadSection(true);
    setModalShow(false);
  };

  const handleDownloadJson = (returnDocument = false) => {
    const data = methods.getValues();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    if (returnDocument === true) return blob;
    toast.success("Archivo JSON descargado correctamente"); // Notificación de éxito
    saveAs(blob, "Pago de Publicaciones.json");
  };

  const handleUploadJson = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        reset(json, { keepErrors: false, keepDirty: false, keepValues: false, keepTouched: false, keepIsSubmitted: false });
        sessionStorage.setItem(formStorageKey, JSON.stringify(json));
      toast.success("Archivo JSON cargado correctamente"); // Notificación de éxito
} catch (err) {
        console.error("Error al cargar el archivo JSON:", err);
      }
    };
    reader.readAsText(file);
  };
  

  const handleGenerateMemo1 = () => {
    const formPublicationsPayment = methods.getValues();
    generateMemoPublicationPaymentProject(formPublicationsPayment);
    setShowDownloadSection(false);
  };

  const handleGeneratePdf = () => {
    const formPublicationsPayment = methods.getValues();
    generateAnexo1PublicationPaymentWithin(formPublicationsPayment);
    setShowInputParticipacion(true);
    setShowDownloadSection(false);
  };


  const handleGeneratePdf2 = () => {
    const formPublicationsPayment = methods.getValues();
    generateAnexo2PublicationPaymentOutside(formPublicationsPayment);
    setShowInputFueraProyecto(true);
    setShowDownloadSection(false);
  };

  const handleDownloadAll = async () => {
    const downloadDocuments = async () => {
      try {
        setLoading(true); // Activar spinner

        // Obtener los valores del formulario
        const formData = methods.getValues();

        // Generar los blobs de los documentos
        const jsonBlob = handleDownloadJson(true);
        const docxBlob = await generateMemoPublicationPaymentProject(formData, true);
        let pdfBlob;

        if (participacionProyecto === "dentroProyecto") {
          pdfBlob = await generateAnexo1PublicationPaymentWithin(formData, true);
        } else {
          pdfBlob = await generateAnexo2PublicationPaymentOutside(formData, true);
        }

        // Crear un nuevo archivo ZIP y agregar los documentos
        const zip = new JSZip();
        zip.file("Pago de Publicaciones.json", jsonBlob);
        zip.file("Memorando Pago de Publicación.docx", docxBlob);
        zip.file("Anexo - Publicación.pdf", pdfBlob);

        // Generar el archivo ZIP final y descargarlo
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "Documentos Pago de Publicación.zip");

      } catch (error) {
        throw error; // Lanza el error para que sea manejado por el toast
      } finally {
        setLoading(false); // Desactivar spinner
        setShowDownloadSection(false);
      }
    };

    // Usamos `toast.promise` para manejar las notificaciones de la promesa
    toast.promise(
      downloadDocuments(),
      {
        pending: 'Generando documentos... por favor, espera',
        success: '¡Documentos generados y descargados con éxito! 🎉',
        error: 'Error al generar los documentos. Por favor, inténtalo nuevamente 😞'
      }
    );
  };

  // Función para limpiar el formulario y resetear datos
  const handleClearForm = () => {
    sessionStorage.removeItem(formStorageKey);
    setShowDownloadSection(false);
    window.location.reload();
  };

  const validarFechaLimiteInscripcion = (index) => {
    const limiteFecha = watch(`inscripciones[${index}].limiteFecha`);
  
    if (limiteFecha && fechaFinEvento && limiteFecha > fechaFinEvento) {
      return `La fecha no puede ser mayor que la fecha de finalización del evento (${fechaFinEvento})`;
    }
  
    return true;
  };

  return (
    <FormProvider {...methods}>
      <Container>
        {/* Título del formulario */}
        <h1 className="text-center my-4">
          Formulario para Pago de Publicación Dentro o Fuera de Proyectos
        </h1>
        <div className="form-container">
          <Label text="Cargar datos desde archivo (.json)" />
          <input
            type="file"
            accept=".json"
            onChange={handleUploadJson} // Conectar con la función
            className="input-file"
          />
        </div>
        <Form onSubmit={methods.handleSubmit(onSubmitPublicationsPayment)}>
          {/* Formulario con diferentes secciones */}
          <div className="form-container">
            <LabelTitle text="Datos Personales" />

            <InputText
              name="nombres"
              label="Nombres del participante"
              placeholder="Juan Sebastian"
              rules={{ required: "Los nombres son requeridos" }}
              disabled={false}
            />

            <InputText
              name="apellidos"
              label="Apellidos del participante"
              placeholder="Perez Ramirez"
              rules={{ required: "Los apellidos son requeridos" }}
              disabled={false}
            />

            <InputText
              name="cedula"
              label="Cédula de ciudadania"
              rules={{
                required: "La cédula es requerida",
                pattern: {
                  value: /^\d{10}$/,
                  message: "La cédula debe contener solo 10 dígitos",
                },
                validate: (value) =>
                  validarCedulaEcuatoriana(value) || "la cédula no es válida",
              }}
              disable={false}
            />

            <InputSelect
              name="departamento"
              label="Departamento / Instituto"
              rules={{ required: "El departamento es requerido" }}
              disable={false}
              options={departamentoOptions}
            />

            <InputSelect
              name="participacionProyecto"
              label="Participación"
              options={participacionOptions}
              rules={{ required: "La participación es requerida" }}
              disable={false}
            />
            {showInputParticipacion && (
              <>
                <InputText
                  name="codigoProyecto"
                  label="Código del Proyecto"
                  rules={{
                    required: "El código del Proyecto es requerido",
                    pattern: {
                      value: /^[A-Za-z]+(-[A-Za-z0-9]+)+$/,
                      message:
                        "El código del proyecto debe estar conformado por una combinación de letras y números separadas por guiones.",
                    },
                  }}
                  disable={false}
                />

                <InputSelect
                  name="rolEnProyecto"
                  label="Rol en el proyecto"
                  options={rolOptions}
                  rules={{ required: "El rol en el proyecto es requerido" }}
                  disable={false}
                />
                {showInputDirector && (
                  <>
                    <InputText
                      name="nombreDirector"
                      label="Nombre del Director del Proyecto"
                      rules={{
                        required: "El nombre del Director es requerido",
                      }}
                      disable={false}
                    />
                  </>
                )}
              </>
            )}

            <LabelTitle text="Datos de la Publicación" />

            <InputText
              name="tituloPublicacion"
              label="Título de la Publicación"
              rules={{ required: "El título de la publicación es requerido" }}
              disable={false}
            />

            <InputText
              name="nombreRevista"
              label="Nombre de la Revista"
              rules={{ required: "El nombre de la revista es requerida" }}
              disable={false}
            />

            <InputTextArea
              name="autoresEPN"
              label="Autores de la EPN"
              infoText="(Titulares, Ocasionales, otros)"
              placeholder="Escriba aquí los nombres de los autores separados por comas (,)"
              rules={{ required: "Los autores son requeridos" }}
              disable={false}
            />

            <InputTextArea
              name="autoresExternos"
              label="Autores Externos"
              placeholder="Escriba aquí los nombres de los autores separados por comas (,)"
              rules={{ required: "Los autores son requeridos" }}
              disable={false}
            />
            <InputSelect
              name="baseDatos"
              label="Base de Datos de Indexación"
              infoText="El auspicio estará sujeto a lo indicado en el correspondiente procedimiento."
              options={optionsBD}
              rules={{ required: "La base de datos de indexación es requerida" }}
              disabled={false}
            />

            <InputSelect
              name="cuartilPublicacion"
              label="Cuartil de la Publicación"
              infoText="El auspicio estará sujeto a lo indicado en el correspondiente procedimiento."
              options={optionsCuartil}
              rules={{ required: "El cuartil de la publicación es requerido" }}
              disabled={false}
            />
       
       <div >
       <h3>• Valor de la publicación</h3>
        <p>
        Recuerde seleccionar la fecha máxima de pago.
        </p>
       
             {/* Tabla Dinámica */}
             <div className="scroll-table-container">
               <table className="payment-table">
               <thead>
               <tr>
                   <th>Nro.</th>
                   <th>Moneda</th>
                   <th>Valor de inscripción</th>
                   <th>Fecha</th>
                   <th>Acciones</th>
                 </tr>
               </thead>
               <tbody>
                 {fields.map((field, index) => (
                   <tr key={field.id}>
                     <td>
                       <input
                         type="number"
                         value={index + 1} // Auto-incrementa el número basado en el índice
                         readOnly
                         className="form-input"
                       />
                     </td>
                     <td>
                       <select
                         id="monedaPago"
                         {...register(`publicaciones[${index}].monedaPago`, {
                           required: "La moneda es requerida",
                         })}
                         className="form-select"
                       >
                         <option value="">Seleccione</option>
                         <option value="$ ">Dólares</option>
                         <option value="€ ">Euros</option>
                         <option value="CHF ">
                           Francos Suizos
                         </option>
                       </select>
                       {errors.monedaPago && (
                         <span className="error-text">
                           {errors.monedaPago.message}
                         </span>
                       )}
                     </td>
       
                     <td>
                       <input
                         type="number"
                         step="0.01"
                         id={`valorPublicacion-${index}`}
                         placeholder="100.00"
                         className="form-input"
                         {...register(`publicaciones[${index}].valorPublicacion`, {
                           required: "Este campo es requerido",
                         })}
                       />
                       {errors.publicaciones &&
                         errors.publicaciones[index]?.valorPublicacion && (
                           <span className="error-text">
                             {errors.publicaciones[index].valorPublicacion.message}
                           </span>
                         )}
                     </td>
                            
                     <td>
                       <input
                         type="date"
                         id={`limiteFecha-${index}`}
                         className="form-input"
                         {...register(`publicaciones[${index}].limiteFecha`, {
                           validate: () => validarFechaLimiteInscripcion(index),
                         })}
                       />
                       {errors.publicaciones &&
                         errors.publicaciones[index]?.limiteFecha && (
                           <span className="error-text">
                             {errors.publicaciones[index].limiteFecha.message}
                           </span>
                         )}
                     </td>
                     <td>
                      <ActionButton
                        onClick={() => remove(index)}
                        label="Eliminar"
                        variant="danger"
                      />
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
             <ActionButton
                onClick={() =>
                  append({
                    valorInscripcion: "",
                    pagoLimite: "",
                    limiteFecha: "",
                  })
                }
                label="Agregar"
                variant="success"
              />
            </div>
            <LabelText text=" Considere que si el pago de inscripción es una moneda diferente a la
               moneda legal del país se requiere un banco intermediario , por lo que se
               solicita se comunique con la organización del evento para obtener esta
               información." />
            <LabelText text="En el caso que no exista banco intermediario se podrá solicitar un pago
               por reembolso siempre y cuando se tenga la contestación oficial de la
               organización de no tener un banco intermediario." />
       
             {/* Método de pago */}
             <div className="form-group">
               <h3>Método de pago:</h3>
       
               <div>
                 <input
                   type="radio"
                   id="transferencia"
                   value="Transferencia"
                   {...register("metodoPago", {
                     required: "Seleccione un método de pago",
                   })}
                 />
                 <label htmlFor="transferencia">
                   1. Transferencia ("El pago es realizado por la EOD-UGIPS del VIIV")
                 </label>
               </div>
               {metodoPago === "Transferencia" && (
                 <div className="sub-group">
                    <LabelText text="En la solicitud se debe adjuntar los siguientes documentos:" />
                    <LabelText text="Formulario de pagos al exterior (Anexo 6)" />
                    <LabelText text="Documento donde se puede verificar el costo y fechas de la inscripción al evento" />
                 </div>
               )}
               <div>
                 <input
                   type="radio"
                   id="otra"
                   value="Otra"
                   {...register("metodoPago", {
                     required: "Seleccione un método de pago",
                   })}
                 />
                 <label htmlFor="otra">
                   2. Otra (tarjeta de crédito, efectivo, etc.)
                 </label>
               </div>
               {metodoPago === "Otra" && (
                 <div className="sub-group">
                   
                  <Label text="Incluir la siguiente información y documentos:" />
                  <LabelText text="Solicitud de REEMBOLSO. Incluir en el texto del memorando la justificación de por qué se solicita este método de pago." />
                  <LabelText text="Documento donde se puede verificar el costo y fechas de la inscripción al evento" />
                  <LabelText text="Documento en el cual se indique que el pago solo se puede realizar con tarjeta de crédito o efectivo o que no cuenta con banco intermediario." />
                 </div>
               )}
               {errors.metodoPago && (
                 <span className="error-text">{errors.metodoPago.message}</span>
               )}
             </div>
           </div>

            {showInputParticipacion && (
                <>
            <LabelTitle text="DOCUMENTACIÓN REQUERIDA PARA PAGO DE ARTÍCULOS CIENTÍFICOS ACEPTADOS EN REVISTAS DE ALTO IMPACTO-DENTRO DE PROYECTOS" />
            <Label text="REQUISITOS:" />
            <LabelText text="• Formulario para pago de artículos científicos aceptados en revistas de alto impacto-dentro de proyectos." />
            <LabelText text="• Copia de la carta o correo de aceptación de la publicación." />
            <LabelText text="• Documento donde se puede verificar el costo de la publicación y la fecha máxima de pago." />
            <LabelText text="• Formulario de registro de cuenta o formulario de giro al exterior." />
            <LabelText text="• Copia del resumen del artículo para verificación de autores y filiación de la EPN." />
            <LabelText text="• Quipux del Director del Proyecto al Vicerrectorado de Investigación, Innovación y Vinculación, solicitando el pago de la publicación." />
            </>
            )}


              {showInputFueraProyecto && (
                <>
                <LabelTitle text="DOCUMENTACIÓN Y REQUISITOS REQUERIDOS PARA PAGO DE SUBVENCIONES PARA LA DIFUSIÓN DE ARTÍCULOS CIENTÍFICOS ACEPTADOS EN REVISTAS DE ALTO IMPACTO" />
                <Label text="REQUISITOS:" />
                <LabelText text="• La filiación del primer autor de la publicación debe ser la Escuela Politécnica Nacional. En el caso que la aparición de los autores sea por orden alfabético se deberá presentar la documentación en la que se indique quien consta como autor principal y este debe tener la filiación de la EPN." />
                <LabelText text="• La publicación debe tener un máximo de diez autores entre investigadores de la Escuela Politécnica Nacional y externos. Para auspiciar las publicaciones de más de cinco autores, al menos la mitad de estos debe pertenecer a la EPN." />
                <LabelText text="• La revista debe estar ubicada en el primer cuartil (Q1) o segundo cuartil (Q2) de la especialización-Indexada en Scimago Journal Rank." />
                <LabelText text="• El nombre de la Escuela Politécnica Nacional debe estar sin traducciones en la filiación de los autores según corresponda." />
                <LabelText text="• Formulario para el pago de subvenciones para la difusión de artículos científicos aceptados en revistas de alto impacto." />
                <LabelText text="• Copia de la carta o correo de aceptación de la publicación." />
                <LabelText text="• Documento donde se puede verificar el costo de la publicación y la fecha máxima de pago." />
                <LabelText text="• Formulario de registro de cuenta o formulario de giro al exterior." />
                <LabelText text="• Copia del resumen del artículo para verificación de autores y filiación de la EPN." />
                <LabelText text="• Quipux del profesor al Vicerrectorado de Investigación, Innovación y Vinculación, solicitando el auspicio para el pago de subvención de la publicación." />
                </>
              )}
         
            </div>

          {/* Botón para enviar el formulario */}
          <Row className="mt-4">
            <Col className="text-center">
            <Button id="btn_enviar" type="submit" variant="primary">
                Enviar
              </Button>
            </Col>
          </Row>
          <Label text="Descargar datos actuales en (.json)" />
          {/* Botón para descargar el formulario como .json */}
          <ActionButton
            onClick={handleDownloadJson}
            label="Descargar datos como JSON"
            variant="success"
          />
          {/* Sección de descarga de documentos, visible tras enviar el formulario */}
          {showDownloadSection && (
            <div className="mt-4">
              <Row className="justify-content-center">
                <Col md={4} className="text-center">
                  <DownloadButton
                    onClick={handleGenerateMemo1}
                    icon="IconWord.png"
                    altText="Word Icon"
                    label="Descargar Memorando Pago de Publicación"
                  />
                </Col>
                {showInputParticipacion && (
              <>
                <Col md={4} className="text-center">
                  <DownloadButton
                    onClick={handleGeneratePdf}
                    icon="IconPdf.png"
                    altText="PDF Icon"
                    label="Descargar Anexo 1"
                  />
                </Col>
                </>
                )}

                {showInputFueraProyecto&& (
                <>
                <Col md={4} className="text-center">
                  <DownloadButton
                    onClick={handleGeneratePdf2}
                    icon="IconPdf.png"
                    altText="PDF Icon"
                    label="Descargar Anexo 2"
                  />
                </Col>
                </>
                )}
              </Row>

              {/* Botón para descargar todos los documentos */}
              <Row className="mt-3">
                <Col className="text-center">
                  <ActionButton
                  onClick={handleDownloadAll}
                  label="Descargar Todo"
                  variant="success"
                  loading={loading}
                  />
                </Col>
              </Row>
            </div>
          )}

          {/* Botón para limpiar el formulario */}
          <Row className="mt-4">
            <Col className="text-center">
              <ActionButton
              onClick={() => setModalClearShow(true)}
              label="Limpiar Formulario"
              variant="danger"
              />
            </Col>
          </Row>
        </Form>
        <ToastContainer // Agrega este contenedor para que las notificaciones se puedan mostrar
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        {/* Modal de confirmación de los datos estan correctos */}
        <ConfirmationModal
            show={modalShow}
            onHide={() => setModalShow(false)}
            formData={methods.getValues()}
            onConfirm={handleConfirm}
            title="Confirmación del formulario"
            fieldLabels={fieldLabels} 
          />
          {/* Modal de confirmación para limpiar el formulario */}
          <ConfirmClearModal
            show={modalClearShow}
            onHide={() => setModalClearShow(false)} // Cierra el modal sin hacer nada
            onClear={handleClearForm} // Limpia el formulario
            onDownload={handleDownloadJson} // Descarga los datos en JSON
            title="Confirmación de limpieza"
          />
      </Container>
    </FormProvider>
  );
}
export default PublicationsPaymentForm;

const departamentoOptions = [
  {
    value: "DEPARTAMENTO DE AUTOMATIZACIÓN Y CONTROL INDUSTRIAL",
    label: "DEPARTAMENTO DE AUTOMATIZACIÓN Y CONTROL INDUSTRIAL",
  },
  {
    value: "DEPARTAMENTO DE BIOLOGÍA",
    label: "DEPARTAMENTO DE BIOLOGÍA",
  },
  {
    value: "DEPARTAMENTO DE CIENCIAS ADMINISTRATIVAS",
    label: "DEPARTAMENTO DE CIENCIAS ADMINISTRATIVAS",
  },
  {
    value: "DEPARTAMENTO DE CIENCIAS DE ALIMENTOS Y BIOTECNOLOGÍA",
    label: "DEPARTAMENTO DE CIENCIAS DE ALIMENTOS Y BIOTECNOLOGÍA",
  },
  {
    value: "DEPARTAMENTO DE CIENCIAS NUCLEARES",
    label: "DEPARTAMENTO DE CIENCIAS NUCLEARES",
  },
  {
    value: "DEPARTAMENTO DE CIENCIAS SOCIALES",
    label: "DEPARTAMENTO DE CIENCIAS SOCIALES",
  },
  {
    value: "DEPARTAMENTO DE ECONOMÍA CUANTITATIVA",
    label: "DEPARTAMENTO DE ECONOMÍA CUANTITATIVA",
  },
  {
    value:
      "DEPARTAMENTO DE ELECTRÓNICA, TELECOMUNICACIONES Y REDES DE LA INFORMACIÓN",
    label:
      "DEPARTAMENTO DE ELECTRÓNICA, TELECOMUNICACIONES Y REDES DE LA INFORMACIÓN",
  },
  {
    value: "DEPARTAMENTO DE ENERGÍA ELÉCTRICA",
    label: "DEPARTAMENTO DE ENERGÍA ELÉCTRICA",
  },
  {
    value: "DEPARTAMENTO DE ESTUDIOS ORGANIZACIONALES Y DESARROLLO HUMANO",
    label: "DEPARTAMENTO DE ESTUDIOS ORGANIZACIONALES Y DESARROLLO HUMANO",
  },
  {
    value: "DEPARTAMENTO DE FÍSICA",
    label: "DEPARTAMENTO DE FÍSICA",
  },
  {
    value: "DEPARTAMENTO DE FORMACIÓN BÁSICA",
    label: "DEPARTAMENTO DE FORMACIÓN BÁSICA",
  },
  {
    value: "DEPARTAMENTO DE GEOLOGÍA",
    label: "DEPARTAMENTO DE GEOLOGÍA",
  },
  {
    value: "DEPARTAMENTO DE INFORMÁTICA Y CIENCIAS DE LA COMPUTACIÓN",
    label: "DEPARTAMENTO DE INFORMÁTICA Y CIENCIAS DE LA COMPUTACIÓN",
  },
  {
    value: "DEPARTAMENTO DE INGENIERIA CIVIL Y AMBIENTAL",
    label: "DEPARTAMENTO DE INGENIERIA CIVIL Y AMBIENTAL",
  },
  {
    value: "DEPARTAMENTO DE INGENIERÍA MECÁNICA",
    label: "DEPARTAMENTO DE INGENIERÍA MECÁNICA",
  },
  {
    value: "DEPARTAMENTO DE INGENIERÍA QUÍMICA",
    label: "DEPARTAMENTO DE INGENIERÍA QUÍMICA",
  },
  {
    value: "DEPARTAMENTO DE MATERIALES",
    label: "DEPARTAMENTO DE MATERIALES",
  },
  {
    value: "DEPARTAMENTO DE MATEMÁTICA",
    label: "DEPARTAMENTO DE MATEMÁTICA",
  },
  {
    value: "DEPARTAMENTO DE METALURGIA EXTRACTIVA",
    label: "DEPARTAMENTO DE METALURGIA EXTRACTIVA",
  },
  {
    value: "DEPARTAMENTO DE PETRÓLEOS",
    label: "DEPARTAMENTO DE PETRÓLEOS",
  },
  {
    value: "INSTITUTO GEOFISICO",
    label: "INSTITUTO GEOFISICO",
  },
];
const participacionOptions = [
  {
    value: "fueraProyecto",
    label: "Fuera de Proyecto",
  },
  {
    value: "dentroProyecto",
    label: "Dentro de Proyecto",
  },
];

const rolOptions = [
  {
    value: "Director",
    label: "Director",
  },
  {
    value: "Codirector",
    label: "Codirector",
  },
  {
    value: "Colaborador",
    label: "Colaborador",
  },
];
const optionsBD = [
  { value: "Scopus (SJR)", label: "Scopus (SJR)" },
  { value: "Web of Science (JCR)", label: "Web of Science (JCR)" },
  { value: "Latindex", label: "Latindex" },
  { value: "Scielo", label: "Scielo" }
];
const optionsCuartil = [
  { value: "Q1", label: "Q1" },
  { value: "Q2", label: "Q2" },
  { value: "Q3", label: "Q3" },
  { value: "Q4", label: "Q4" },
  { value: "Sin cuartil", label: "Sin cuartil" }
];  
