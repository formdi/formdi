import React, { useState, useEffect } from "react";
import { useForm, FormProvider, useFieldArray} from "react-hook-form";
import { Container, Button, Row, Col, Form } from "react-bootstrap";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importación de los componentes Props
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
// Modals
import ConfirmationModal from "../components/Modals/ConfirmationModal.js";
import ConfirmClearModal from "../components/Modals/ConfirmClearModal.js";

//Importación de funciones
import today from "../utils/date.js";
import { generateDateRange } from "../utils/dataRange.js";
import {
  validarCedulaEcuatoriana,
  sumarDias,
} from "../utils/validaciones.js";

// Importación de las funciones para generar documentos
import {
  generateAnexo7WithinProject,
  generateMemoSamplingTripWithinProject,
  NationalSamplingTrips,
} from "../utils/generatorDocuments/trip/nationalTripDocuments";
import { replace } from "react-router-dom";

//Constantes globales
const formStorageKey = "formSamplingTripWithinProject"; // Clave para almacenar el formulario en sessionStorage

// Diccionario de etiquetas amigables para este formulario específico
const fieldLabels = {
  participante: 'Participantes',
  'participante[].viaticos': 'Recibe Viáticos',
  'participante[].cedula': 'Cédula',
  'participante[].rol': 'Rol',
  'participante[].cargo': 'Cargo',
  'participante[].nombreJefeInmediato': 'Nombre del Jefe Inmediato',
  'participante[].cargoJefeInmediato': 'Cargo del Jefe Inmediato',
  'participante[].banco': 'Banco',
  'participante[].tipoCuenta': 'Tipo de Cuenta',
  'participante[].numeroCuenta': 'Número de Cuenta',
  'participante[].departamento': 'Departamento',
  'participante[].nombre': 'Nombre del Participante',

  transporteIda: 'Cronograma de Transporte de Ida',
  'transporteIda[].tipoTransporte': 'Tipo de Transporte',
  'transporteIda[].nombreTransporte': 'Nombre del Transporte',
  'transporteIda[].ruta': 'Ruta',
  'transporteIda[].fechaSalida': 'Fecha de Salida ',
  'transporteIda[].horaSalida': 'Hora de Salida ',
  'transporteIda[].fechaLlegada': 'Fecha de Llegada ',
  'transporteIda[].horaLlegada': 'Hora de Llegada ',

  transporteRegreso: 'Cronograma de Transporte de Regreso',
  'transporteRegreso[].tipoTransporte': 'Tipo de Transporte',
  'transporteRegreso[].nombreTransporte': 'Nombre del Transporte',
  'transporteRegreso[].ruta': 'Ruta de Regreso',
  'transporteRegreso[].fechaSalida': 'Fecha de Salida',
  'transporteRegreso[].horaSalida': 'Hora de Salida',
  'transporteRegreso[].fechaLlegada': 'Fecha de Llegada',
  'transporteRegreso[].horaLlegada': 'Hora de Llegada',

  codigoProyecto: 'Código del Proyecto',
  tituloProyecto: 'Título del Proyecto',
  nombreDirector: 'Nombre del Director',
  ciudad: 'Ciudad',
  fechaInicioViaje: 'Fecha de Inicio del Viaje',
  fechaFinViaje: 'Fecha de Fin del Viaje',
  pasajesAereos: 'Pasajes Aéreos',
  viaticosSubsistencias: 'Viáticos y Subsistencias',
  objetivoViaje: 'Objetivo del Viaje',

  actividadesInmutables: 'Cronograma de actividades',
  'actividadesInmutables[].fecha': 'Fecha de Actividad',
  'actividadesInmutables[].descripcion': 'Descripción de la Actividad',
  departamento: 'Departamento'
};

