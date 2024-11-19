import {
  Font,
  Page,
  Text,
  View,
  Document as PDFDocument,
  pdf,
} from "@react-pdf/renderer";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { text, image, barcodes } from "@pdfme/schemas";
import { generate } from "@pdfme/generator";
import { saveAs } from "file-saver";
import styles from "../../stylesPdf";
import { capitalizeWords, formatDate } from "../../validaciones";
//basepdf and schemas AnexoA
import { basePdfAnexoANational } from "../../basePdfAnexoANational";
import { schemasAnexoANational } from "../../schemasAnexoANational";
Font.register({
  family: "Roboto",
  src: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu72xKOzY.woff2",
  fontWeight: 900,
});

const today = new Date();
const formattedDate = formatDate(today);

//Documentos de eventos Nacionales dentro de Proyectos
export function generateMemoWithinProject(data, returnDocument = false) {
  const nombresApellidos = capitalizeWords(
    (data.nombres + " " + data.apellidos).toLowerCase()
  );
  let solicitudOracion = "Para lo cual solicito ";

  // Array para almacenar las solicitudes
  let solicitudes = [];
  if (data.pasajesAereos === "SI") {
    solicitudes.push("la compra de pasajes aéreos");
  }
  if (data.viaticosSubsistencias === "SI") {
    solicitudes.push("la asignación de viáticos y subsistencias");
  }
  if (data.inscripcion === "SI") {
    solicitudes.push("el pago de inscripción");
  }

  // Construir la oración final
  if (solicitudes.length > 0) {
    solicitudOracion += solicitudes.join(", ") + ".";
  } else {
    solicitudOracion = "";
  }

  // Determinar el texto según el rol en el proyecto
  let cuerpoMemorando;
  if (data.rolEnProyecto === "Director") {
    cuerpoMemorando = `En mi calidad de Director del Proyecto ${data.codigoProyecto}, autorizo el gasto y solicito a usted se realicen las gestiones correspondientes para participar en el evento titulado "${data.tituloEvento}" a realizarse en ${data.ciudadEvento}, ${data.paisEvento}, desde ${data.fechaInicioEvento} hasta ${data.fechaFinEvento}. ${solicitudOracion}`;
  } else {
    cuerpoMemorando = `En mi calidad de Director del Proyecto ${data.codigoProyecto}, autorizo el gasto y solicito a usted se realicen las gestiones correspondientes para que el Sr./Sra. "${nombresApellidos}", ${data.rolEnProyecto} del proyecto, pueda participar en el evento titulado "${data.tituloEvento}" a realizarse en ${data.ciudadEvento}, ${data.paisEvento}, desde ${data.fechaInicioEvento} hasta ${data.fechaFinEvento}. ${solicitudOracion}`;
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "Formato de memorando PARTICIPACION EN EVENTO NACIONAL DENTRO DE PROYECTO",
                bold: true,
                size: 24,
                font: "Aptos (Cuerpo)",
              }),
            ],
            spacing: { after: 300 },
            alignment: "start",
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "PARA:\t\t",
                bold: true,
                size: 22,
                font: "Aptos (Cuerpo)",
              }),
              new TextRun({
                text: "Dr. Marco Santorum",
                size: 22,
                font: "Aptos (Cuerpo)",
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "\t\tVicerrector de Investigación, Innovación y Vinculación",
                size: 22,
                bold: true,
                font: "Aptos (Cuerpo)",
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "ASUNTO:\t",
                bold: true,
                size: 22,
                font: "Aptos (Cuerpo)",
              }),
              new TextRun({
                text: `Solicitud para participar en evento académico/${data.codigoProyecto}`,
                size: 22,
                font: "Aptos (Cuerpo)",
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: cuerpoMemorando,
                size: 20,
                font: "Times New Roman",
              }),
            ],
            spacing: { after: 300 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Se adjunta la documentación correspondiente",
                size: 22,
                font: "Aptos (Cuerpo)",
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Con sentimientos de distinguida consideración.",
                size: 20,
                font: "Times New Roman",
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Atentamente,",
                size: 20,
                font: "Times New Roman",
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text:
                  data.rolEnProyecto === "Director"
                    ? data.nombres.toUpperCase() +
                      " " +
                      data.apellidos.toUpperCase()
                    : data.nombreDirector.toUpperCase(),
                size: 20,
                bold: true,
                font: "Times New Roman",
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `DIRECTOR DEL PROYECTO ${data.codigoProyecto.toUpperCase()}`,
                size: 20,
                font: "Times New Roman",
              }),
            ],
          }),
        ],
      },
    ],
  });
  if (returnDocument) {
    return Packer.toBlob(doc);
  }

  Packer.toBlob(doc).then((blob) => {
    saveAs(
      blob,
      `Memorando solicitud para participar en evento académico ${data.codigoProyecto}.docx`
    );
  });
}

