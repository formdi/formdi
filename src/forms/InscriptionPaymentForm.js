import React, { useState, useEffect } from "react";
import { useForm, FormProvider, useFieldArray  } from "react-hook-form";
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
import InputDate from "../components/Inputs/InputDate.js";
import RadioGroup from "../components/Inputs/RadioGroup.js";
import ActionButton from "../components/Buttons/ActionButton.js";
import DownloadButton from "../components/Buttons/DownloadButton.js";
import today from "../utils/date.js";
// Modals
import ConfirmationModal from "../components/Modals/ConfirmationModal.js";
import ConfirmClearModal from "../components/Modals/ConfirmClearModal.js";

// Importación de las funciones para generar documentos
import {
  generateMemoInscriptionPaymentOutProyect1,
  generateAnexo5InscriptionPayment,
} from "../utils/generatorDocuments/services/serviceDocuments";
import { validarCedulaEcuatoriana, validarFechaFin} from "../utils/validaciones.js";

const formStorageKey = "formInscriptionPayment"; // Clave para almacenar el formulario en localStorage
const formData = JSON.parse(sessionStorage.getItem(formStorageKey)) || {}; // Datos del formulario desde localStorage
// Diccionario de etiquetas amigables para este formulario específico
const fieldLabels = {
  codigoProyecto: 'Código del Proyecto',
  nombreDirector: 'Nombre del Director',
  cargoDirector: 'Cargo del Director',
  detalleArticuloSI: 'Detalle del Artículo (SI)',

  inscripciones: 'Inscripciones',
  'inscripciones[].valorInscripcion': 'Valor de la Inscripción',
  'inscripciones[].pagoLimite': 'Límite de Pago',
  'inscripciones[].limiteFecha': 'Fecha Límite',
  'inscripciones[].monedaPago': 'Moneda de Pago',

  metodoPago: 'Método de Pago',
  nombres: 'Nombres',
  apellidos: 'Apellidos',
  cedula: 'Cédula',
  departamento: 'Departamento',
  participacionProyecto: 'Participación en el Proyecto',
  tituloEvento: 'Título del Evento',
  ciudadEvento: 'Ciudad del Evento',
  paisEvento: 'País del Evento',
  fechaInicioEvento: 'Fecha de Inicio del Evento',
  fechaFinEvento: 'Fecha de Fin del Evento',
  RelevanciaAcademica: 'Relevancia Académica',
  tituloPonencia: 'Título de la Ponencia',
  tituloArticulo: 'Título del Artículo',
  articuloPublicado: 'Artículo Publicado'
};