function NationalSamplingTripsForm() {
  // Configuración del formulario con react-hook-form y valores predeterminados desde sessionStorage
  const formData = JSON.parse(sessionStorage.getItem(formStorageKey)) || {};

  const methods = useForm({ mode: "onChange", reValidateMode: "onChange", defaultValues: formData });
  const { register, control, watch, setValue, reset, clearErrors, formState: { errors } } = methods;

  //FieldArrays para tablas
  const { fields: participanteFields, append: appendParticipante, remove: removeParticipante } = useFieldArray({ control, name: "participante" });
  const { fields: fieldsIda, append: appendIda, remove: removeIda } = useFieldArray({ control, name: "transporteIda"});
  const { fields: fieldsRegreso, append: appendRegreso, remove: removeRegreso} = useFieldArray({ control, name: "transporteRegreso"});
  const { fields: immutableFields, replace: replaceInmutableFields } = useFieldArray({ control, name: "actividadesInmutables" });

  //visualizadores con watch
  const fechaInicioViaje = watch("fechaInicioViaje");
  const fechaFinViaje = watch("fechaFinViaje");

  //manejadores de estado
  const [fechaInicioActividades, setFechaInicioActividades] = useState("");
  const [fechaFinActividades, setFechaFinActividades] = useState("");
  const [prevFechaInicio, setPrevFechaInicio] = useState("");
  const [prevFechaFin, setPrevFechaFin] = useState("");
  const [loading, setLoading] = useState(false); //para el spinner de carga
  const [showDownloadSection, setShowDownloadSection] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [modalClearShow, setModalClearShow] = useState(false);
  
  const onSubmitSamplingTrip = (data) => {
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
    saveAs(blob, "Viajes de Muestreo Dentro de Proyectos.json");
    toast.success("Archivo JSON descargado correctamente"); // Notificación de éxito
  };

  const handleUploadJson = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        reset(json, { keepErrors: false, keepDirty: false, keepValues: false, keepTouched: false, keepIsSubmitted: false });
        replaceInmutableFields(json.actividadesInmutables);
        sessionStorage.setItem(formStorageKey, JSON.stringify(json));
        toast.success("Archivo JSON cargado correctamente"); // Notificación de éxito
} catch (err) {
        console.error("Error al cargar el archivo JSON:", err);
        toast.error("Error al cargar el archivo JSON"); // Notificación de error
      }
    };
    reader.readAsText(file);
  };
  
  const handleGenerateDocx = () => {
    const data = methods.getValues();
    generateMemoSamplingTripWithinProject(data);
    setShowDownloadSection(false);
    toast.success("Memorando generado correctamente");
  };

  const handleGeneratePdfAnexosA = async () => {
    const generateAnexosA = async () => {
      try {
        setLoading(true);
        const formData = methods.getValues();
        const pdfsZipBlob = await NationalSamplingTrips(formData, true);
  
        if (pdfsZipBlob) {
          saveAs(pdfsZipBlob, "Anexos_A.zip");
        }
  
        setShowDownloadSection(false);
      } catch (error) {
        console.error("Error:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    };
  
    toast.promise(
      generateAnexosA,
      {
        pending: 'Generando Anexos A para cada participante, por favor, espera',
        success: '¡Anexos A generados correctamente! 🎉',
        error: 'Error al generar los Anexos A. Por favor, inténtalo nuevamente 😞'
      }
    );
  };
  
  const handleGeneratePdf2 = () => {
    const data = methods.getValues();
    generateAnexo7WithinProject(data);
    setShowDownloadSection(false);
    toast.success("Anexo 7 generado correctamente");
  };

  const handleClearForm = () => {
    sessionStorage.removeItem(formStorageKey);  
    // Set all form values to empty strings
    Object.keys(fieldLabels).forEach((field) => {
      setValue(field, "");
    });
    replaceInmutableFields([]);
    removeIda();
    removeRegreso();
    removeParticipante();
    const initialTransporte = { tipoTransporte: "Aéreo", nombreTransporte: "", ruta: "", fechaSalida: "", horaSalida: "", fechaLlegada: "", horaLlegada: "" };
    const initialParticipante = { viaticos: false, nombre: "", cedula: "", rol: "", cargo: "", nombreJefeInmediato: "", cargoJefeInmediato: "", banco: "", tipoCuenta: "", numeroCuenta: "", departamento: "" };
    appendIda(initialTransporte);
    appendRegreso(initialTransporte);
    appendParticipante(initialParticipante);
    setModalClearShow(false);
    toast.success("Formulario limpiado correctamente"); // Notificación de éxito
  };

  const handleDownloadAll = async () => {
    const downloadDocuments = async () => {
      try {
        setLoading(true); // Activar spinner
  
        // Obtener los valores del formulario
        const formData = methods.getValues();
  
        // Generar los blobs de los documentos
        const jsonBlob = handleDownloadJson(true);
        const docxBlob = await generateMemoSamplingTripWithinProject(formData, true);
        const pdfBlob1 = await generateAnexo7WithinProject(formData, true);
        const pdfsZipBlob = await NationalSamplingTrips(formData, true); // Esta función retorna un blob en formato ZIP
  
        // Crear un nuevo archivo ZIP y agregar los documentos
        const zip = new JSZip();
        zip.file("Viajes de Muestreo Dentro de Proyectos.json", jsonBlob);
        zip.file("Memorando de Viaje.docx", docxBlob);
        zip.file("Anexo 7 - Formulario de Salidas de Campo y de Muestreo.pdf", pdfBlob1);
        zip.file("Anexos A.zip", pdfsZipBlob);
  
        // Generar el archivo ZIP final y descargarlo
        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, "Documentos_Viajes_de_Muestreo.zip");
  
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

  // useEffect principal
  useEffect(() => {
    const formulario = JSON.parse(sessionStorage.getItem(formStorageKey)) || {}; // Datos del formulario desde sessionStorage
    reset(formulario);

    const subscription = watch((data) => {
      sessionStorage.setItem(formStorageKey, JSON.stringify(data));
      const fechaInicio = data.transporteIda?.[0]?.fechaSalida || "";
      const fechaFin = data.transporteRegreso?.length? data.transporteRegreso[data.transporteRegreso.length - 1]?.fechaLlegada: "";

      if (fechaInicio !== prevFechaInicio && fechaInicio !== "" && fechaInicio !== fechaInicioActividades ) {
        setFechaInicioActividades(fechaInicio);
        setPrevFechaInicio(fechaInicio);
      }
      if (fechaFin !== prevFechaFin && fechaFin !== "" && fechaFin !== fechaFinActividades) {
        setFechaFinActividades(fechaFin);
        setPrevFechaFin(fechaFin);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, reset, prevFechaInicio, prevFechaFin, fechaFinActividades, fechaInicioActividades]);
  

  // Segundo useEffect
useEffect(() => { 
  if (fechaInicioActividades && fechaFinActividades && fechaInicioActividades !== "" && fechaFinActividades !== "") {
    console.log("Esto se ejecuta solo si hay un cambio en las fechas de inicio o fin de actividades");
    const currentFields = methods.getValues("actividadesInmutables") || [];
    const dates = generateDateRange(fechaInicioActividades, fechaFinActividades);
    const newFields = dates.map((date) => {
      const existingField = currentFields.find((field) => field.fecha === date);
      return {
        fecha: date,
        descripcion: existingField ? existingField.descripcion : "",
      };
    });
    replaceInmutableFields(newFields);
  }
}, [fechaInicioActividades, fechaFinActividades, methods, replaceInmutableFields]);

// Tercer useEffect
useEffect(() => {
  console.log("Esto se ejecuta solo una vez al cargar el componente");
  const initialTransporte = { tipoTransporte: "Aéreo", nombreTransporte: "", ruta: "", fechaSalida: "", horaSalida: "", fechaLlegada: "", horaLlegada: "" };
  const initialParticipante = { viaticos: false, nombre: "", cedula: "", rol: "", cargo: "", nombreJefeInmediato: "", cargoJefeInmediato: "", banco: "", tipoCuenta: "", numeroCuenta: "", departamento: "" };

  if (participanteFields.length === 0) appendParticipante(initialParticipante);
  if (fieldsIda.length === 0) appendIda(initialTransporte);
  if (fieldsRegreso.length === 0) appendRegreso(initialTransporte);
}, []); // Sin dependencias para que se ejecute solo una vez

  return (
    <FormProvider {...methods}>
      <Container>
        <h1 className="text-center my-4">
          Formulario para salidas de campo y de muestreo y/o viajes técnicos
          dentro de proyectos
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
        <Form onSubmit={methods.handleSubmit(onSubmitSamplingTrip)}>
          <div className="form-container">
            <LabelTitle
              text="DATOS GENERALES PARA LA SALIDA DE CAMPO, DE MUESTREO Y/O VIAJE TÉCNICO"
              disabled={false}
            />

            <InputText
              name="codigoProyecto"
              label="Código del proyecto:"
              placeholder={"Ejemplo: PIGR-24-01"}
              rules={{
                required: "El código del proyecto es requerido",
                pattern: {
                  value: /^[A-Za-z]+(-[A-Za-z0-9]+)+$/,
                  message:
                    "El código del proyecto debe estar conformado por una combinación de letras y números separados por guiones",
                },
              }}
              disabled={false}
            />

            <InputText
              name="tituloProyecto"
              label="Título del proyecto:"
              rules={{ required: "El título del proyecto es requerido" }}
              disabled={false}
            />

            <InputText
              name="nombreDirector"
              label="Nombre del Director del proyecto:"
              rules={{ required: "El nombre del Director es requerido" }}
              disabled={false}
            />

            {/* Departamento / Instituto */}
            <InputSelect
              name="departamento"
              label="Departamento / Instituto:"
              infoText="Seleccione el departamento o instituto al cual pertenece el proyecto, este campo usualmente es el departamento  al cual pertence el director del proyecto"
              options={departamentoOptions}
              rules={{ required: "El departamento es requerido" }}
              disabled={false}
            />
             <LabelTitle text="DATOS DE LA SALIDA DE CAMPO Y DE MUESTREO" />
            <InputText
              name="ciudad"
              label="Lugar de movilización"
              rules={{ required: "La ciudad a movilizarce es requerida" }}
              disabled={false}
            />

            <InputDate
              name="fechaInicioViaje"
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
              name="fechaFinViaje"
              label="Hasta:"
              rules={{
                required: "La fecha de fin del evento es requerida",
                validateDate: (value) => {
                  return (
                    value >= today() ||
                    "La fecha debe ser mayor a la fecha actual " + today()
                  );
                },
                validate: (value) => {
                  return (
                    value >= watch("fechaInicioViaje") ||
                    "La fecha FIN de viaje  debe ser major a la fecha de incio del viaje " +
                      fechaInicioViaje
                  );
                },
              }}
              disabled={false}
            />

            <Label text="Solicita para viaje tecnico" />
            <RadioGroup
              name="pasajesAereos"
              label="Pasajes aéreos:"
              options={[
                { value: "SI", label: "SI" },
                { value: "NO", label: "NO" },
              ]}
              rules={{ required: "Indique si requiere pasajes aéreos" }}
              disabled={false}
            />

            <RadioGroup
              name="viaticosSubsistencias"
              label="Viáticos y subsistencias:"
              options={[
                { value: "SI", label: "SI" },
                { value: "NO", label: "NO" },
              ]}
              rules={{
                required: "Indique si requiere viáticos y subsistencias",
              }}
              disabled={false}
            />
            <LabelTitle text="Personal a trasladarse" />
            <div className="scroll-table-container">
              <table className="employe-table" >
                <thead>
                  <tr>
                    <th className="solicita-viaticos">Solicita Viáticos</th>
                    <th className="rol-proyecto">Rol en el Proyecto</th>
                    <th className="personal-nombre">Personal nombre</th>
                    <th className="cedula" >Cédula</th>
                    <th className="cargo">Cargo</th>
                    <th className="nombre-jefe">Nombre Jefe Inmediato</th>
                    <th className="cargo-jefe" >Cargo del Jefe Inmediato</th>
                    <th className="nombre-banco" >Nombre del Banco</th>
                    <th className="tipo-cuenta" >Tipo de Cuenta</th>
                    <th className="numero-cuenta">Número de Cuenta</th>
                    <th className="departamento">Departamento</th>
                    <th className="acciones">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {participanteFields.map((field, index) => {
                    // Usamos watch para observar el valor de 'viaticos' de cada participante
                    const viaticosChecked = watch(
                      `participante[${index}].viaticos`
                    );

                    return (
                      <tr
                      key={field.id}
                      >
                        {/* Checkbox de Viáticos */}
                        <td>
                          <input
                            type="checkbox"
                            title="Marca esta opcion si el personal solicita viaticos"
                            id={`participante[${index}].viaticos`}
                            {...register(`participante[${index}].viaticos`)}
                          />
                        </td>
                      {/* Campo de Rol */}
                      <td>
                        <select
                          title="Rol que desempeña el personal en el proyecto"
                          id={`participante[${index}].rol`}
                          className="form-select"
                          {...register(`participante[${index}].rol`, {
                            required: "Este campo es requerido",
                          })}
                        >
                          <option value="Director">Director</option>
                          <option value="Codirector">Codirector</option>
                          <option value="Colaborador">Colaborador</option>
                        </select>
                        {errors.participante &&
                          errors.participante[index]?.rol && (
                            <span className="error-text">
                              {errors.participante[index].rol.message}
                            </span>
                          )}
                      </td>

                        {/* Campo de Personal a trasladarse */}
                        <td>
                          <input
                            title="Nombre completo del personal que se traslada"
                            type="text"
                            id={`participante[${index}].nombre`}
                            className="form-input"
                            placeholder="Nombre del participante"
                            {...register(`participante[${index}].nombre`, {
                              required: "El nombre es requerido",
                            })}
                          />
                          {errors.participante &&
                            errors.participante[index]?.nombre && (
                              <span className="error-text">
                                {errors.participante[index].nombre.message}
                              </span>
                            )}
                        </td>
                        {/* Campo de Cédula */}
                        <td>
                          <input
                            title="Número de cédula del personal"
                            type="text"
                            id={`participante[${index}].cedula`}
                            className="form-input"
                            {...register(`participante[${index}].cedula`, {
                              required: "La cédula es requerida",
                              validate: (value) => validarCedulaEcuatoriana(value) || "Cédula inválida",
                            })}
                          />
                          {errors.participante && errors.participante[index]?.cedula && (
                            <span className="error-text">
                              {errors.participante[index].cedula.message}
                            </span>
                          )}
                        </td>


                        {/* Campo de Cargo */}
                        <td>
                          <input
                            title="Tal como consta en su acción de personal. Ejemplos: Profesor Agregado a Tiempo Completo; Profesor Auxiliar a Tiempo Completo; Profesor Principal a Tiempo Completo."
                            type="text"
                            id={`participante[${index}].cargo`}
                            className="form-input"
                            placeholder="Profesor agregado a tiempo completo"
                            {...register(`participante[${index}].cargo`, {
                              required: "El cargo es requerido",
                            })}
                          />
                          {errors.participante &&
                            errors.participante[index]?.cargo && (
                              <span className="error-text">
                                {errors.participante[index].cargo.message}
                              </span>
                            )}
                        </td>
                          
                        {/* Campo de Nombre del Jefe Inmediato */}
                        <td>
                          <input
                            title="Nombres completos del jefe inmediato"
                            type="text"
                            id={`participante[${index}].nombreJefeInmediato`}
                            className="form-input"
                            placeholder="Nombre del jefe inmediato"
                            {...register(`participante[${index}].nombreJefeInmediato`, {
                              required: "El nombre del jefe inmediato es requerido",
                            })}
                          />
                          {errors.participante && errors.participante[index]?.nombreJefeInmediato && (
                            <span className="error-text">
                              {errors.participante[index].nombreJefeInmediato.message}
                            </span>
                          )}
                        </td>

                        {/* Campo de Cargo del Jefe Inmediato */}
                        <td>
                          <input
                            title="Favor colocar el cargo del Jefe inmediato, puede usar las siglas para referirse al departamento. Ejemplo: Jefe del DACI / Jefe del DACI, subrogante"
                            type="text"
                            id={`participante[${index}].cargoJefeInmediato`}
                            className="form-input"
                            placeholder="Jefe del DACI"
                            {...register(`participante[${index}].cargoJefeInmediato`, {
                              required: "El cargo del jefe inmediato es requerido",
                            })}
                          />
                          {errors.participante && errors.participante[index]?.cargoJefeInmediato && (
                            <span className="error-text">
                              {errors.participante[index].cargoJefeInmediato.message}
                            </span>
                          )}
                        </td>

                        {/* Campo de Nombre del Banco */}
                        <td>
                          <input
                            type="text"
                            id={`participante[${index}].banco`}
                            className="form-input"
                            {...register(`participante[${index}].banco`)}
                            disabled={!viaticosChecked} // Deshabilitar si no se selecciona Viáticos
                          />
                        </td>

                        {/* Dropdown de Tipo de Cuenta */}
                        <td>
                          <select
                            id={`participante[${index}].tipoCuenta`}
                            className="form-select"
                            {...register(`participante[${index}].tipoCuenta`)}
                            disabled={!viaticosChecked} // Deshabilitar si no se selecciona Viáticos
                          >
                            <option value="ahorros">Ahorros</option>
                            <option value="corriente">Corriente</option>
                          </select>
                        </td>

                        {/* Campo de Número de Cuenta */}
                        <td>
                          <input
                            type="text"
                            id={`participante[${index}].numeroCuenta`}
                            className="form-input"
                            {...register(`participante[${index}].numeroCuenta`)}
                            disabled={!viaticosChecked} // Deshabilitar si no se selecciona Viáticos
                          />
                        </td>
                        <td>
                          <select
                            id={`participante[${index}].departamento`}
                            className="form-select"
                            {...register(
                              `participante[${index}].departamento`,
                              {
                                required: "El departamento es requerido",
                              }
                            )}
                          >
                            {departamentoOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          {errors.participante &&
                            errors.participante[index]?.departamento && (
                              <span className="error-text">
                                {
                                  errors.participante[index].departamento
                                    .message
                                }
                              </span>
                            )}
                        </td>

                        {/* Botón para eliminar participante */}
                        <td>
                          <ActionButton
                            onClick={() => removeParticipante(index)}
                            label="Eliminar"
                            variant="danger"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Botón para agregar participante */}
              <ActionButton
                onClick={() => {
                  appendParticipante({
                    viaticos: false,               // Solicita Viáticos
                    nombre: "",                    // Personal nombre
                    cedula: "",                    // Cédula
                    rol: "",                       // Rol en el Proyecto
                    cargo: "",                     // Cargo
                    nombreJefeInmediato: "",       // Nombre Jefe Inmediato
                    cargoJefeInmediato: "",        // Cargo del Jefe Inmediato
                    banco: "",                     // Nombre del Banco
                    tipoCuenta: "",                // Tipo de Cuenta
                    numeroCuenta: "",              // Número de Cuenta
                    departamento: "",               // Departamento
                  });
                }}
                label="Agregar"
                variant="success"
              />
            </div>
           
            <LabelTitle text="Transporte" disabled={false} />
            <LabelText
              text="Por favor, considere que el itinerario es tentativo. Consulte el
                itinerario del medio de transporte elegido en su página oficial
                o sitios web de confianza. Seleccione la opción que ofrezca el
                menor tiempo de viaje y el menor número de escalas de ser el
                caso."
            />
            <Label text="TRANSPORTE DE IDA" />
            <LabelText text="Para el ingreso de itinerario de viaje, considere que se puede llegar al destino máximo un día antes del inicio del evento, salida de campo." />

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
                                  noPastDate: (value) => {
                                    return value >= today() || "La fecha no puede ser menor a la fecha actual"+ today();
                                  },
                                  validSequence: (value) => {
                                    const dateValue = new Date(value);
                                    const fechaLlegadaAnteriorValue = new Date(fechaLlegadaAnterior);
                                    return !fechaLlegadaAnterior || dateValue >= fechaLlegadaAnteriorValue ||
                                      "La fecha de salida debe ser posterior a la fecha de llegada anterior" + (fechaLlegadaAnterior ? fechaLlegadaAnterior : "");
                                  },
                              
                                  validateDate: (value) => {
                                    const dateValue = new Date(value);
                                    const fechaInicioViajeValue = new Date(fechaInicioViaje);
                                    if (index === 0) {
                                      return (
                                        (dateValue >= sumarDias(fechaInicioViaje, -1) && dateValue <= fechaInicioViajeValue) ||
                                        "La fecha de salida debe ser el mismo día o como máximo un día antes de la fecha inicio del viaje " + (fechaInicioViaje ? fechaInicioViaje : "")
                                      );
                                    } else {
                                      return true;
                                    }
                                  }
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
                                    value >= today() ||
                                    "La fecha no puede ser menor a la fecha actual",
                                  afterSalida: (value) =>
                                    value >= fechaSalida ||
                                    "La fecha de llegada debe ser posterior o igual a la fecha de salida " + fechaSalida,
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
                            onClick={() => {
                              if(fieldsIda.length > 1){
                                removeIda(index)
                              }
                              }}
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
                                  noPastDate: (value) =>{
                                  return(value >= today() || "La fecha no puede ser menor a la fecha actual");
                                  },

                                  validSequence: (value) =>{
                                    const dateValue = new Date(value);
                                    const fechaLlegadaAnteriorValue = new Date(fechaLlegadaAnterior);
                                    return(!fechaLlegadaAnterior || dateValue >= fechaLlegadaAnteriorValue ||
                                      "La fecha de salida debe ser posterior a la fecha de llegada anterior" + (fechaLlegadaAnterior? fechaLlegadaAnterior: "") );
                                  },

                                  validateDate: (value) => {
                                    const dateValue = new Date(value);
                                    const fechaFinViajeValue = new Date(fechaFinViaje);
                                    if (index === 0) {
                                      return (
                                        (dateValue >= fechaFinViajeValue && dateValue<= sumarDias(fechaFinViajeValue,1))||
                                        "La fecha de retorno debe ser el mismo día o como maximo un dia despues de la fecha de fin de viaje " + (fechaFinViaje? fechaFinViaje: "")
                                      );
                                    } else {
                                      return true;
                                    }
                                  }
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
                                    value >= today() ||
                                    "La fecha no puede ser menor a la fecha actual",
                                  afterSalida: (value) =>
                                    value >= fechaSalida ||
                                    "La fecha de llegada debe ser posterior o igual a la fecha de salida" + fechaSalida,
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
                            onClick={() => {
                              if(fieldsRegreso.length > 1){

                                removeRegreso(index)
                              }
                              }}
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

            <LabelTitle text="CRONOGRAMA DE ACTIVIDADES" />

            <LabelText
              text="Incluir desde la fecha de salida del país y días de traslado
              hasta el día de llegada al destino. <br />
              Hasta incluir la fecha de llegada al país."
            />

            <table className="activity-schedule-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción de la Actividad a Realizar</th>
                </tr>
              </thead>
              <tbody>
                {immutableFields.map((field, index) => (
                  <tr
                    key={field.id}
                    className={index % 2 === 0 ? "row-even" : "row-odd"}
                  >
                    {/* Campo de Fecha */}
                    <td>
                      <input
                        type="date"
                        id={`actividadesInmutables[${index}].fecha`}
                        className="form-input"
                        {...register(`actividadesInmutables[${index}].fecha`, {
                          required: "La fecha es requerida",
                        })}
                        value={field.fecha} // Valor predefinido de la fecha
                        readOnly
                      />
                      {errors.actividadesInmutables &&
                        errors.actividadesInmutables[index]?.fecha && (
                          <span className="error-text">
                            {errors.actividadesInmutables[index].fecha.message}
                          </span>
                        )}
                    </td>

                    <td style={{ width: "100%" }}>
                      <input
                        type="text"
                        id={`actividadesInmutables[${index}].descripcion`}
                        className="form-input"
                        placeholder="Descripción de la actividad"
                        {...register(
                          `actividadesInmutables[${index}].descripcion`,
                          {
                            required: "La descripción es requerida",
                          }
                        )}
                      />
                      {errors.actividadesInmutables &&
                        errors.actividadesInmutables[index]?.descripcion && (
                          <span className="error-text">
                            {
                              errors.actividadesInmutables[index].descripcion
                                .message
                            }
                          </span>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <LabelTitle text="Justificación del la salida de campo y de muestreo" />
            <InputTextArea
              name="objetivoViaje"
              label="Objetivo, resultado o producto de la salida de campo y de muestreo."
              infoText="Detalle de productos a ser alcanzados en la salida de campo y de muestreo."
              rules={{ required: "Este campo es requerido" }}
              disabled={false}
            />
          </div>
          {/* Botón para enviar el formulario */}
          <Row className="mt-4">
            <Col className="text-center">
              <Button
                id="btn_enviar"
                type="submit"
                variant="primary"
              >
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


          {showDownloadSection && (
            <div className="mt-4">
              <Row className="justify-content-center">
                <Col md={4} className="text-center">
                  <DownloadButton
                    onClick={handleGenerateDocx}
                    icon="IconWord.png"
                    altText="Word Icon"
                    label="Descargar Memorando"
                  />
                </Col>
                <Col md={4} className="text-center">
                  <DownloadButton
                    onClick={handleGeneratePdfAnexosA}
                    icon="IconPdf.png"
                    altText="PDF Icon"
                    label="Descargar Anexos A"
                  />
                </Col>
                <Col md={4} className="text-center">
                  <DownloadButton
                    onClick={handleGeneratePdf2}
                    icon="IconPdf.png"
                    altText="PDF Icon"
                    label="Descargar Anexo 7"
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
                  loading={loading} // Usar el prop loading
                  />
                </Col>
              </Row>
            </div>
          )}

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
const rolesOptions = [
  { value: "Director", label: "Director" },
  { value: "Codirector", label: "Codirector" },
  { value: "Colaborador", label: "Colaborador" },
];
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
export default NationalSamplingTripsForm;