export async function generateAnexoAWithinProject(
  data,
  returnDocument = false
) {
  const template = {
    schemas: schemasAnexoANational,
    basePdf: basePdfAnexoANational,
  };

  // Fusionar los arrays transporteIda y transporteRegreso en un solo array llamado transporte
  const transporte = data.transporteIda.concat(data.transporteRegreso);
  const ultimaFechaLlegada =
    transporte.length > 0
      ? transporte[transporte.length - 1]?.fechaLlegada
      : "";
  const ultimaHoraLlegada =
    transporte.length > 0 ? transporte[transporte.length - 1]?.horaLlegada : "";
  var ponentciaText = "";

  if (
    data.tituloPonencia &&
    data.tituloPonencia.trim() !== "" &&
    data.tituloPonencia.trim() !== "No Aplica"
  ) {
    ponentciaText =
      "Para la participacion de la ponencia '" + data.tituloPonencia + "'";
  } else {
    ponentciaText = "";
  }

  var servidoresText = "";
  if (data.servidores && data.servidores.trim() !== "") {
    servidoresText = ", " + data.servidores;
  }

  const plugins = { text, image, qrcode: barcodes.qrcode };
  const transporteInfo = {};
  // Genera dinámicamente las propiedades para transporteTipo, transporteNombre, transporteRuta, transporteFechaS, transporteFechaSH, transporteFechaL, y transporteFechaLH
  for (let i = 0; i < 8; i++) {
    transporteInfo[`transporteTipo${i + 1}`] =
      transporte[i]?.tipoTransporte || "";
    transporteInfo[`transporteNombre${i + 1}`] =
      transporte[i]?.nombreTransporte || "";
    transporteInfo[`transporteRuta${i + 1}`] = transporte[i]?.ruta || "";
    transporteInfo[`transporteFechaS${i + 1}`] =
      formatDate(transporte[i]?.fechaSalida) || "";
    transporteInfo[`transporteFechaSH${i + 1}`] =
      transporte[i]?.horaSalida || "";
    transporteInfo[`transporteFechaL${i + 1}`] =
      formatDate(transporte[i]?.fechaLlegada) || "";
    transporteInfo[`transporteFechaLH${i + 1}`] =
      transporte[i]?.horaLlegada || "";
  }

  const inputs = [
    {
      fechaSolicitud: formattedDate,
      viaticos: data.viaticosSubsistencias === "SI" ? "X" : "",
      movilizacion: data.viaticosSubsistencias === "SI" ? "X" : "",
      subsistencias: data.viaticosSubsistencias === "SI" ? "X" : "",
      alimentacion: data.viaticosSubsistencias === "SI" ? "X" : "",

      nombresCompletos:
        data.apellidos.toUpperCase() + " " + data.nombres.toUpperCase(),
      lugar: data.ciudadEvento + ", " + data.paisEvento,
      puesto: data.cargo,
      unidadPerteneciente: data.departamento,

      fechaSalida: formatDate(data.transporteIda[0]?.fechaSalida),
      horaSalida: data.transporteIda[0]?.horaSalida,

      fechaLlegada: formatDate(ultimaFechaLlegada),
      horaLlegada: ultimaHoraLlegada,

      servidores:
        data.apellidos.toUpperCase() +
        " " +
        data.nombres.toUpperCase() +
        servidoresText.toUpperCase(),

      actividades:
        "Dentro de las actividades del proyecto  " +
        data.codigoProyecto +
        " titulado  '" +
        data.tituloProyecto +
        "'  se llevará a cabo la participación en el evento  '" +
        data.tituloEvento +
        "', que tendrá lugar del  " +
        data.fechaInicioEvento +
        "  al  " +
        data.fechaFinEvento +
        " en la ciudad de  " +
        data.ciudadEvento +
        "," +
        data.paisEvento +
        ". " +
        ponentciaText,

      ...transporteInfo,

      banco: data.nombreBanco,
      bancoTipoCuenta: data.tipoCuenta,
      numeroCuenta: data.numeroCuenta,

      nombresCompletos2:
        data.nombres.toUpperCase() +
        " " +
        data.apellidos.toUpperCase() +
        "\n" +
        data.cargo.toUpperCase() +
        "\n" +
        data.cedula,

      nombresCompletosJefeInmediato:
        data.nombreJefeInmediato.toUpperCase() +
        "\n" +
        data.cargoJefeInmediato.toUpperCase(),
    },
  ];

  const pdf = await generate({ template, plugins, inputs });

  const blob = new Blob([pdf.buffer], { type: "application/pdf" });
  if (returnDocument) {
    return blob;
  }
  saveAs(
    blob,
    "Anexo 1 - Solicitud de viáticos EPN " + data.codigoProyecto + ".pdf"
  );
}