function InscriptionPaymentForm() {
  
  // Configuración del formulario con react-hook-form y valores predeterminados desde localStorage
  const methods = useForm({mode: "onChange", reValidateMode: "onChange", defaultValues: formData,});

  const { register, control, watch, reset, setValue, formState:{errors} } = methods;

  const { fields, append, remove } = useFieldArray({ control, name: "inscripciones"});

  // Observadores para campos clave
  const participacionProyecto = watch("participacionProyecto");
  const rolEnProyecto = watch("rolEnProyecto");
  const seleccionArticulo = watch("articuloPublicado");
  const fechaFinEvento = watch("fechaFinEvento");
  const metodoPago = watch("metodoPago");
  const [showDownloadSection, setShowDownloadSection] = useState(false);
  const [showInputParticipacion, setShowInputParticipacion] = useState(false);
  const [showInputDirector, setShowInputDirector] = useState(false);
  const [showInputArticulo, setShowInputArticulo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [modalClearShow, setModalClearShow] = useState(false);

  // Efecto para sincronizar con localStorage 
  useEffect(() => {
    reset(formData);
    // Suscribirse a los cambios en el formulario para guardar en localStorage y actualizar las secciones visibles
    const subscription = watch((data) => {
      sessionStorage.setItem(formStorageKey, JSON.stringify(data));

      // Lógica para mostrar u ocultar campos basados en los valores del formulario
      setShowInputParticipacion(data.participacionProyecto === "dentroProyecto");
      setShowInputDirector(data.rolEnProyecto === "Codirector"||data.rolEnProyecto === "Colaborador");
      setShowInputArticulo(data.articuloPublicado === "SI");
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

    if (rolEnProyecto === "Codirector" || rolEnProyecto === "Colaborador") {
      setShowInputDirector(true);
    } else {
      setShowInputDirector(false);
      setValue("nombreDirector", "");
      setValue("cargoDirector", "");
    }

    if (seleccionArticulo === "SI") {
      setShowInputArticulo(true);
    } else {
      setShowInputArticulo(false);
      setValue("detalleArticuloSI", "");
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
  const onSubmitInscriptionPayment = (data) => {
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
    saveAs(blob, "Pago de Inscripción.json");
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
    const formInscriptionPayment = methods.getValues();
    generateMemoInscriptionPaymentOutProyect1(formInscriptionPayment);
    setShowDownloadSection(false);
  };

  const handleGeneratePdf = () => {
    const formInscriptionPayment = methods.getValues();
    generateAnexo5InscriptionPayment(formInscriptionPayment);
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
        const docxBlob = await generateMemoInscriptionPaymentOutProyect1(formData, true);
        const pdfBlob = await generateAnexo5InscriptionPayment(formData, true);

        // Crear un nuevo archivo ZIP y agregar los documentos
        const zip = new JSZip();
        zip.file("Pago de Inscripción.json", jsonBlob);
        zip.file("Memorando Pago de Inscripción.docx", docxBlob);
        zip.file("Anexo 5 - Inscripción.pdf", pdfBlob);

        // Generar el archivo ZIP final y descargarlo
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "Documentos Pago de Inscripción.zip");

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
          Formulario para Pago de Inscripción Dentro o Fuera de Proyectos
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
        <Form onSubmit={methods.handleSubmit(onSubmitInscriptionPayment)}>
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

            <LabelTitle text="Detalles del Evento" />

            <InputText
              name="tituloEvento"
              label="Título del Evento"
              rules={{ required: "El título del evento es requerido" }}
              disable={false}
            />

            <InputText
              name="ciudadEvento"
              label="Ciudad"
              rules={{ required: "La ciudad del evento es requerida" }}
              disable={false}
            />

            <InputText
              name="paisEvento"
              label="País"
              rules={{ required: "El país del evento es requerido" }}
              disable={false}
            />
            <Label text="Fechas del evento" />
            <InputDate
              name="fechaInicioEvento"
              label="Desde:"
              rules={{
                required: "La fecha de inicio del evento es requerida",
                validate: (value) => {
                  return (
                    value >= today() ||
                    "La fecha de inicio no puede ser anterior a la fecha actual."
                  );
                },
              }}
              disable={false}
            />

            <InputDate
              name="fechaFinEvento"
              label="Hasta:"
              rules={{
                required: "La fecha de finalización es requerida",
                validate: (value) =>
                  validarFechaFin(value, watch("fechaInicioEvento")),
              }}
              disable={false}
            />

            <InputTextArea
              name="RelevanciaAcademica"
              label="Relevancia Académica del evento"
              rules={{
                required: "La relevancia académica del evento es requerida",
              }}
              disable={false}
            />

            <InputText
              name="tituloPonencia"
              label="Título de la Ponencia"
              disable={false}
            />

            <InputText
              name="tituloArticulo"
              label="Título del Artículo"
              rules={{ required: "El título del artículo es requerido" }}
              disable={false}
            />

            <RadioGroup
              label="¿El Artículo será publicado?"
              name="articuloPublicado"
              options={articuloOptions}
              rules={{ required: "Indique si el artículo será publicado" }}
              disable={false}
            />

            {showInputArticulo && (
              <InputText
                name="detalleArticuloSI"
                label="Detalle"
                infoText="Por favor, ingrese el nombre de la revista y base de datos indexadas, 
                el número especial de revista o memorias del evento, 
                la revista o memorias en las cuales se publicará el artículo."
                placeholder="Especifique"
                rules={{
                  required: "Por favor el detalle del artículo es requerido",
                }}
                disable={false}
              />
            )}

<div >
             <h3>• Valor de la inscripción</h3>
             <p>
               Por favor, ingrese las fechas máximas de pago según la información
               proporcionada en la página oficial del evento. Recuerde que solo se debe
               seleccionar una de las tres opciones disponibles para la fecha de pago,
               y asegúrese de que la fecha seleccionada no sea posterior a la fecha de
               inicio del evento.
             </p>
       
             {/* Tabla Dinámica */}
             <div className="scroll-table-container">
             <table className="payment-table">
               <thead>
               <tr>
                   <th>Nro.</th>
                   <th>Moneda</th>
                   <th>Valor de inscripción</th>
                   <th>Pago a realizarse</th>
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
                         {...register(`inscripciones[${index}].monedaPago`, {
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
                         id={`valorInscripcion-${index}`}
                         placeholder="100.00"
                         className="form-input"
                         {...register(`inscripciones[${index}].valorInscripcion`, {
                           required: "Este campo es requerido",
                         })}
                       />
                       {errors.inscripciones &&
                         errors.inscripciones[index]?.valorInscripcion && (
                           <span className="error-text">
                             {errors.inscripciones[index].valorInscripcion.message}
                           </span>
                         )}
                     </td>
                     <td>
                       <select
                         id="pagoLimite"
                         {...register(`inscripciones[${index}].pagoLimite`, {
                           required: "El pago limite es requerido",
                         })}
                         className="form-select"
                       >
                         <option value="">Seleccione</option>
                         <option value="Antes del ">Antes</option>
                         <option value="Despues del ">Despues</option>
                         <option value="Hasta el ">
                           Fecha maxima de pago
                         </option>
                       </select>
                       {errors.pagoLimite && (
                         <span className="error-text">
                           {errors.pagoLimite.message}
                         </span>
                       )}
                     </td>
       
                     <td>
                       <input
                         type="date"
                         id={`limiteFecha-${index}`}
                         className="form-input"
                         {...register(`inscripciones[${index}].limiteFecha`, {
                           validate: () => validarFechaLimiteInscripcion(index),
                         })}
                       />
                       {errors.inscripciones &&
                         errors.inscripciones[index]?.limiteFecha && (
                           <span className="error-text">
                             {errors.inscripciones[index].limiteFecha.message}
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
            

            <LabelTitle text="DOCUMENTACIÓN REQUERIDA PARA PAGOS DE INSCRIPCIÓN" />
            <Label text="REQUISITOS:" />
            <LabelText text="• Formulario para pago de inscripciones." />
            <LabelText text="• Copia de la carta o correo de la aceptación de la ponencia y/o poster para participar en el evento." />
            <LabelText text="• Copia del artículo, ponencia o poster aceptado para verificación de autores y afiliación de la EPN." />
            <LabelText text="• Documento donde se pueda verificar el costo y  fechas de pago de inscripción al evento (NO factura/ NO invoice)." />
            <LabelText text="• Formulario de pagos al exterior, según el caso, incluir el banco intermediario que corresponda." />
            <LabelText text="• Quipux del Director del Proyecto o Profesor solicitante dirigido al Vicerrectorado de Investigación, Innovación y Vinculación en el cual deberá solicitar el pago de la inscripción." />
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
                    label="Descargar Memorando Pago de Inscripcion"
                  />
                </Col>

                <Col md={4} className="text-center">
                  <DownloadButton
                    onClick={handleGeneratePdf}
                    icon="IconPdf.png"
                    altText="PDF Icon"
                    label="Descargar Anexo 5"
                  />
                </Col>
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
export default InscriptionPaymentForm;


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

const articuloOptions = [
  {
    value: "SI",
    label: "SI",
  },
  {
    value: "NO",
    label: "NO",
  },
];