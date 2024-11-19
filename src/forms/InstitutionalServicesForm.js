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
import InputDate from "../components/Inputs/InputDate.js";
import today from "../utils/date.js";
// Modals
import ConfirmationModal from "../components/Modals/ConfirmationModal.js";
import ConfirmClearModal from "../components/Modals/ConfirmClearModal.js";

import {
  generateAnexo4InstitutionalServices,
  generateMemoInstitutionalServices,
} from "../utils/generatorDocuments/services/serviceDocuments";
import { validarCedulaEcuatoriana,validarFechaFin, validateFechaLlegadaIda, validateFechaSalidaRegreso } from "../utils/validaciones.js";
const formStorageKey = "formInstitutionalServices"; // Clave para almacenar el formulario en localStorage
const formData = JSON.parse(sessionStorage.getItem(formStorageKey)) || {}; // Datos del formulario desde localStorage

const fieldLabels = {
  codigoProyecto: 'Código del Proyecto',
  nombreDirector: 'Nombre del Director',
  cargoDirector: 'Cargo del Director',

  transporteIda: 'Cronograma de Transporte de Ida',
  'transporteIda[].tipoTransporte': 'Tipo de Transporte',
  'transporteIda[].nombreTransporte': 'Nombre del Transporte',
  'transporteIda[].ruta': 'Ruta',
  'transporteIda[].fechaSalida': 'Fecha de Salida',
  'transporteIda[].horaSalida': 'Hora de Salida',
  'transporteIda[].fechaLlegada': 'Fecha de Llegada',
  'transporteIda[].horaLlegada': 'Hora de Llegada',

  transporteRegreso: 'Cronograma de Transporte de Regreso',
  'transporteRegreso[].tipoTransporte': 'Tipo de Transporte',
  'transporteRegreso[].nombreTransporte': 'Nombre del Transporte',
  'transporteRegreso[].ruta': 'Ruta de Regreso',
  'transporteRegreso[].fechaSalida': 'Fecha de Salida',
  'transporteRegreso[].horaSalida': 'Hora de Salida',
  'transporteRegreso[].fechaLlegada': 'Fecha de Llegada',
  'transporteRegreso[].horaLlegada': 'Hora de Llegada',

  nombres: 'Nombres',
  apellidos: 'Apellidos',
  cedula: 'Cédula',
  puesto: 'Puesto',
  nombreJefeInmediato: 'Nombre del Jefe Inmediato',
  cargoJefeInmediato: 'Cargo del Jefe Inmediato',
  tituloEvento: 'Título del Evento',
  ciudadServicio: 'Ciudad del Servicio',
  provinciaServicio: 'Provincia del Servicio',
  nombreUnidad: 'Nombre de la Unidad',
  servidores: 'Servidores',
  actividades: 'Actividades',
  productos: 'Productos',
  otrasTareas: 'Otras Tareas',
  fechaInicioEvento: 'Fecha de Inicio del Evento',
  fechaFinEvento: 'Fecha de Fin del Evento',
  departamento: 'Departamento',
  inscripciones: 'Inscripciones'
};