export async function generateAnexo2WithinProject(
  data,
  returnDocument = false
) {
  const MyPDFDocument = (
    <PDFDocument>
      <Page style={styles.page}>
        {/* Título del formulario */}
        <Text style={styles.header}>
          Anexo 2 – Formulario para salidas nacionales dentro de proyectos
        </Text>
        {/* 1. Datos Generales */}

        <Text style={styles.sectionTitle}>
          1. DATOS DEL PROYECTO Y DEL INVESTIGADOR PARTICIPANTE
        </Text>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol40}>
              <Text style={styles.tableCellText}>Código del Proyecto:</Text>
            </View>
            <View style={styles.tableColAuto}>
              <Text style={styles.tableCellTextBlue}>
                {data.codigoProyecto || "_________"}
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol40}>
              <Text style={styles.tableCellText}>Título de Proyecto:</Text>
            </View>
            <View style={styles.tableColAuto}>
              <Text style={styles.tableCellTextBlue}>
                {data.tituloProyecto || "_________"}
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol40}>
              <Text style={styles.tableCellText}>
                Nombres Completo del Participante:
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>
                {(data.apellidos ? data.apellidos.toUpperCase() : "_________") +
                  " " +
                  (data.nombres ? data.nombres.toUpperCase() : "_________")}
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol40}>
              <Text style={styles.tableCellText}>Rol en el Proyecto:</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>
                {data.rolEnProyecto || "_________"}
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol40}>
              <Text style={styles.tableCellText}>
                Departamento / Instituto:
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>
                {data.departamento || "_________"}
              </Text>
            </View>
          </View>
        </View>

        {/* 1. Datos del evento*/}

        <Text style={styles.sectionTitle}>2. DATOS DEL EVENTO</Text>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>Titulo del Evento:</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>
                {data.tituloEvento || "_________"}
              </Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>Lugar del Evento:</Text>
            </View>
            <View style={styles.tableCol15}>
              <Text style={styles.tableCellText}>Ciudad:</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>
                {data.ciudadEvento.toUpperCase() || "_________"}
              </Text>
            </View>
            <View style={styles.tableCol15}>
              <Text style={styles.tableCellText}>País:</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>
                {data.paisEvento.toUpperCase() || "_________"}
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>Fecha del evento:</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.textBlueCenter}>
                {"Desde el  "}
                <Text style={styles.tableCellTextBlue}>
                  {data.fechaInicioEvento || "_________"}
                  <Text style={styles.textBlueCenter}>
                    {" hasta el "}
                    <Text style={styles.tableCellTextBlue}>
                      {data.fechaFinEvento || "_________"}
                    </Text>
                  </Text>
                </Text>
              </Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>Tipo de Evento:</Text>
            </View>

            <View style={styles.tableCol}>
              <View style={styles.tableRow}>
                <View style={styles.tableCol40}>
                  <Text style={styles.tableCellText}>
                    - Conferencia o congreso:
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.baseText}>
                    {"( "}
                    <Text style={styles.tableCellTextBlue}>
                      {data.tipoEvento === "Conferencia o congreso" ? "X" : ""}
                      <Text style={styles.baseText}>{" )"}</Text>
                    </Text>
                  </Text>
                </View>
              </View>

              <View style={styles.tableRow}>
                <View style={styles.tableCol40}>
                  <Text style={styles.tableCellText}>- Taller:</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.baseText}>
                    {"( "}
                    <Text style={styles.tableCellTextBlue}>
                      {data.tipoEvento === "Taller" ? "X" : ""}
                      <Text style={styles.baseText}>{" )"}</Text>
                    </Text>
                  </Text>
                </View>
              </View>

              <View style={styles.tableRow}>
                <View style={styles.tableCol40}>
                  <Text style={styles.tableCellText}>
                    - Otro evento académico::
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.baseText}>
                    {"( "}
                    <Text style={styles.tableCellTextBlue}>
                      {data.tipoEvento === "Otro evento académico" ? "X" : ""}
                      <Text style={styles.baseText}>
                        {" ) "}
                        <Text style={styles.tableCellTextBlue}>
                          {data.otroEventoEspecificar
                            ? data.otroEventoEspecificar
                            : " "}
                        </Text>
                      </Text>
                    </Text>
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>
                Solicita para participar en el evento:
              </Text>
            </View>

            <View style={styles.tableCol}>
              <View style={styles.tableRow}>
                <View style={styles.tableCol40}>
                  <Text style={styles.tableCellText}>- Pasajes aéreos:</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.baseText}>
                    {"( "}
                    <Text style={styles.tableCellTextBlue}>
                      {data.pasajesAereos === "SI" ? "X" : ""}
                      <Text style={styles.baseText}>{" )"}</Text>
                    </Text>
                  </Text>
                </View>
              </View>

              <View style={styles.tableRow}>
                <View style={styles.tableCol40}>
                  <Text style={styles.tableCellText}>
                    - Viáticos y subsistencias:
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.baseText}>
                    {"( "}
                    <Text style={styles.tableCellTextBlue}>
                      {data.viaticosSubsistencias === "SI" ? "X" : ""}
                      <Text style={styles.baseText}>{" )"}</Text>
                    </Text>
                  </Text>
                </View>
              </View>

              <View style={styles.tableRow}>
                <View style={styles.tableCol40}>
                  <Text style={styles.tableCellText}>- Inscripción:</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.baseText}>
                    {"( "}
                    <Text style={styles.tableCellTextBlue}>
                      {data.inscripcion === "SI" ? "X" : ""}
                      <Text style={styles.baseText}>{" ) "}</Text>
                    </Text>
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>Título de la Ponencia:</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>
                {data.tituloPonencia ? data.tituloPonencia : "No Aplica"}
              </Text>
            </View>
          </View>
        </View>

        {/* 1. Datos De la Salida de Campo*/}

        <Text style={styles.sectionTitle}>
          3. JUSTIFICACIÓN Y RELEVANCIA DE LA PARTICIPACIÓN{" "}
        </Text>

        <Text style={styles.baseText}>
          3.1 Objetivo, resultado o producto del proyecto al que aporta la
          participación en el evento
        </Text>
        <Text style={styles.textBlue}>{data.objetivoProyecto}</Text>
        <Text style={styles.baseText}>
          3.2 Relevancia del evento para su proyecto
        </Text>
        <Text style={styles.textBlue}>{data.relevanciaEvento}</Text>
        <Text>{"\n\n"}</Text>
        <View>
          <Text style={styles.sectionTitle}>
            4. INFORMACIÓN DEL PAGO DE INSCRIPCIÓN{" "}
          </Text>

          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableCol15}>
                <Text style={styles.tableCellText}>
                  Valor de la Inscripción:
                </Text>
              </View>
              <View style={styles.tableCol}>
                {data.inscripciones.map((inscripcion, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCellTextBlueCenter}>
                      {inscripcion.monedaPago && data.inscripcion === "SI"
                        ? inscripcion.monedaPago +
                          " " +
                          (inscripcion.valorInscripcion || " ")
                        : ""}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.tableCol15}>
                <Text style={styles.tableCellText}>
                  Fechas de pago de inscripción:
                </Text>
              </View>
              <View style={styles.tableCol}>
                {data.inscripciones.map((inscripcion, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCellTextBlueCenter}>
                      {inscripcion.pagoLimite && data.inscripcion === "SI"
                        ? inscripcion.pagoLimite +
                          " " +
                          (inscripcion.limiteFecha || " ")
                        : ""}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCol15}>
                <Text style={styles.tableCellText}>Método de pago:</Text>
              </View>
              <View style={styles.tableCol}>
                <View style={styles.tableRow}>
                  <View style={styles.tableColAuto}>
                    <Text style={styles.baseText}>
                      1. Transferencia:
                      <Text style={styles.baseText}>
                        {" ( "}
                        <Text style={styles.tableCellTextBlue}>
                          {data.metodoPago === "Transferencia" &&
                          data.inscripcion === "SI"
                            ? "X"
                            : ""}
                          <Text style={styles.baseText}>
                            {
                              " )  “El pago es realizado por la EOD-UGIPS del VIIV”"
                            }
                          </Text>
                        </Text>
                      </Text>
                    </Text>
                    <Text style={styles.baseText}>
                      Adjuntar los siguientes documentos:
                    </Text>
                    <Text style={styles.baseText}>
                      a) Formulario de pagos al exterior, según el caso (Anexo
                      4)
                    </Text>
                    <Text style={styles.baseText}>
                      b) Documento donde se puede verificar el costo y fechas de
                      la inscripción al evento
                    </Text>
                  </View>
                </View>
                <View style={styles.tableRow}>
                  <View style={styles.tableCol}>
                    <Text style={styles.baseText}>
                      2. Otra (tarjeta de crédito, efectivo, etc...):
                      <Text style={styles.baseText}>
                        {" ( "}
                        <Text style={styles.tableCellTextBlue}>
                          {data.metodoPago === "Otra" &&
                          data.inscripcion === "SI"
                            ? "X"
                            : ""}
                          <Text style={styles.baseText}>{" )"}</Text>
                        </Text>
                      </Text>
                    </Text>
                    <Text style={styles.baseText}>
                      Adjuntar los siguientes documentos:
                    </Text>
                    <Text style={styles.baseText}>
                      a) Solicitud de REEMBOLSO. Incluir en el texto del
                      memorando la justificación de por qué se solicita este
                      método de pago.
                    </Text>
                    <Text style={styles.baseText}>
                      b) Documento donde se puede verificar el costo y fechas de
                      la inscripción al evento.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Etiqueta de Firma */}
        <Text style={styles.baseText}>Firma del Solicitante:</Text>

        {/* Espacio en blanco para la firma */}
        <Text>{"\n\n\n"}</Text>

        {/* Nombre completo */}
        <Text style={styles.baseTextCenter}>________________________</Text>

        {/* Nombre completo */}
        <Text style={styles.tableCellTextBlueCenter}>
          {`${
            data.rolEnProyecto === "Director"
              ? data.nombres + " " + data.apellidos
              : data.nombreDirector.toUpperCase()
          }`}
        </Text>

        {/* Nombre del director y código de proyecto */}
        <Text style={styles.tableCellTextBlueCenter}>
          {"Director del proyecto - " + data.codigoProyecto}
        </Text>

        <Text style={styles.baseTextCenter}>
          **A su regreso el investigador(a) deberá presentar la factura o nota
          de venta de los gastos de hospedaje y/o alimentación, o de los
          establecidos en el artículo 9 del Reglamento de Viáticos al Exterior,
          que no hayan sido cubiertos por estas instituciones u organismos, para
          el reconocimiento de estos rubros y su correspondiente liquidación.
        </Text>
      </Page>
    </PDFDocument>
  );

  // Convertir el documento PDF a un Blob
  const blob = await pdf(MyPDFDocument).toBlob();
  if (returnDocument) {
    return blob;
  }
  // Descargar automáticamente el archivo PDF
  saveAs(blob, "Anexo2_Formulario para salidas nacionales.pdf");
}

