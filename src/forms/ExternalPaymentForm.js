import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Container, Button, Row, Col, Form } from "react-bootstrap";
import JSZip from "jszip";
import { saveAs } from "file-saver";
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
import InputEmail from "../components/Inputs/InputEmail.js";
// Modals
import ConfirmationModal from "../components/Modals/ConfirmationModal.js";
import ConfirmClearModal from "../components/Modals/ConfirmClearModal.js";

//Generados de Documentos
import {generateAnexo6} from "../utils/generatorDocuments/services/serviceDocuments"
const formStorageKey = "formExternalPayment"; // Clave para almacenar el formulario en sessionStorage

// Diccionario de etiquetas amigables para este formulario específico
const fieldLabels = {
  nombreBeneficiario: 'Nombre del Beneficiario',
  direccionBeneficiario: 'Dirección del Beneficiario',
  ciudadBeneficiario: 'Ciudad del Beneficiario',
  ciudadBanco: 'Ciudad del Banco',
  ciudadBancoIntermediario: 'Ciudad del Banco Intermediario',
  correoElectronico: 'Correo Electrónico',
  nombresSolcitante: 'Nombres del Solicitante',
  apellidoSolicitante: 'Apellido del Solicitante',
  moneda: 'Moneda',
  paisBeneficiario: 'País del Beneficiario',
  nombreBanco: 'Nombre del Banco',
  codigoSwift: 'Código SWIFT',
  numeroCuenta: 'Número de Cuenta',
  paisBanco: 'País del Banco',
  nombreBancoIntermediario: 'Nombre del Banco Intermediario',
  codigoSwiftIntermediario: 'Código SWIFT del Banco Intermediario',
  paisBancoIntermediario: 'País del Banco Intermediario',
};