function InstitutionalServicesForm(){

  const methods = useForm({ mode: "onChange", reValidateMode: "onChange", defaultValues: formData, });
  const { register, control, watch, reset, setValue, formState:{errors} } = methods;

  const { fields, append, remove } = useFieldArray({ control, name: "inscripciones"});
  const { fields: fieldsIda, append: appendIda, remove: removeIda } = useFieldArray({ control, name: "transporteIda"});
  const { fields: fieldsRegreso, append: appendRegreso, remove: removeRegreso} = useFieldArray({ control, name: "transporteRegreso"});

  // Observadores para campos clave
  const participacionProyecto = watch("participacionProyecto");
  const rolEnProyecto = watch("rolEnProyecto");
  const fechaInicioEvento = watch("fechaInicioEvento");
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
    const subscription = watch((data) => {
      sessionStorage.setItem(formStorageKey, JSON.stringify(data));
      setShowInputParticipacion(data.participacionProyecto === "dentroProyecto");
      setShowInputDirector(data.rolEnProyecto === "Colaborador"||data.rolEnProyecto === "Codirector");
      setShowInputFueraProyecto(data.participacionProyecto === "fueraProyecto");
    });
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

    if (fieldsIda.length === 0) {
      appendIda({
        tipoTransporte: "Aéreo",
        nombreTransporte: "",
        ruta: "",
        fechaSalida: "",
        horaSalida: "",
        fechaLlegada: "",
        horaLlegada: "",
      });
    }

    if (fieldsRegreso.length === 0) {
      appendRegreso({
        tipoTransporte: "Aéreo",
        nombreTransporte: "",
        ruta: "",
        fechaSalida: "",
        horaSalida: "",
        fechaLlegada: "",
        horaLlegada: "",
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
  const onSubmitInstitutionalServices = (data) => {
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
    saveAs(blob, "Servicios Institucionales.json");
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
    
    const formInstitutionalServices = methods.getValues();
    generateMemoInstitutionalServices(formInstitutionalServices);
    setShowDownloadSection(false);
    
  };

  const handleGeneratePdf = () => {
    const formInstitutionalServices = methods.getValues();
    generateAnexo4InstitutionalServices(formInstitutionalServices);
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
        const docxBlob = await generateMemoInstitutionalServices(formData, true);
        const pdfBlob = await generateAnexo4InstitutionalServices(formData, true);

        // Crear un nuevo archivo ZIP y agregar los documentos
        const zip = new JSZip();
        zip.file("Servicios Institucionales.json", jsonBlob);
        zip.file("Memorando Servicios Institucionales.docx", docxBlob);
        zip.file("Anexo 4 - Servicios Institucionales.pdf", pdfBlob);

        // Generar el archivo ZIP final y descargarlo
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "Documentos_Servicios_Institucionales.zip");

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


  return (
    <FormProvider {...methods}>
      <Container>
        {/* Título del formulario */}
        <h1 className="text-center my-4">
          Formulario para Servicios Institucionales
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
        <Form onSubmit={methods.handleSubmit(onSubmitInstitutionalServices)}>
          {/* Formulario con diferentes secciones */}
          <div className="form-container">
            <LabelTitle text="Datos Personales" />

            <InputText
              name="nombres"
              label="Nombres del servidor"
              placeholder="Juan Sebastian"
              rules={{ required: "Los nombres son requeridos" }}
              disabled={false}
            />

            <InputText
              name="apellidos"
              label="Apellidos del servidor"
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

            <InputText
              name="puesto"
              label="Puesto que ocupa"
              infoText="Tal como consta en su acción de personal. Ejemplos: Profesor Agregado a Tiempo Completo; Profesor Auxiliar a Tiempo Completo; Profesor Principal a Tiempo Completo."
              rules={{ required: "Los apellidos son requeridos" }}
              disabled={false}
            />

            <InputText
              name="nombreJefeInmediato"
              label="Nombres y Apellidos del Jefe Inmediato"
              rules={{ required: "El nombre del jefe inmediato es requerido" }}
              disabled={false}
            />

            <InputText
              name="cargoJefeInmediato"
              label="Cargo del Jefe inmediato"
              infoText="Favor colocar el cargo del Jefe inmediato, puede usar las siglas
              para referirse al departamento. Para referirse al departamento. Ejemplo: Jefe del DACI / Jefe del DACI, subrogante"
              rules={{
                required: "El cargo del jefe inmediato es requerido",
            minLength: {
              value: 10,
              message: "El cargo que escribio es demasiado corto",
            },
              }}
            />

          <InputText
              name="tituloEvento"
              label="Nombre del evento al que asisitio"
              rules={{ required: "El evento es requerido" }}
              disabled={false}
            />

            <InputText
              name="ciudadServicio"
              label="Ciudad"
              rules={{ required: "La ciudad del servicio institucional es requerida" }}
              disabled={false}
            />

            <InputText
              name="provinciaServicio"
              label="Provincia"
              rules={{ required: "La provincia del servicio institucional es requerido" }}
              disabled={false}
            />

            <InputText
              name="nombreUnidad"
              label="Nombre de la Unidad a la que pertenece"
              rules={{ required: "La provincia del servicio institucional es requerido" }}
              disabled={false}
            />

            <InputTextArea
                name="servidores"
                label="Servidores que integran el servicio insitucional"
                placeholder="Escriba aquí los nombres de los funcionarios, separados por comas"
                rules={{ required: "La servidores institucionales son requeridos" }}
                disabled={false}
            />

            <InputTextArea
                name="actividades"
                label="Actividades realizadas"
                placeholder="Detalle las actividades realizadas separados por comas (,)"
                rules={{ required: "Este campo es requerido" }}
                disabled={false}
            />

            <InputTextArea
                name="productos"
                label="Productos Alcanzados"
                placeholder="Detalle los productos separados por comas (,)"
                rules={{ required: "Este campo es requerido" }}
                disabled={false}
            />

            <InputTextArea
                name="otrasTareas"
                label="Otras tareas realizadas para la EPN durante la comisión de servicios:"
                placeholder="Detalle las otras tareas realizadas separados por comas (,)"
                rules={{ required: "Este campo es requerido" }}
                disabled={false}
            />

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
              disabled={false}
            />

            <InputDate
              name="fechaFinEvento"
              label="Hasta:"
              rules={{
                required: "La fecha de finalización es requerida",
                validate: (value) =>
                  validarFechaFin(value, watch("fechaInicioEvento")),
              }}
              disabled={false}
            />

            <InputSelect
              name="departamento"
              label="Departamento / Instituto"
              rules={{ required: "El departamento es requerido" }}
              disable={false}
              options={departamentoOptions}
            />

          <LabelTitle text="Transporte" disabled={false} />
            <LabelText
              text="Por favor, considere que el itinerario es tentativo. Consulte el
                itinerario del medio de transporte elegido en su página oficial
                o sitios web de confianza. Seleccione la opción que ofrezca el
                menor tiempo de viaje y el menor número de escalas de ser el
                caso."
            />
            <Label text="TRANSPORTE DE IDA" />
            <LabelText text="Para el ingreso de itinerario de viaje, considere que se puede llegar al destino máximo un día antes del inicio del evento." />

            <div className="scroll-table-container">
              <table className="activity-schedule-table">
                <thead>
                  <tr>
                    <th>Tipo de Transporte</th>
                    <th>Nombre de Transporte</th>
                    <th>Ruta Transporte</th>
                    <th>Fecha de Salida</th>
                    <th>Hora de Salida</th>
                    <th>Fecha de Llegada</th>
                    <th>Hora de Llegada</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {fieldsIda.map((field, index) => {
                    const fechaSalida = watch(
                      `transporteIda[${index}].fechaSalida`
                    );
                    const fechaLlegadaAnterior = watch(
                      `transporteIda[${index - 1}].fechaLlegada`
                    );
                    return (
                      <tr key={field.id}>
                        <td>
                          <select
                            id={`tipoTransporte-${index}`}
                            className="form-input"
                            defaultValue="Aéreo"
                            {...register(
                              `transporteIda[${index}].tipoTransporte`,
                              {
                                required: "Este campo es requerido",
                              }
                            )}
                          >
                            <option value="Aéreo">Aéreo</option>
                            <option value="Terrestre">Terrestre</option>
                            <option value="Marítimo">Marítimo</option>
                            <option value="Otros">Otros</option>
                          </select>
                          {errors.transporteIda &&
                            errors.transporteIda[index]?.tipoTransporte && (
                              <span className="error-text">
                                {
                                  errors.transporteIda[index].tipoTransporte
                                    .message
                                }
                              </span>
                            )}
                        </td>
                        <td>
                          <input
                            type="text"
                            id={`nombreTransporte-${index}`}
                            className="form-input"
                            {...register(
                              `transporteIda[${index}].nombreTransporte`,
                              {
                                required: "Este campo es requerido",
                              }
                            )}
                          />
                          {errors.transporteIda &&
                            errors.transporteIda[index]?.nombreTransporte && (
                              <span className="error-text">
                                {
                                  errors.transporteIda[index].nombreTransporte
                                    .message
                                }
                              </span>
                            )}
                        </td>
                        <td>
                          <input
                            type="text"
                            id={`ruta-${index}`}
                            placeholder="UIO-GYE"
                            className="form-input"
                            {...register(`transporteIda[${index}].ruta`, {
                              required: "Este campo es requerido",
                            })}
                          />
                          {errors.transporteIda &&
                            errors.transporteIda[index]?.ruta && (
                              <span className="error-text">
                                {errors.transporteIda[index].ruta.message}
                              </span>
                            )}
                        </td>
                        <td>
                          <input
                            type="date"
                            id={`fechaSalida-${index}`}
                            className="form-input"
                            {...register(
                              `transporteIda[${index}].fechaSalida`,
                              {
                                required: "Este campo es requerido",
                                validate: {
                                  noPastDate: (value) =>
                                    value >= today ||
                                    "La fecha no puede ser menor a la fecha actual",
                                  validSequence: (value) =>
                                    !fechaLlegadaAnterior ||
                                    value >= fechaLlegadaAnterior ||
                                    "La fecha de salida debe ser posterior a la fecha de llegada anterior",
                                },
                              }
                            )}
                          />
                          {errors.transporteIda &&
                            errors.transporteIda[index]?.fechaSalida && (
                              <span className="error-text">
                                {
                                  errors.transporteIda[index].fechaSalida
                                    .message
                                }
                              </span>
                            )}
                        </td>
                        <td>
                          <input
                            type="time"
                            id={`horaSalida-${index}`}
                            className="form-input"
                            {...register(`transporteIda[${index}].horaSalida`, {
                              required: "Este campo es requerido",
                            })}
                          />
                          {errors.transporteIda &&
                            errors.transporteIda[index]?.horaSalida && (
                              <span className="error-text">
                                {errors.transporteIda[index].horaSalida.message}
                              </span>
                            )}
                        </td>
                        <td>
                          <input
                            type="date"
                            id={`fechaLlegada-${index}`}
                            className="form-input"
                            {...register(
                              `transporteIda[${index}].fechaLlegada`,
                              {
                                required: "Este campo es requerido",
                                validate: {
                                  noPastDate: (value) =>
                                    value >= today || "La fecha no puede ser menor a la fecha actual",
                                  afterSalida: (value) =>
                                    value >= fechaSalida || "La fecha de llegada debe ser posterior o igual a la fecha de salida",
                                  
                                  // Condicionalmente, aplica la validación de llegada si es el último campo en `fieldsIda`
                                  validateFechaLlegadaIda: (value) =>
                                    index === fieldsIda.length - 1
                                      ? validateFechaLlegadaIda(value, fechaInicioEvento)
                                      : true, // Si no es el último campo, no aplica esta validación
                                },
                              }
                            )}
                          />
                          {errors.transporteIda &&
                            errors.transporteIda[index]?.fechaLlegada && (
                              <span className="error-text">
                                {
                                  errors.transporteIda[index].fechaLlegada
                                    .message
                                }
                              </span>
                            )}
                        </td>
                        <td>
                          <input
                            type="time"
                            id={`horaLlegada-${index}`}
                            className="form-input"
                            {...register(
                              `transporteIda[${index}].horaLlegada`,
                              {
                                required: "Este campo es requerido",
                              }
                            )}
                          />
                          {errors.transporteIda &&
                            errors.transporteIda[index]?.horaLlegada && (
                              <span className="error-text">
                                {
                                  errors.transporteIda[index].horaLlegada
                                    .message
                                }
                              </span>
                            )}
                        </td>
                        <td>
                          <ActionButton
                            onClick={() => removeIda(index)}
                            label="Eliminar"
                            variant="danger"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <ActionButton
                onClick={() => {
                  appendIda({
                    tipoTransporte: "Aéreo",
                    nombreTransporte: "",
                    ruta: "",
                    fechaSalida: "",
                    horaSalida: "",
                    fechaLlegada: "",
                    horaLlegada: "",
                  });
                }}
                label="Agregar"
                variant="success"
              />
            </div>

            <Label text="TRANSPORTE DE REGRESO" />
            <LabelText
              text=" El retorno puede ser máximo un día después de la finalización
                del evento."
            />

            <div className="scroll-table-container">
              <table className="activity-schedule-table">
                <thead>
                  <tr>
                    <th>Tipo de Transporte</th>
                    <th>Nombre de Transporte</th>
                    <th>Ruta Transporte</th>
                    <th>Fecha de Salida</th>
                    <th>Hora de Salida</th>
                    <th>Fecha de Llegada</th>
                    <th>Hora de Llegada</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {fieldsRegreso.map((field, index) => {
                    const fechaSalida = watch(
                      `transporteRegreso[${index}].fechaSalida`
                    );
                    const fechaLlegadaAnterior = watch(
                      `transporteRegreso[${index - 1}].fechaLlegada`
                    );
                    return (
                      <tr key={field.id}>
                        <td>
                          <select
                            id={`tipoTransporte-${index}`}
                            className="form-input"
                            defaultValue="Aéreo"
                            {...register(
                              `transporteRegreso[${index}].tipoTransporte`,
                              {
                                required: "Este campo es requerido",
                              }
                            )}
                          >
                            <option value="Aéreo">Aéreo</option>
                            <option value="Terrestre">Terrestre</option>
                            <option value="Marítimo">Marítimo</option>
                            <option value="Otros">Otros</option>
                          </select>
                          {errors.transporteRegreso &&
                            errors.transporteRegreso[index]?.tipoTransporte && (
                              <span className="error-text">
                                {
                                  errors.transporteRegreso[index].tipoTransporte
                                    .message
                                }
                              </span>
                            )}
                        </td>
                        <td>
                          <input
                            type="text"
                            id={`nombreTransporte-${index}`}
                            className="form-input"
                            {...register(
                              `transporteRegreso[${index}].nombreTransporte`,
                              {
                                required: "Este campo es requerido",
                              }
                            )}
                          />
                          {errors.transporteRegreso &&
                            errors.transporteRegreso[index]
                              ?.nombreTransporte && (
                              <span className="error-text">
                                {
                                  errors.transporteRegreso[index]
                                    .nombreTransporte.message
                                }
                              </span>
                            )}
                        </td>
                        <td>
                          <input
                            type="text"
                            id={`ruta-${index}`}
                            placeholder="UIO-GYE"
                            className="form-input"
                            {...register(`transporteRegreso[${index}].ruta`, {
                              required: "Este campo es requerido",
                            })}
                          />
                          {errors.transporteRegreso &&
                            errors.transporteRegreso[index]?.ruta && (
                              <span className="error-text">
                                {errors.transporteRegreso[index].ruta.message}
                              </span>
                            )}
                        </td>
                        <td>
                          <input
                            type="date"
                            id={`fechaSalida-${index}`}
                            className="form-input"
                            {...register(
                              `transporteRegreso[${index}].fechaSalida`,
                              {
                                required: "Este campo es requerido",
                                validate: {
                                  noPastDate: (value) =>
                                    value >= today || "La fecha no puede ser menor a la fecha actual",
                                  validSequence: (value) =>
                                    !fechaLlegadaAnterior ||
                                    value >= fechaLlegadaAnterior ||
                                    "La fecha de salida debe ser posterior a la fecha de llegada anterior",
                                  
                                  // Condicionalmente, aplica la validación de salida si es el primer campo en `fieldsRegreso`
                                  validateRegreso: (value) =>
                                    index === 0 ? validateFechaSalidaRegreso(value, fechaFinEvento) : true,
                                },
                              }
                            )}
                          />
                          {errors.transporteRegreso &&
                            errors.transporteRegreso[index]?.fechaSalida && (
                              <span className="error-text">
                                {
                                  errors.transporteRegreso[index].fechaSalida
                                    .message
                                }
                              </span>
                            )}
                        </td>
                        <td>
                          <input
                            type="time"
                            id={`horaSalida-${index}`}
                            className="form-input"
                            {...register(
                              `transporteRegreso[${index}].horaSalida`,
                              {
                                required: "Este campo es requerido",
                              }
                            )}
                          />
                          {errors.transporteRegreso &&
                            errors.transporteRegreso[index]?.horaSalida && (
                              <span className="error-text">
                                {
                                  errors.transporteRegreso[index].horaSalida
                                    .message
                                }
                              </span>
                            )}
                        </td>
                        <td>
                          <input
                            type="date"
                            id={`fechaLlegada-${index}`}
                            className="form-input"
                            {...register(
                              `transporteRegreso[${index}].fechaLlegada`,
                              {
                                required: "Este campo es requerido",
                                validate: {
                                  noPastDate: (value) =>
                                    value >= today ||
                                    "La fecha no puede ser menor a la fecha actual",
                                  afterSalida: (value) =>
                                    value >= fechaSalida ||
                                    "La fecha de llegada debe ser posterior o igual a la fecha de salida",
                                },
                              }
                            )}
                          />
                          {errors.transporteRegreso &&
                            errors.transporteRegreso[index]?.fechaLlegada && (
                              <span className="error-text">
                                {
                                  errors.transporteRegreso[index].fechaLlegada
                                    .message
                                }
                              </span>
                            )}
                        </td>
                        <td>
                          <input
                            type="time"
                            id={`horaLlegada-${index}`}
                            className="form-input"
                            {...register(
                              `transporteRegreso[${index}].horaLlegada`,
                              {
                                required: "Este campo es requerido",
                              }
                            )}
                          />
                          {errors.transporteRegreso &&
                            errors.transporteRegreso[index]?.horaLlegada && (
                              <span className="error-text">
                                {
                                  errors.transporteRegreso[index].horaLlegada
                                    .message
                                }
                              </span>
                            )}
                        </td>
                        <td>
                          <ActionButton
                            onClick={() => removeRegreso(index)}
                            label="Eliminar"
                            variant="danger"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                </table>
                <ActionButton
                onClick={() => {
                  appendRegreso({
                    tipoTransporte: "Aéreo",
                    nombreTransporte: "",
                    ruta: "",
                    fechaSalida: "",
                    horaSalida: "",
                    fechaLlegada: "",
                    horaLlegada: "",
                  });
                }}
                label="Agregar"
                variant="success"
              />
            </div>
              

            <LabelTitle text="DOCUMENTACIÓN Y REQUISITOS REQUERIDOS PARA SERVICIOS INSTITUCIONALES" />
            <LabelText text="Una vez que han retornado del cumplimiento de servicios institucionales, tendrán un plazo de 4 días hábiles para presentar el Informe de Servicios Institucionales al Vicerrectorado de Investigación, Innovación y Vinculación" />
                <Label text="REQUISITOS:" />
                <LabelText text="• Informe de Servicios Institucionales (Con las firmas del profesor que cumplió con la salida al exterior y Jefe o Director de la Unidad Académica) (Anexo 4)." />
                <LabelText text="• Facturas y/o comprobantes de venta físicos y electrónicos válidos de alimentación y/o hospedaje, en el caso de que los organizadores cubran uno o varios rubros de alimentación y/o hospedaje (Artículo 13 del Reglamento de Viáticos al Exterior)." />
                <LabelText text="• Facturas o comprobantes de venta físicos y electrónicos válidos de movilización interna en el país donde se desarrolla la comisión, para su respectivo reembolso de acuerdo con el artículo 21 del Reglamento de Viáticos al Exterior." />
                <LabelText text="• Certificado de participación en el evento o participación en el viaje técnico." />
                <LabelText text="• Tickets aéreos o pases a bordo originales, en el caso de que la EPN haya adquirido los pasajes aéreos estos deben ser originales." />
                <LabelText text="• Resumen y/o fotografías de la participación del evento para difusión." />
                
       
         
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
                    label="Descargar Memorando Servicios Institucionales"
                  />
                </Col>
               
                <Col md={4} className="text-center">
                  <DownloadButton
                    onClick={handleGeneratePdf}
                    icon="IconPdf.png"
                    altText="PDF Icon"
                    label="Descargar Anexo 4"
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

export default InstitutionalServicesForm;
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