//Documentos de eventos Nacionales fuera de Proyectos
export async function generateMemoNationalOutsideProject1(
  data,
  returnDocument = false
) {
  const departament = capitalizeWords(data.departamento.toLowerCase());
  // Array para almacenar las solicitudes
  let solicitudes = [];

  // Verificar si se debe incluir "viáticos y subsistencias"
  if (data.viaticosSubsistencias === "SI") {
    solicitudes.push(" la asignación de viáticos y subsistencias");
  }
  // Verificar si se debe incluir "pasajes aéreos"
  if (data.pasajesAereos === "SI") {
    solicitudes.push(" la compra de pasajes aéreos");
  }
  // Verificar si se debe incluir "pago de inscripción"
  if (data.inscripcion === "SI") {
    solicitudes.push(" el pago de inscripción");
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "Formato de memorando para Jefe del Departamento al VIIV",
                bold: true,
                size: 24,
                font: "Aptos (Cuerpo)",
              }),
            ],
            spacing: { after: 300 },
            alignment: "start",
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "PARA:\t\t",
                bold: true,
                size: 22,
                font: "Aptos (Cuerpo)",
              }),
              new TextRun({
                text: "Dr. Marco Santorum",
                size: 22,
                font: "Aptos (Cuerpo)",
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "\t\tVicerrector de Investigación, Innovación y Vinculación",
                size: 22,
                bold: true,
                font: "Aptos (Cuerpo)",
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "ASUNTO:\t",
                bold: true,
                size: 22,
                font: "Aptos (Cuerpo)",
              }),
              new TextRun({
                text: "Solicitud de auspicio institucional y solicitud de autorización para viaje nacional",
                size: 22,
                font: "Aptos (Cuerpo)",
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "De mi consideración:",
                size: 22,
                font: "Aptos (Cuerpo)",
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Por medio del presente comunico a usted que, en mi calidad de ${data.cargoJefeInmediato}, se ha otorgado el aval y permiso al profesor(a) ${data.nombres} ${data.apellidos}, profesor titular adscrito al ${departament}, para que participe en el evento " ${data.tituloEvento} " a realizarse en ${data.ciudadEvento}, Ecuador, del ${data.fechaInicioEvento} al ${data.fechaFinEvento}, para la presentación de la ponencia: " ${data.tituloPonencia} ". `,
                size: 20,
                font: "Times New Roman",
              }),
            ],
            spacing: { after: 300 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Por lo expuesto, solicito muy comedidamente, se realicen los trámites pertinentes para que el profesor ${data.nombres} ${data.apellidos}, pueda participar en la conferencia antes mencionada y de igual forma se auspicie con presupuesto del Vicerrectorado de Investigación, Innovación y Vinculación,${solicitudes}.`,
                size: 20,
                font: "Times New Roman",
              }),
            ],
            spacing: { after: 300 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Se adjunta la documentación correspondiente",
                size: 22,
                font: "Aptos (Cuerpo)",
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Con sentimientos de distinguida consideración.",
                size: 20,
                font: "Times New Roman",
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Atentamente,",
                size: 20,
                font: "Times New Roman",
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: data.nombreJefeInmediato.toUpperCase(),
                size: 20,
                bold: true,
                font: "Times New Roman",
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: data.cargoJefeInmediato.toUpperCase(),
                size: 20,
                font: "Times New Roman",
              }),
            ],
          }),
        ],
      },
    ],
  });
  if (returnDocument) {
    return Packer.toBlob(doc);
  }

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, "Memorando para Jefe del Departamento al VIIV.docx");
  });
}