function ExternalPaymentForm() {
  const formData = JSON.parse(sessionStorage.getItem(formStorageKey)) || {}; // Datos del formulario desde sessionStorage
  // Configuración del formulario con react-hook-form y valores predeterminados desde sessionStorage
  const methods = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: formData,
  });

  const {
    control,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = methods;

  //Observadores
  const [showDownloadSection, setShowDownloadSection] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [modalClearShow, setModalClearShow] = useState(false);

  const onSubmit = (data) => {
    toast.success("Datos del Formulario validados correctamente");
    setModalShow(true); 
  };

  const handleConfirm = () => {
    toast.success("Confirmación del usuaio que los datos son correctos"); // Notificación de éxito
    setShowDownloadSection(true);
    setModalShow(false);
  };


  const handleClearForm = () => {
    Object.keys(fieldLabels).forEach((field) => {
      setValue(field, "");
    });
    setModalClearShow(false);
    toast.success("Formulario limpiado correctamente"); // Notificación de éxito
   
  };

  const handleGenerateAnexo6 = async () => {
    try {
      const data = methods.getValues();
      const anexo6Blob = await generateAnexo6(data, true);
      const blobJson = handleDownloadJson(true);
      const zip = new JSZip();
      zip.file("Anexo6.pdf", anexo6Blob);
      zip.file("Pagos al exterior.json", blobJson);
      zip.generateAsync({ type: "blob" }).then((content) => {
        saveAs(content, "Pagos_al_exterior.zip");
        toast.success("Documentos generados y descargados exitosamente"); // Notificación de éxito
      });
      setShowDownloadSection(false);
    } catch (error) {
      toast.error("Error al generar los documentos"); // Notificación de error en caso de fallo
    }
  };
  
  const handleUploadJson = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        reset(json, {
          keepErrors: false,
          keepDirty: false,
          keepValues: false,
          keepTouched: false,
          keepIsSubmitted: false,
        });
        sessionStorage.setItem(formStorageKey, JSON.stringify(json));
        toast.success("Archivo JSON cargado correctamente"); // Notificación de éxito
} catch (err) {
        console.error("Error al cargar el archivo JSON:", err);
        toast.error("Error al cargar el archivo JSON"); // Notificación de error
      }
    };
    reader.readAsText(file);
  };
  
  
  const handleDownloadJson = (returnDocument = false) => {
    try {
      const data = methods.getValues();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      if (returnDocument === true) return blob;
      saveAs(blob, "Pagos al exterior.json");
      toast.success("Archivo JSON descargado correctamente"); // Notificación de éxito
    } catch (error) {
      toast.error("Error al descargar el archivo JSON"); // Notificación de error
    }
  };

  useEffect(() => {
    const formData = JSON.parse(sessionStorage.getItem(formStorageKey)) || {};
    reset(formData);
    const subscription = watch((data) => {
      sessionStorage.setItem(formStorageKey, JSON.stringify(data));
    });
    return () => subscription.unsubscribe();
  }, [reset, watch]);

  return (
    <FormProvider {...methods}>
      <Container>
        {/* Título del formulario */}
        <h1 className="text-center my-4">Formulario para pagos al exterior</h1>
        <div className="form-container">
          <Label text="Cargar datos desde archivo (.json)" />
          <input
            type="file"
            accept=".json"
            onChange={handleUploadJson} // Conectar con la función
            className="input-file"
          />
        </div>
        <Form onSubmit={methods.handleSubmit(onSubmit)}>
          {/* Aquí puedes agregar los campos del formulario */}
          <div className="form-container">
            <LabelTitle text="Información del Solicitante" />
            <InputText name="nombresSolcitante" label="NOMBRES / NAMES" placeholder= "Ingresa tu(s) nombre(s) / Enter your first name(s)" rules={{ required: "El nombre es requerido" }} disabled={false} />
            <InputText name="apellidoSolicitante" label="APELLIDO / LAST NAME" placeholder= "Ingresa tu(s) apellido(s) / Enter your last name(s)" rules={{ required: "El apellido es requerido" }} disabled={false} />
            <InputEmail name="correoElectronico" label="CORREO ELECTRÓNICO / EMAIL" rules={{ required: "El correo electrónico es requerido" }} disabled={false} />
            
            <LabelTitle text="Información del beneficiario" />
            {/* Moneda */}
            <InputSelect
              name="moneda"
              label="MONEDA / CURRENCY"
              options={[
                { label: "(฿) Baht tailandés", value: "THB - Baht tailandés" },
                { label: "(Kč) Corona checa", value: "CZK - Corona checa" },
                { label: "(kr) Corona danesa", value: "DKK - Corona danesa" },
                { label: "(kr) Corona noruega", value: "NOK - Corona noruega" },
                { label: "(kr) Corona sueca", value: "SEK - Corona sueca" },
                { label: "(A$) Dólar australiano", value: "AUD - Dólar australiano" },
                { label: "(C$) Dólar canadiense", value: "CAD - Dólar canadiense" },
                { label: "(HK$) Dólar de Hong Kong", value: "HKD - Dólar de Hong Kong" },
                { label: "(NZ$) Dólar de Nueva Zelanda", value: "NZD - Dólar de Nueva Zelanda" },
                { label: "(S$) Dólar de Singapur", value: "SGD - Dólar de Singapur" },
                { label: "($) Dólar estadounidense", value: "USD - Dólar estadounidense" },
                { label: "(€) Euro", value: "EUR - Euro" },
                { label: "(Ft) Florín húngaro", value: "HUF - Florín húngaro" },
                { label: "(CHF) Franco suizo", value: "CHF - Franco suizo" },
                { label: "(£) Libra esterlina", value: "GBP - Libra esterlina" },
                { label: "(₺) Lira turca", value: "TRY - Lira turca" },
                { label: "(NT$) Nuevo dólar taiwanés", value: "TWD - Nuevo dólar taiwanés" },
                { label: "(₪) Nuevo shekel israelí", value: "ILS - Nuevo shekel israelí" },
                { label: "(CLP$) Peso chileno", value: "CLP - Peso chileno" },
                { label: "(₱) Peso filipino", value: "PHP - Peso filipino" },
                { label: "(MX$) Peso mexicano", value: "MXN - Peso mexicano" },  // Ajustado
                { label: "(R) Rand sudafricano", value: "ZAR - Rand sudafricano" },
                { label: "(R$) Real brasileño", value: "BRL - Real brasileño" },
                { label: "(¥) Renminbi/yuan chino", value: "CNY - Renminbi/yuan chino" },
                { label: "(₽) Rublo ruso", value: "RUB - Rublo ruso" },
                { label: "(₹) Rupia india", value: "INR - Rupia india" },
                { label: "(Rp) Rupia indonesia", value: "IDR - Rupia indonesia" },
                { label: "(₩) Won surcoreano", value: "KRW - Won surcoreano" },
                { label: "(¥) Yen japonés", value: "JPY - Yen japonés" },
                { label: "(zł) Złoty polaco", value: "PLN - Złoty polaco" }
              ]}              
              rules={{ required: "La moneda es requerida" }}
              disabled={false}
            />

            {/* Nombre de Beneficiario */}
            <InputText
              name="nombreBeneficiario"
              label="NOMBRE DE BENEFICIARIO / BENEFICIARY'S NAME"
              rules={{ required: "El nombre del beneficiario es requerido" }}
              disabled={false}
            />

            {/* Dirección */}
            <InputTextArea
              name="direccionBeneficiario"
              label="DIRECCIÓN / ADDRESS"
              rules={{ required: "La dirección del beneficiario es requerida" }}
              disabled={false}
            />

            {/* País */}
            <InputText
              name="paisBeneficiario"
              label="PAÍS / COUNTRY"
              rules={{ required: "El país es requerido" }}
              disabled={false}
            />

            {/* Ciudad */}
            <InputText
              name="ciudadBeneficiario"
              label="CIUDAD / CITY"
              rules={{ required: "La ciudad es requerida" }}
              disabled={false}
            />

            <LabelTitle text="Información del banco" />
            {/* Nombre del Banco */}
            <InputText
              name="nombreBanco"
              label="NOMBRE DEL BANCO / BANK NAME"
              rules={{ required: "El nombre del banco es requerido" }}
              disabled={false}
            />

            {/* Código ABA o SWIFT */}
            <InputText
              name="codigoSwift"
              label="CÓDIGO ABA O SWIFT / CODE ABA OR SWIFT"
              rules={{ required: "El código ABA o SWIFT es requerido" }}
              disabled={false}
            />

            {/* Número de cuenta / IBAN */}
            <InputText
              name="numeroCuenta"
              label="NÚMERO DE CUENTA / IBAN; ACCOUNT NUMBER / IBAN"
              rules={{ required: "El número de cuenta o IBAN es requerido" }}
              disabled={false}
            />

            {/* País */}
            <InputText
              name="paisBanco"
              label="PAÍS / COUNTRY"
              rules={{ required: "El país del banco es requerido" }}
              disabled={false}
            />

            {/* Ciudad */}
            <InputText
              name="ciudadBanco"
              label="CIUDAD / CITY"
              rules={{ required: "La ciudad del banco es requerida" }}
              disabled={false}
            />
            <LabelTitle text="Información en el caso que sea necesario un banco intermediario" />
            {/* Información sobre el banco intermediario */}
            <LabelText text="Si el pago se realiza en <span class='bolded'>US Dollars </span>y el Banco del Beneficiario <span class='bolded'>NO</span> se encuentra en <span class='bolded'>Estados Unidos</span>, el Banco Intermediario debe tener como país Estados Unidos. Si el pago se realiza en <span class='bolded'>EUROS</span> a bancos beneficiarios que se encuentren localizados <span class='bolded'>fuera de la Unión Europea</span>, se debe informar un banco intermediario que esté localizado en un país que <span class='bolded'>pertenezca a la Unión Europea</span>." />
            <LabelText text="If the payment is made in <span class='bolded'>US Dollars</span> and the Beneficiary's Bank is <span class='bolded'>NOT</span> located in the <span class='bolded'>United States</span>, the Intermediary Bank must have the United States as its country. If the payment is made in <span class='bolded'>EUROS</span> to beneficiary banks located <span class='bolded'>outside the European Union</span>, an intermediary bank located in a country belonging to the European Union must be informed."
            />
            <LabelText text=""/>
            {/* Nombre del Banco Intermediario */}
            <InputText
              name="nombreBancoIntermediario"
              label="NOMBRE DE BANCO INTERMEDIARIO / INTERMEDIARY BANK NAME"
              disabled={false}
            />

            {/* Código ABA o SWIFT del Banco Intermediario */}
            <InputText
              name="codigoSwiftIntermediario"
              label="CÓDIGO ABA O SWIFT / CODE ABA OR SWIFT"
              disabled={false}
            />

            {/* País del Banco Intermediario */}
            <InputText
              name="paisBancoIntermediario"
              label="PAÍS / COUNTRY"
              disabled={false}
            />

            {/* Ciudad del Banco Intermediario */}
            <InputText
              name="ciudadBancoIntermediario"
              label="CIUDAD / CITY"
              disabled={false}
            />

          </div>
          {/* Botón para enviar el formulario */}
          <Row className="mt-4">
            <Col className="text-center">
              <Button id="btn_enviar" type="submit" variant="primary">
                Enviar
              </Button>
            </Col>
          </Row>
         

          {/* Sección de descarga de documentos, visible tras enviar el formulario */}
          {showDownloadSection && (
            <div className="mt-4">
              <Row className="justify-content-center">
                <Col md={4} className="text-center">
                  <DownloadButton
                    onClick={handleGenerateAnexo6}
                    label="Descargar Anexo 10"
                    icon="IconPdf.png"
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
export default ExternalPaymentForm;