export async function generateMemoNationalOutsideProject2(
  data,
  returnDocument = false
) {
  let solicitudes = [];

  // Verificar si se debe incluir "viáticos y subsistencias"
  if (data.viaticosSubsistencias === "SI") {
    solicitudes.push(" la asignación de viáticos y subsistencias");
  }
  if (data.pasajesAereos === "SI") {
    solicitudes.push(" la compra de pasajes aéreos");
  }
  // Verificar si se debe incluir "pago de inscripción"
  if (data.inscripcion === "SI") {
    solicitudes.push(" el pago de inscripción");
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "Formato de memorando del Profesor al Jefe",
                bold: true,
                size: 24,
                font: "Aptos (Cuerpo)",
              }),
            ],
            spacing: { after: 300 },
            alignment: "start",
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "PARA:\t\t",
                bold: true,
                size: 22,
                font: "Aptos (Cuerpo)",
              }),
              new TextRun({
                text: data.nombreJefeInmediato,
                size: 22,
                font: "Aptos (Cuerpo)",
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `\t\t${data.cargoJefeInmediato}`,
                size: 22,
                bold: true,
                font: "Aptos (Cuerpo)",
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "ASUNTO:\t",
                bold: true,
                size: 22,
                font: "Aptos (Cuerpo)",
              }),
              new TextRun({
                text: "Solicitud de auspicio institucional y solicitud de autorización para viaje nacional",
                size: 22,
                font: "Aptos (Cuerpo)",
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "De mi consideración:",
                size: 22,
                font: "Aptos (Cuerpo)",
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Por medio del presente solicito el aval y permiso para participar en el evento " ${data.tituloEvento} " a realizarse en ${data.ciudadEvento}, Ecuador, del ${data.fechaInicioEvento} al ${data.fechaFinEvento}, para la presentación de la ponencia: " ${data.tituloPonencia} ". `,
                size: 20,
                font: "Times New Roman",
              }),
            ],
            spacing: { after: 300 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Adicionalmente solicito se realicen los trámites pertinentes para que se auspicie con presupuesto del Vicerrectorado de Investigación, Innovación y Vinculación,${solicitudes}.`,
                size: 20,
                font: "Times New Roman",
              }),
            ],
            spacing: { after: 300 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Se adjunta la documentación correspondiente",
                size: 22,
                font: "Aptos (Cuerpo)",
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Con sentimientos de distinguida consideración.",
                size: 20,
                font: "Times New Roman",
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Atentamente,",
                size: 20,
                font: "Times New Roman",
              }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text:
                  data.nombres.toUpperCase() +
                  " " +
                  data.apellidos.toUpperCase(),
                size: 20,
                bold: true,
                font: "Times New Roman",
              }),
            ],
            spacing: { after: 100 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: data.puesto.toUpperCase(),
                size: 20,
                font: "Times New Roman",
              }),
            ],
          }),
        ],
      },
    ],
  });
  if (returnDocument) {
    return Packer.toBlob(doc);
  }

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, "Memorando del Profesor al Jefe.docx");
  });
}

export async function generateAnexo10NationalOutsideProject(
  data,
  returnDocument = false
) {
  const MyPDFDocument = (
    <PDFDocument>
      <Page style={styles.page}>
        <Text style={styles.header}>
          Anexo 10 – Formulario para salidas nacionales fuera de proyectos
        </Text>

        <Text style={styles.sectionTitle}>1. DATOS DEL INVESTIGADOR</Text>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol40}>
              <Text style={styles.tableCellText}>Nombres Completos:</Text>
            </View>
            <View style={styles.tableColAuto}>
              <Text style={styles.tableCellTextBlue}>
                {data.nombres.toUpperCase() +
                  " " +
                  data.apellidos.toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol40}>
              <Text style={styles.tableCellText}>
                Departamento / Instituto:
              </Text>
            </View>
            <View style={styles.tableColAuto}>
              <Text style={styles.tableCellTextBlue}>{data.departamento}</Text>
            </View>
          </View>
        </View>

        {/* 2. Datos del evento*/}

        <Text style={styles.sectionTitle}>
          2. DATOS DEL EVENTO Y REQUERIMIENTO{" "}
        </Text>
        <View style={styles.subSectionTitle}>
          <Text>
            Marque con una "X" la opción y complete la información según
            corresponda
          </Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>Titulo del Evento:</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>{data.tituloEvento}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>Lugar del Evento:</Text>
            </View>
            <View style={styles.tableCol15}>
              <Text style={styles.tableCellText}>Ciudad:</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>
                {data.ciudadEvento.toUpperCase()}
              </Text>
            </View>
            <View style={styles.tableCol15}>
              <Text style={styles.tableCellText}>País:</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>{"Ecuador"}</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>Fecha del evento:</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.textBlueCenter}>
                {"Desde el  "}
                <Text style={styles.tableCellTextBlue}>
                  {data.fechaInicioEvento}
                  <Text style={styles.textBlueCenter}>
                    {" hasta el "}
                    <Text style={styles.tableCellTextBlue}>
                      {data.fechaFinEvento}
                    </Text>
                  </Text>
                </Text>
              </Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>
                Relevancia académica del evento:
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>
                {data.RelevanciaAcademica}
              </Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>Título de la Ponencia: </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>
                {data.tituloPonencia}
              </Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>Tipo de ponencia: </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>{data.tipoPonencia}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>
                ¿El artículo será publicado?
              </Text>
              <Text style={styles.baseText}>
                {"SI ( "}
                <Text style={styles.tableCellTextBlue}>
                  {data.articuloPublicado === "SI" ? "X" : ""}
                  <Text style={styles.baseText}>{" )"}</Text>
                </Text>
              </Text>
              <Text style={styles.baseText}>
                {"NO ( "}
                <Text style={styles.tableCellTextBlue}>
                  {data.articuloPublicado === "NO" ? "X" : ""}
                  <Text style={styles.baseText}>{" )"}</Text>
                </Text>
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>
                {data.detalleArticuloSI}
              </Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>Solicita:</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellText}>Pasajes aéreos:</Text>
            </View>
            <View style={styles.tableCol15}>
              <Text style={styles.baseText}>
                {"SI( "}
                <Text style={styles.tableCellTextBlue}>
                  {data.pasajesAereos === "SI" ? "X" : ""}
                  <Text style={styles.baseText}>{" )"}</Text>
                </Text>
              </Text>
              <Text style={styles.baseText}>
                {"NO( "}
                <Text style={styles.tableCellTextBlue}>
                  {data.pasajesAereos === "NO" ? "X" : ""}
                  <Text style={styles.baseText}>{" )"}</Text>
                </Text>
              </Text>
            </View>
            <View style={styles.tableCol15}>
              <Text style={styles.tableCellText}>
                Viáticos y subsistencias:
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.baseText}>
                {"SI( "}
                <Text style={styles.tableCellTextBlue}>
                  {data.viaticosSubsistencias === "SI" ? "X" : ""}
                  <Text style={styles.baseText}>{" )"}</Text>
                </Text>
              </Text>
              <Text style={styles.baseText}>
                {"NO( "}
                <Text style={styles.tableCellTextBlue}>
                  {data.viaticosSubsistencias === "NO" ? "X" : ""}
                  <Text style={styles.baseText}>{" )"}</Text>
                </Text>
              </Text>
            </View>
            <View style={styles.tableCol15}>
              <Text style={styles.tableCellText}>Inscripción:</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.baseText}>
                {"SI( "}
                <Text style={styles.tableCellTextBlue}>
                  {data.inscripcion === "SI" ? "X" : ""}
                  <Text style={styles.baseText}>{" )"}</Text>
                </Text>
              </Text>
              <Text style={styles.baseText}>
                {"NO( "}
                <Text style={styles.tableCellTextBlue}>
                  {data.inscripcion === "NO" ? "X" : ""}
                  <Text style={styles.baseText}>{" )"}</Text>
                </Text>
              </Text>
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.sectionTitle}>
            3. INFORMACIÓN DEL PAGO DE INSCRIPCIÓN{" "}
          </Text>

          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableCol15}>
                <Text style={styles.tableCellText}>
                  Valor de la Inscripción:
                </Text>
              </View>
              <View style={styles.tableCol}>
                {data.inscripciones.map((inscripcion, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCellTextBlueCenter}>
                      {inscripcion.valorInscripcion
                        ? "$ " + (inscripcion.valorInscripcion || " ")
                        : ""}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.tableCol15}>
                <Text style={styles.tableCellText}>
                  Fechas de pago de inscripción:
                </Text>
              </View>
              <View style={styles.tableCol}>
                {data.inscripciones.map((inscripcion, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCellTextBlueCenter}>
                      {data.inscripciones.map((inscripcion, index) => (
                        <View key={index} style={styles.tableRow}>
                          <Text style={styles.tableCellTextBlueCenter}>
                            {inscripcion.pagoLimite
                              ? inscripcion.pagoLimite +
                                " " +
                                (inscripcion.limiteFecha || " ")
                              : ""}
                          </Text>
                        </View>
                      ))}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.tableCol15}>
                <Text style={styles.tableCellText}>Método de pago:</Text>
              </View>
              <View style={styles.tableCol}>
                <View style={styles.tableRow}>
                  <View style={styles.tableCol}>
                    <Text style={styles.baseText}>
                      1. Transferencia:
                      <Text style={styles.baseText}>
                        {" ( "}
                        <Text style={styles.tableCellTextBlue}>
                          {data.metodoPago === "Transferencia" &&
                          data.inscripcion === "SI"
                            ? "X"
                            : ""}
                          <Text style={styles.baseText}>
                            {
                              " )  “El pago es realizado por la EOD-UGIPS del VIIV”"
                            }
                          </Text>
                        </Text>
                      </Text>
                    </Text>
                    <Text style={styles.baseText}>
                      Adjuntar los siguientes documentos:
                    </Text>
                    <Text style={styles.baseText}>
                      a)Formulariodepagosalexterior, ,segunelcaso(Anexo 4)
                    </Text>
                    <Text style={styles.baseText}>
                      b) Documento donde se puede verificar el costo y fechas de
                      la inscripción al evento
                    </Text>
                  </View>
                </View>
                <View style={styles.tableRow}>
                  <View style={styles.tableCol}>
                    <Text style={styles.baseText}>
                      - Otra(tarjetadecrédito,efectivo,etc...):
                      <Text style={styles.baseText}>
                        {"( "}
                        <Text style={styles.tableCellTextBlue}>
                          {data.metodoPago === "Otra" ? "X" : ""}
                          <Text style={styles.baseText}>{" )"}</Text>
                        </Text>
                      </Text>
                    </Text>
                    <Text style={styles.baseText}>
                      Adjuntar los siguientes documentos:
                    </Text>
                    <Text style={styles.baseText}>
                      a) Solicitud de REEMBOLSO. Incluir texto con justificación
                      en el mismo memorando del requerimiento.
                    </Text>
                    <Text style={styles.baseText}>
                      b)Documento donde se puede verificar el costo y fechas de
                      la inscripción al evento
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Etiqueta de Firma */}
        <Text style={styles.baseText}>Firma del Solicitante:</Text>

        {/* Espacio en blanco para la firma */}
        <Text>{"\n\n\n"}</Text>

        {/* Nombre completo */}
        <Text style={styles.baseTextCenter}>________________________</Text>

        {/* Nombre completo */}
        <Text style={styles.tableCellTextBlueCenter}>
          {`${data.nombres.toUpperCase() + " " + data.apellidos.toUpperCase()}`}
        </Text>

        {/* Nombre del director y código de proyecto */}
        <Text style={styles.tableCellTextBlueCenter}>
          {`${data.puesto.toUpperCase()}`}
        </Text>

        <Text style={styles.tableCellText}>
          *A su regreso el investigador(a) deberá presentar la factura o nota de
          venta de los gastos de hospedaje y/o alimentación, mismos que deberán
          justificar el 70% del valor del viatico, caso contrario la diferencia
          deberá ser reintegrada a la cuenta de la EOD-UGIPS. (Norma Técnica
          para el pago de viáticos Artículo 15 Control y liquidación)
        </Text>
      </Page>
    </PDFDocument>
  );
  // Convertir el documento PDF a un Blob
  const blob = await pdf(MyPDFDocument).toBlob();
  if (returnDocument) {
    return blob;
  }
  // Descargar automáticamente el archivo PDF
  saveAs(
    blob,
    `Anexo 10 - Formulario salidas nacionales fuera de proyecto.pdf`
  );
}

export async function generateAnexoANationalOutsideProject(
  data,
  returnDocument = false
) {
  const template = {
    schemas: schemasAnexoANational,
    basePdf: basePdfAnexoANational,
  };

  // Fusionar los arrays transporteIda y transporteRegreso en un solo array llamado transporte
  const transporte = data.transporteIda.concat(data.transporteRegreso);

  const ultimaFechaLlegada =
    transporte.length > 0
      ? transporte[transporte.length - 1]?.fechaLlegada
      : "";
  const ultimaHoraLlegada =
    transporte.length > 0 ? transporte[transporte.length - 1]?.horaLlegada : "";

  var ponentciaText = "";
  if (
    data.tituloPonencia &&
    data.tituloPonencia.trim() !== "" &&
    data.tituloPonencia.trim() !== "No aplica"
  ) {
    ponentciaText =
      " Para la presentación de la ponencia '" +
      data.tituloPonencia +
      "' del tipo " +
      data.tipoPonencia;
  } else {
    ponentciaText = "";
  }
  const plugins = { text, image, qrcode: barcodes.qrcode };
  const transporteInfo = {};

  // Genera dinámicamente las propiedades para transporteTipo, transporteNombre, transporteRuta, transporteFechaS, transporteFechaSH, transporteFechaL, y transporteFechaLH
  for (let i = 0; i < 6; i++) {
    transporteInfo[`transporteTipo${i + 1}`] =
      transporte[i]?.tipoTransporte || "";
    transporteInfo[`transporteNombre${i + 1}`] =
      transporte[i]?.nombreTransporte || "";
    transporteInfo[`transporteRuta${i + 1}`] = transporte[i]?.ruta || "";
    transporteInfo[`transporteFechaS${i + 1}`] =
      formatDate(transporte[i]?.fechaSalida) || "";
    transporteInfo[`transporteFechaSH${i + 1}`] =
      transporte[i]?.horaSalida || "";
    transporteInfo[`transporteFechaL${i + 1}`] =
      formatDate(transporte[i]?.fechaLlegada) || "";
    transporteInfo[`transporteFechaLH${i + 1}`] =
      transporte[i]?.horaLlegada || "";
  }

  const inputs = [
    {
      fechaSolicitud: formattedDate,
      viaticos: data.viaticosSubsistencias === "SI" ? "X" : "",
      movilizacion: data.viaticosSubsistencias === "SI" ? "X" : "",
      subsistencias: data.viaticosSubsistencias === "SI" ? "X" : "",
      alimentacion: data.viaticosSubsistencias === "SI" ? "X" : "",
      nombresCompletos:
        data.apellidos.toUpperCase() + " " + data.nombres.toUpperCase(),
      lugar: data.ciudadEvento + ", Ecuador",
      puesto: data.puesto,
      unidadPerteneciente: data.departamento,

      fechaSalida: formatDate(data.transporteIda[0]?.fechaSalida),
      horaSalida: data.transporteIda[0]?.horaSalida,

      fechaLlegada: formatDate(ultimaFechaLlegada),
      horaLlegada: ultimaHoraLlegada,

      servidores:
        data.apellidos.toUpperCase() +
        " " +
        data.nombres.toUpperCase() +
        ". " +
        data.servidores.toUpperCase(),

      actividades:
        "Asistencia al evento '" +
        data.tituloEvento +
        "', que tendrá lugar del " +
        data.fechaInicioEvento +
        " al " +
        data.fechaFinEvento +
        " en la ciudad de " +
        data.ciudadEvento +
        ", Ecuador." +
        ponentciaText,

      ...transporteInfo,

      banco: data.nombreBanco,
      bancoTipoCuenta: data.tipoCuenta,
      numeroCuenta: data.numeroCuenta,

      nombresCompletos2:
        data.nombres.toUpperCase() +
        " " +
        data.apellidos.toUpperCase() +
        "\n" +
        data.puesto.toUpperCase() +
        "\n" +
        data.cedula,

      nombresCompletosJefeInmediato:
        data.nombreJefeInmediato.toUpperCase() +
        "\n" +
        data.cargoJefeInmediato.toUpperCase(),
    },
  ];

  const pdf = await generate({ template, plugins, inputs });

  const blob = new Blob([pdf.buffer], { type: "application/pdf" });
  if (returnDocument) {
    return blob;
  }

  saveAs(blob, "Anexo 1 - Solicitud de viáticos EPN.pdf");
}
