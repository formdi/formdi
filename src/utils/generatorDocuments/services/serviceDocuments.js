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

import { schemasAnexoA6 } from "../../schemasAnexo6";
import { basePdfAnexo6 } from "../../basePdfAnexo6";

Font.register({
  family: "Roboto",
  src: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu72xKOzY.woff2",
  fontWeight: 900,
});

const today = new Date();
const formattedDate = formatDate(today);


//documentos de pago de Inscripcion
export function generateMemoInscriptionPaymentOutProyect1(data, returnDocument = false) {
  // Array para almacenar las solicitudes
  let ponencias = [];
  // Verificar si se debe incluir "titulo ponencia"
  if (data.tituloPonencia === "") {
    ponencias.push();
  } else {
    ponencias.push(
      `, para la presentación de la ponencia: " ${data.tituloPonencia} "`
    );
  }

  let codigo = [];
  if (data.codigoProyecto === "") {
    codigo.push();
  } else {
    codigo.push(` / ${data.codigoProyecto} `);
  }

  let director = [];
  if (data.nombreDirector === "") {
    director.push(
      `${data.nombres.toUpperCase()} ${data.apellidos.toUpperCase()}`
    );
  } else {
    director.push(`${data.nombreDirector.toUpperCase()}`);
  }

  let dirCargo = [];

  if (
    data.nombreDirector === "" &&
    data.participacionProyecto === "fueraProyecto"
  ) {
    dirCargo.push(data.departamento);
  } else {
    dirCargo.push(`Director del Proyecto - ${data.codigoProyecto.toUpperCase()}`);
  }

  let formulario = [];
  if (data.participacionProyecto === "fueraProyecto") {
    formulario.push("Fuera de Proyecto");
  } else {
    formulario.push("Dentro de Proyecto");
  }

  let codigoP = [];
  if (data.codigoProyecto === "") {
    codigoP.push();
  } else {
    codigoP.push(`${data.codigoProyecto} `);
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: `Formato de memorando para pago de inscripción ${formulario}`,
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
                text: "\t\tVicerector de Investigación, Innovación y Vinculación",
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
                text: `Solicitud para pago de inscripción ${codigo}`,
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
                text: `Por medio del presente solicito se realicen los trámites pertinentes para que se auspicie con presupuesto del Vicerrectorado de Investigación, Innovación y Vinculación, el pago de inscripción para el evento " ${data.tituloEvento} " a realizarse en ${data.ciudadEvento}, ${data.paisEvento}, del ${data.fechaInicioEvento} al ${data.fechaFinEvento}${ponencias}. `,
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
                text: `${director}`,
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
                text: `${dirCargo}`,
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
      `Memorando para Pago de Inscripción ${formulario} ${codigoP}.docx`
    );
  });
}
export async function generateAnexo5InscriptionPayment(data, returnDocument = false) {
  const nombreCompleto =
  data.participacionProyecto === "fueraProyecto"
    ? `${data.nombres.toUpperCase()} ${data.apellidos.toUpperCase()}`
    : data.rolEnProyecto === "Director"
    ? `${data.nombres.toUpperCase()} ${data.apellidos.toUpperCase()}`
    : data.nombreDirector.toUpperCase();

  const formulario =
    data.participacionProyecto === "fueraProyecto"
      ? "Fuera de Proyecto"
      : "Dentro de Proyecto";

  let codigoP = data.codigoProyecto === "" ? "" : `${data.codigoProyecto} `;
  const cargoFirma =
  data.participacionProyecto === "fueraProyecto"
    ? data.departamento
    : `Director del proyecto - ${data.codigoProyecto.toUpperCase()}`;

  const MyPDFDocument = (
    <PDFDocument>
      <Page style={styles.page}>
        <Text style={styles.header}>
          Anexo 5 - FORMULARIO PARA PAGOS DE INSCRIPCIÓN
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
          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.baseText}>
                {"Fuera de Proyecto: ( "}
                <Text style={styles.tableCellTextBlue}>
                  {data.participacionProyecto === "fueraProyecto" ? "X" : ""}
                  <Text style={styles.baseText}>{" )"}</Text>
                </Text>
              </Text>
            </View>
            <View style={styles.tableCol25}>
              <Text style={styles.baseText}>
                {"Dentro de Proyecto: ( "}
                <Text style={styles.tableCellTextBlue}>
                  {data.participacionProyecto === "dentroProyecto" ? "X" : ""}
                  <Text style={styles.baseText}>{" )"}</Text>
                </Text>
              </Text>
            </View>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>Código del Proyecto:</Text>
            </View>
            <View style={styles.tableColAuto}>
              <Text style={styles.tableCellTextBlue}>
                {data.codigoProyecto}
              </Text>
            </View>
          </View>
        </View>

        {/* 2. Datos del evento*/}

        <Text style={styles.sectionTitle}>2. DATOS DEL EVENTO</Text>

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
              <Text style={styles.tableCellTextBlue}>
                {data.paisEvento.toUpperCase()}
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
              <Text style={styles.tableCellText}>Título del artículo:</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>
                {data.tituloArticulo}
              </Text>
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
                      {inscripcion.monedaPago
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
                      - Transferencia:
                      <Text style={styles.baseText}>
                        {"( "}
                        <Text style={styles.tableCellTextBlue}>
                          {data.metodoPago === "Transferencia" ? "X" : ""}
                          <Text style={styles.baseText}>{" )"}</Text>
                        </Text>
                      </Text>
                    </Text>
                    <Text style={styles.baseText}>
                      Adjuntar los siguientes documentos:
                    </Text>
                    <Text style={styles.baseText}>
                      a) Formulario de pagos al exterior (Anexo 6)
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
          {`${nombreCompleto}`}
        </Text>

        {/* Nombre del director y código de proyecto */}
        <Text style={styles.tableCellTextBlueCenter}>
          {cargoFirma}
          {/* lo de aqui esta mal toca refactorizar pues  Aqui va el nombre del departamnete si esq no esta dentro de proyecto en caso contrario va Director del proeycto - (codigo aqui)  */}
        </Text>
      </Page>
    </PDFDocument>
  );
  // Convertir el documento PDF a un Blob
  const blob = await pdf(MyPDFDocument).toBlob();
   if( returnDocument ){
    return blob;
  }
  // Descargar automáticamente el archivo PDF
  saveAs(
    blob,
    `Anexo 5 - Formulario Pago Inscripción ${formulario} ${codigoP}.pdf`
  );
}

//Documentos de pago de publicacion
export function generateMemoPublicationPaymentProject(data, returnDocument = false) {
  let codigo = [];
  if (data.codigoProyecto === "") {
    codigo.push();
  } else {
    codigo.push(` / ${data.codigoProyecto} `);
  }

  let director = [];
  if (data.nombreDirector === "") {
    director.push(
      `${data.nombres.toUpperCase()} ${data.apellidos.toUpperCase()}`
    );
  } else {
    director.push(`${data.nombreDirector.toUpperCase()}`);
  }

  let dirCargo = [];

  if (
    data.nombreDirector === "" &&
    data.participacionProyecto === "fueraProyecto"
  ) {
    dirCargo.push(data.departamento);
  } else {
    dirCargo.push(`Director del Proyecto ${data.codigoProyecto}`);
  }

  let formulario = [];
  if (data.participacionProyecto === "fueraProyecto") {
    formulario.push("Fuera de Proyecto");
  } else {
    formulario.push("Dentro de Proyecto");
  }

  let codigoP = [];
  if (data.codigoProyecto === "") {
    codigoP.push();
  } else {
    codigoP.push(`${data.codigoProyecto} `);
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: `Formato de memorando para pago de inscripción ${formulario}`,
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
                text: "\t\tVicerector de Investigación, Innovación y Vinculación",
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
                text: `Solicitud para pago de publicación ${codigo}`,
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
                text: `Por medio del presente solicito se realicen los trámites pertinentes para que se auspicie con presupuesto del Vicerrectorado de Investigación, Innovación y Vinculación, el pago de la publicación " ${data.tituloPublicacion} ", en la revista "${data.nombreRevista}". `,
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
                text: `${director}`,
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
                text: `${dirCargo}`,
                size: 20,
                font: "Times New Roman",
              }),
            ],
          }),
        ],
      },
    ],
  });
  if (returnDocument){
    return Packer.toBlob(doc);
  }
  Packer.toBlob(doc).then((blob) => {
    saveAs(
      blob,
      `Memorando para Pago de Publicación ${formulario} ${codigoP}.docx`
    );
  });
}

export async function generateAnexo1PublicationPaymentWithin(data, returnDocument = false) {
  const nombreCompleto =
    data.rolEnProyecto === "Director"
      ? `${data.nombres.toUpperCase() + " " + data.apellidos.toUpperCase()}`
      : data.nombreDirector.toUpperCase();
  const MyPDFDocument = (
    <PDFDocument>
      <Page style={styles.page}>
        <Text style={styles.header}>
          ANEXO 1 - FORMULARIO PARA EL PAGO DE ARTÍCULOS CIENTÍFICOS ACEPTADOS
          EN REVISTAS DE ALTO IMPACTO-DENTRO DE PROYECTOS
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
          <View style={styles.tableRow}>
            <View style={styles.tableCol40}>
              <Text style={styles.tableCellText}>Código del Proyecto:</Text>
            </View>
            <View style={styles.tableColAuto}>
              <Text style={styles.tableCellTextBlue}>
                {data.codigoProyecto}
              </Text>
            </View>
          </View>
        </View>

        {/*2. DATOS DE LA PUBLICACIÓN  */}

        <Text style={styles.sectionTitle}>2. DATOS DE LA PUBLICACIÓN</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>
                Título de la publicación:
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>
                {data.tituloPublicacion}
              </Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>Nombre de la Revista:</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>{data.nombreRevista}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>
                Autores de la EPN: (Titulares, Ocasionales, otros){" "}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>{data.autoresEPN}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>Autores externos:</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>
                {data.autoresExternos}
              </Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>
                Base de datos de indexación:
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>{data.baseDatos}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>
                Cuartil de la publicación:{" "}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>
                {data.cuartilPublicacion}
              </Text>
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.sectionTitle}>
            3. DETALLE DE LA FORMA DE PAGO DE PUBLICACIÓN{" "}
          </Text>

          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableCol15}>
                <Text style={styles.tableCellText}>
                  Valor de la publicación:
                </Text>
              </View>
              <View style={styles.tableCol}>
                {data.publicaciones.map((publicaciones, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCellTextBlueCenter}>
                      {publicaciones.monedaPago
                        ? publicaciones.monedaPago +
                          " " +
                          (publicaciones.valorPublicacion || " ")
                        : ""}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.tableCol15}>
                <Text style={styles.tableCellText}>
                  Fecha máxima de pago de la publicación:
                </Text>
              </View>
              <View style={styles.tableCol}>
                {data.publicaciones.map((publicaciones, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCellTextBlueCenter}>
                      {data.publicaciones.map((publicaciones, index) => (
                        <View key={index} style={styles.tableRow}>
                          <Text style={styles.tableCellTextBlueCenter}>
                            {publicaciones.limiteFecha
                              ? publicaciones.limiteFecha || " "
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
                      - Transferencia:
                      <Text style={styles.baseText}>
                        {"( "}
                        <Text style={styles.tableCellTextBlue}>
                          {data.metodoPago === "Transferencia" ? "X" : ""}
                          <Text style={styles.baseText}>{" )"}</Text>
                        </Text>
                      </Text>
                    </Text>
                    <Text style={styles.baseText}>
                      Adjuntar los siguientes documentos:
                    </Text>
                    <Text style={styles.baseText}>
                      a)Formulario de registro de cuenta o formulario de giro al
                      exterior (según corresponda)
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
                      a)Solicitud de REEMBOLSO.
                    </Text>
                    <Text style={styles.baseText}>
                      b)Factura del solicitante a nombre de la Unidad de Gestión
                      de Investigación y Proyección Social, adjuntando el
                      respaldo de la transacción. *
                    </Text>
                    <Text style={styles.baseText}>
                      *La Factura se entregará una vez que el investigador(a)
                      solicite el pago de reembolso.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Etiqueta de Firma */}
        <Text style={styles.baseText}>Firma del Director del Proyecto: </Text>

        {/* Espacio en blanco para la firma */}
        <Text>{"\n\n\n"}</Text>

        {/* Nombre completo */}
        <Text style={styles.baseTextCenter}>________________________</Text>

        {/* Nombre completo */}
        <Text style={styles.tableCellTextBlueCenter}>
          {`${nombreCompleto}`}
        </Text>

        {/* Nombre del director y código de proyecto */}
        <Text style={styles.tableCellTextBlueCenter}>
          {`Directo del proyecto - ${data.codigoProyecto || "Código de prueba"}`}
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
    `Anexo 1 - Formulario Pago Publicación Dentro del Proyecto-${data.codigoProyecto} .pdf`
  );
}

export async function generateAnexo2PublicationPaymentOutside(data, returnDocument = false) {
  const MyPDFDocument = (
    <PDFDocument>
      <Page style={styles.page}>
        <Text style={styles.header}>
          ANEXO 2 - FORMULARIO PARA EL PAGO DE SUBVENCIONES PARA LA DIFUSIÓN DE
          ARTÍCULOS CIENTÍFICOS ACEPTADOS EN REVISTAS DE ALTO IMPACTO
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

        {/*2. DATOS DE LA PUBLICACIÓN  */}

        <Text style={styles.sectionTitle}>2. DATOS DE LA PUBLICACIÓN</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>
                Título de la publicación:
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>
                {data.tituloPublicacion}
              </Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>Nombre de la Revista:</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>{data.nombreRevista}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>
                Autores de la EPN: (Titulares, Ocasionales, otros){" "}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>{data.autoresEPN}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>Autores externos:</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>
                {data.autoresExternos}
              </Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>
                Base de datos de indexación:
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>{data.baseDatos}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>
                Cuartil de la publicación:{" "}
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>
                {data.cuartilPublicacion}
              </Text>
            </View>
          </View>
        </View>

        <View>
          <Text style={styles.sectionTitle}>
            3. DETALLE DE LA FORMA DE PAGO DE PUBLICACIÓN{" "}
          </Text>

          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableCol15}>
                <Text style={styles.tableCellText}>
                  Valor de la publicación:
                </Text>
              </View>
              <View style={styles.tableCol}>
                {data.publicaciones.map((publicaciones, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCellTextBlueCenter}>
                      {publicaciones.monedaPago
                        ? publicaciones.monedaPago +
                          " " +
                          (publicaciones.valorPublicacion || " ")
                        : ""}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={styles.tableCol15}>
                <Text style={styles.tableCellText}>
                  Fecha máxima de pago de la publicación:
                </Text>
              </View>
              <View style={styles.tableCol}>
                {data.publicaciones.map((publicaciones, index) => (
                  <View key={index} style={styles.tableRow}>
                    <Text style={styles.tableCellTextBlueCenter}>
                      {data.publicaciones.map((publicaciones, index) => (
                        <View key={index} style={styles.tableRow}>
                          <Text style={styles.tableCellTextBlueCenter}>
                            {publicaciones.limiteFecha
                              ? publicaciones.limiteFecha || " "
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
                      - Transferencia:
                      <Text style={styles.baseText}>
                        {"( "}
                        <Text style={styles.tableCellTextBlue}>
                          {data.metodoPago === "Transferencia" ? "X" : ""}
                          <Text style={styles.baseText}>{" )"}</Text>
                        </Text>
                      </Text>
                    </Text>
                    <Text style={styles.baseText}>
                      Adjuntar los siguientes documentos:
                    </Text>
                    <Text style={styles.baseText}>
                      a)Formulario de registro de cuenta o formulario de giro al
                      exterior (según corresponda)
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
                      a)Solicitud de REEMBOLSO.
                    </Text>
                    <Text style={styles.baseText}>
                      b)Factura del solicitante a nombre de la Unidad de Gestión
                      de Investigación y Proyección Social, adjuntando el
                      respaldo de la transacción. *
                    </Text>
                    <Text style={styles.baseText}>
                      *La Factura se entregará una vez que el investigador(a)
                      solicite el pago de reembolso.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Etiqueta de Firma */}
        <Text style={styles.baseText}>Firma del solicitante: </Text>

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
          {`${data.departamento || "Departamento de prueba"}`}
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
  saveAs(blob, `Anexo 2 - Formulario Pago Publicación Fuera de Proyecto.pdf`);
}

//Documentos de Servicios Insitucionales
export async function generateAnexo4InstitutionalServices(data) {
  
  const ultimaFechaLlegada =
    data.transporteRegreso.length > 0
      ? data.transporteRegreso[data.transporteRegreso.length - 1]?.fechaLlegada
      : "";
  const ultimaHoraLlegada =
    data.transporteRegreso.length > 0 ? data.transporteRegreso[data.transporteRegreso.length - 1]?.horaLlegada : "";



  const MyPDFDocument = (
    <PDFDocument>
      <Page style={styles.page}>
        <Text style={styles.header}>Anexo 4 - Formato informe de viáticos EPN</Text>

        <Text style={styles.sectionTitle}>INFORME DE SERVICIOS INSTITUCIONALES</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol50}>
              <Text style={styles.tableCellText}>Nro. SOLICITUD DE AUTORIZACIÓN PARA CUMPLIMIENTO DE SERVICIOS INSTITUCIONALES: </Text>
            </View>
            <View style={styles.tableCol50}>
              <Text style={styles.tableCellText}>FECHA DE INFORME  (dd-mmm-aaaa): </Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol50}>
              <Text style={styles.tableCellText}> </Text>
            </View>
            <View style={styles.tableCol50}>
            <Text style={styles.tableCellTextBlue}>
                {formattedDate}
              </Text>
            </View>
          </View>
        </View>
      
        <Text style={styles.sectionTitle}>DATOS GENERALES</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol50}>
              <Text style={styles.tableCellText}>APELLIDOS - NOMBRES DE LA O EL SERVIDOR: </Text>
            </View>
            <View style={styles.tableCol50}>
              <Text style={styles.tableCellText}>PUESTO QUE OCUPA: </Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol50}>
              <Text style={styles.tableCellTextBlue}> {data.nombres.toUpperCase()+ " "+ data.apellidos.toUpperCase()} </Text>
            </View>
            <View style={styles.tableCol50}>
            <Text style={styles.tableCellTextBlue}>
                {data.puesto}
              </Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol50}>
              <Text style={styles.tableCellText}>CIUDAD – PROVINCIA DEL SERVICIO INSTITUCIONAL: </Text>
            </View>
            <View style={styles.tableCol50}>
              <Text style={styles.tableCellText}>NOMBRE DE LA UNIDAD A LA QUE PERTENECE LA O EL SERVIDOR: </Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol50}>
              <Text style={styles.tableCellTextBlue}> {data.ciudadServicio+","+data.provinciaServicio}</Text>
            </View>
            <View style={styles.tableCol50}>
            <Text style={styles.tableCellTextBlue}>
                {data.nombreUnidad}
              </Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableCellText}>SERVIDORES QUE INTEGRAN EL SERVICIO INSTITUCIONAL:</Text>
          </View>

          <View style={styles.tableRow}>
            <Text style={styles.tableCellTextBlue}>
                {data.servidores}
              </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>
        INFORME DE ACTIVIDADES Y PRODUCTOS ALCANZADOS
        </Text>

        <View style={styles.table}>

          <View style={styles.tableRow}>
            <View style={styles.tableCol20}>
                <Text style={styles.tableCellText}>Actividades:</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>{data.actividades}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol20}>
                <Text style={styles.tableCellText}>Productos Alcanzados:</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>{data.productos}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol20}>
                <Text style={styles.tableCellText}>Otras tareas realizadas para la EPN durante la comisión de servicios:</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>{data.otrasTareas}</Text>
            </View>
          </View>

          <View style={styles.tableRow}>
            <View style={styles.tableCol50}>
              <View style={styles.tableRow}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCellText}>ITINERARIO</Text>
               </View>
               <View style={styles.tableCol}>
                  <Text style={styles.tableCellText}>SALIDA</Text>
               </View>
               <View style={styles.tableCol}>
                  <Text style={styles.tableCellText}>LLEGADA</Text>
               </View>
              </View>
              <View style={styles.tableRow}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCellText}>FECHA (dd-mmm-aaa)</Text>
               </View>
               <View style={styles.tableCol}>
                  <Text style={styles.tableCellTextBlue}>{formatDate(data.transporteIda[0]?.fechaSalida)}</Text>
               </View>
               <View style={styles.tableCol}>
                  <Text style={styles.tableCellTextBlue}>{formatDate(ultimaFechaLlegada)}</Text>
               </View>
              </View>
              <View style={styles.tableRow}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCellText}>HORA (hh:mm)</Text>
               </View>
               <View style={styles.tableCol}>
                  <Text style={styles.tableCellTextBlue}>{data.transporteIda[0]?.horaSalida}</Text>
               </View>
               <View style={styles.tableCol}>
                  <Text style={styles.tableCellTextBlue}>{ultimaHoraLlegada}</Text>
               </View>
              </View>
            </View>
            <View style={styles.tableCol50}>
              <Text style={styles.tableCellText}>NOTA: Estos datos se refieren al tiempo efectivamente utilizado en el cumplimiento del servicio institucional, desde la salida del lugar de residencia o trabajo habituales o del cumplimiento del servicio institucional según sea el caso, hasta su llegada de estos sitios.</Text>
            </View>
          </View>

        </View>

        <Text style={styles.sectionTitle}>
        TRANSPORTE
        </Text>

        <View style={styles.table}>

        <View style={styles.tableRow}>
                <View style={styles.tableCol20}>
                  <Text style={styles.tableCellText}>
                  TIPO DE TRANSPORTE (Aéreo, terrestre, marítimo,  otros): 
                  </Text>
                </View>

                <View style={styles.tableCol15}>
                <Text style={styles.tableCellText}>
                NOMBRE DE TRANSPORTE 
                </Text>
              </View>

                <View style={styles.tableCol15}>
                  <Text style={styles.tableCellText}>
                  RUTA: 
                  </Text>
                </View>

                    <View style={styles.tableCol}>
                  
                      <Text style={styles.tableCellText}>
                      SALIDA:  
                     </Text>
                     
                    <View style={styles.tableRow}>
                      <View style={styles.tableCol50}>
                      <Text style={styles.tableCellText}>FECHA (dd - mmm - aaaa)</Text>                
                      </View>
                      <View style={styles.tableCol50}>
                      <Text style={styles.tableCellText}>HORA (hh : mm)</Text>
                      </View>
                    </View>
                    </View>

                    <View style={styles.tableCol}>
                    <Text style={styles.tableCellText}>
                    REGRESO:  
                    </Text>
                    <View style={styles.tableRow}>
                      <View style={styles.tableCol50}>
                      <Text style={styles.tableCellText}>FECHA (dd - mmm - aaaa)</Text>                
                      </View>
                      <View style={styles.tableCol50}>
                      <Text style={styles.tableCellText}>HORA (hh : mm)</Text>
                      </View>
                    </View>
                    </View>
                    </View>

                    

                    <View style={styles.tableRow}>
                      
                    <View style={styles.tableCol20}>
                      {data.transporteIda.map((transporteIda, index) => (
                     <View key={index} style={styles.tableRow}>
                        <Text style={styles.tableCellTextBlueCenter}>
                         {transporteIda.tipoTransporte
                        ? transporteIda.tipoTransporte: ""}
                        </Text>
                      </View>
                       ))}
                     </View>
                    <View style={styles.tableCol15}>
                      {data.transporteIda.map((transporteIda, index) => (
                     <View key={index} style={styles.tableRow}>
                        <Text style={styles.tableCellTextBlueCenter}>
                        {transporteIda.nombreTransporte
                       ? transporteIda.nombreTransporte: ""}
                     </Text>
                   </View>
                    ))}
                    </View>
                      <View style={styles.tableCol15}>
                        {data.transporteIda.map((transporteIda, index) => (
                          <View key={index} style={styles.tableRow}>
                            <Text style={styles.tableCellTextBlueCenter}>
                              {transporteIda.ruta
                                ? transporteIda.ruta: ""}
                            </Text>
                          </View>
                        ))}
                      </View>

                        <View style={styles.tableCol}>
                              {data.transporteIda.map((transporteIda, index) => (
                          <View key={index} style={styles.tableRow}>
                            <Text style={styles.tableCellTextBlueCenter}>
                              {transporteIda.fechaSalida
                                ? formatDate(transporteIda.fechaSalida): ""}
                            </Text>
                          </View>
                          ))}
                          </View>
                          <View style={styles.tableCol}>
                              {data.transporteIda.map((transporteIda, index) => (
                          <View key={index} style={styles.tableRow}>
                            <Text style={styles.tableCellTextBlueCenter}>
                              {transporteIda.horaSalida
                                ? transporteIda.horaSalida: ""}
                            </Text>
                          </View>
                          ))}
                        </View>

                        <View style={styles.tableCol}>
                              {data.transporteIda.map((transporteIda, index) => (
                          <View key={index} style={styles.tableRow}>
                            <Text style={styles.tableCellTextBlueCenter}>
                              {transporteIda.fechaLlegada
                                ? formatDate(transporteIda.fechaLlegada): ""}
                            </Text>
                          </View>
                          ))}
                              </View>

                            <View style={styles.tableCol}>
                            {data.transporteIda.map((transporteIda, index) => (
                        <View key={index} style={styles.tableRow}>
                          <Text style={styles.tableCellTextBlueCenter}>
                            {transporteIda.horaLlegada
                              ? transporteIda.horaLlegada: ""}
                          </Text>
                        </View>
                        ))}
                            </View>
                  
              
                   </View>

                   <View style={styles.tableRow}>
                    <View style={styles.tableCol20}>
                      {data.transporteRegreso.map((transporteRegreso, index) => (
                     <View key={index} style={styles.tableRow}>
                        <Text style={styles.tableCellTextBlueCenter}>
                         {transporteRegreso.tipoTransporte
                        ? transporteRegreso.tipoTransporte: ""}
                        </Text>
                      </View>
                       ))}
                     </View>
                    <View style={styles.tableCol15}>
                      {data.transporteRegreso.map((transporteRegreso, index) => (
                     <View key={index} style={styles.tableRow}>
                        <Text style={styles.tableCellTextBlueCenter}>
                        {transporteRegreso.nombreTransporte
                       ? transporteRegreso.nombreTransporte: ""}
                     </Text>
                   </View>
                    ))}
                    </View>
                      <View style={styles.tableCol15}>
                        {data.transporteRegreso.map((transporteRegreso, index) => (
                          <View key={index} style={styles.tableRow}>
                            <Text style={styles.tableCellTextBlueCenter}>
                              {transporteRegreso.ruta
                                ? transporteRegreso.ruta: ""}
                            </Text>
                          </View>
                        ))}
                      </View>

                        <View style={styles.tableCol}>
                              {data.transporteRegreso.map((transporteRegreso, index) => (
                          <View key={index} style={styles.tableRow}>
                            <Text style={styles.tableCellTextBlueCenter}>
                              {transporteRegreso.fechaSalida
                                ? formatDate(transporteRegreso.fechaSalida): ""}
                            </Text>
                          </View>
                          ))}
                          </View>
                          <View style={styles.tableCol}>
                              {data.transporteRegreso.map((transporteRegreso, index) => (
                          <View key={index} style={styles.tableRow}>
                            <Text style={styles.tableCellTextBlueCenter}>
                              {transporteRegreso.horaSalida
                                ? transporteRegreso.horaSalida: ""}
                            </Text>
                          </View>
                          ))}
                        </View>

                        <View style={styles.tableCol}>
                              {data.transporteRegreso.map((transporteRegreso, index) => (
                          <View key={index} style={styles.tableRow}>
                            <Text style={styles.tableCellTextBlueCenter}>
                              {transporteRegreso.fechaLlegada
                                ? formatDate(transporteRegreso.fechaLlegada): ""}
                            </Text>
                          </View>
                          ))}
                              </View>

                            <View style={styles.tableCol}>
                            {data.transporteRegreso.map((transporteRegreso, index) => (
                        <View key={index} style={styles.tableRow}>
                          <Text style={styles.tableCellTextBlueCenter}>
                            {transporteRegreso.horaLlegada
                              ? transporteRegreso.horaLlegada: ""}
                          </Text>
                        </View>
                        ))}
                            </View>
                  
              
                   </View>

            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableCellText}> NOTA: En caso de haber utilizado transporte público, se deberá adjuntar obligatoriamente los pases a bordo o boletos</Text>
            </View>
              
                
     

        <Text style={styles.sectionTitle}>OBSERVACIONES</Text>
       

        <View style={styles.table}>

          <View style={styles.tableRow}>
            <View style={styles.tableCol50}>
                  <View style={styles.tableRow}>
                     <Text style={styles.tableCellTextCenter}>FIRMA DE LA O EL SERVIDOR COMISIONADO:</Text>
                  </View>
                  <View style={styles.tableRow}>
                     <Text style={styles.tableCellTextCenter}> ________________________________ </Text>
                  </View>
            
              <View style={styles.tableRow}>
                  <Text style={styles.tableCellTextBlue}>{data.nombres.toUpperCase()+ " "+ data.apellidos.toUpperCase()} </Text>
              </View>
                 <View style={styles.tableRow}>
                      <Text style={styles.tableCellTextBlue}>{data.puesto.toUpperCase()} </Text>
                 </View>
                 <View style={styles.tableRow}>
                      <Text style={styles.tableCellTextBlue}>{data.cedula} </Text>
                 </View>
              </View>
              <View style={styles.tableCol}>
            <Text style={styles.tableCellText}>NOTA: El presente informe deberá presentarse dentro del término de 4 días del cumplimiento de servicios institucionales, caso contrario la liquidación se demorará e incluso de no presentarlo tendría que restituir los valores percibidos. Cuando el cumplimiento de servicios institucionales sea superior al número de días autorizados, se deberá adjuntar la autorización por escrito de la Máxima Autoridad o su Delegado</Text>
          </View>
          </View>
          

        </View>


        <Text style={styles.sectionTitle}>FIRMAS DE APROBACIÓN</Text>
       
       
        <View style={styles.table}>

          <View style={styles.tableRow}>
            <View style={styles.tableCol50}>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCellText}>FIRMA DEL JEFE INMEDIATO:</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCellTextCenter}> ________________________________ </Text>
                 </View>
            
             <View style={styles.tableRow}>
                  <Text style={styles.tableCellTextBlueCenter}>{data.nombreJefeInmediato.toUpperCase()+""} </Text>
                  </View>
                 <View style={styles.tableRow}>
                 <Text style={styles.tableCellTextBlueCenter}>{data.cargoJefeInmediato.toUpperCase()} </Text>
                  </View>
            </View>
          
          <View style={styles.tableCol}>
           
          <View style={styles.tableRow}>
                  <Text style={styles.tableCellText}>FIRMA DE LA MAXIMA AUTORIDAD DE INVESTIGACIÓN:</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableCellTextCenter}>________________________________</Text>
                 </View>
            
            <View style={styles.tableRow}>
                  <Text style={styles.tableCellTextCenter}>PhD. Alexandra Alvarado </Text>
                  </View>
                 <View style={styles.tableRow}>
                 <Text style={styles.tableCellTextCenter}>Vicerrectora de Investigación, Innovación y Vinculación</Text>
                   </View>
                   </View>
           
           </View>
           </View>
      
      </Page>
    </PDFDocument>
  );
  // Convertir el documento PDF a un Blob
  const blob = await pdf(MyPDFDocument).toBlob();

  // Descargar automáticamente el archivo PDF
  saveAs(blob, `Anexo 4 - Servicios Institucionales.pdf`);

}


export function generateMemoInstitutionalServices(data) {
  
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: "Formato de memorando de servicios institucionales",
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
                text: "\t\tVicerector de Investigación, Innovación y Vinculación",
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
                text: " Informe de servicios ",
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
                text: `Por medio del presente se hace entrega del informe de servicios institucionales por la participación en el evento " ${data.tituloEvento} " a realizarse en ${data.ciudadServicio}, ${data.provinciaServicio}, del ${data.fechaInicioEvento} al ${data.fechaFinEvento}. `,
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
                  data.nombreJefeInmediato.toUpperCase(),
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
                text: data.cargoJefeInmediato,
                size: 20,
                font: "Times New Roman",
              }),
            ],
          }),
        ],
      },
    ],
  });

  Packer.toBlob(doc).then((blob) => {
    saveAs(blob, "Memorando de servicios institucionales.docx");
  });
}

//Pagos al exterior
export async function generateAnexo6(data, returnDocument = false) {
  const template = {
    schemas: schemasAnexoA6,
    basePdf: basePdfAnexo6,
  };
  const plugins = { text, image, qrcode: barcodes.qrcode };
  const inputs = [
    {
      moneda: data.moneda,
      nombreBeneficiario: data.nombreBeneficiario,
      direccion: data.direccionBeneficiario,
      pais: data.paisBeneficiario,
      ciudad: data.ciudadBeneficiario,
      nombreBanco: data.nombreBanco,
      codigoBanco: data.codigoSwift,
      numeroCuenta: data.numeroCuenta,
      paisBanco: data.paisBanco,
      ciudadBanco: data.ciudadBanco,
      nombreBancoIntermediario: data.nombreBancoIntermediario,
      codigoBancoIntermediario: data.codigoSwiftIntermediario,
      paisBancoIntermediario: data.paisBancoIntermediario,
      ciudadBancoIntermediario: data.ciudadBancoIntermediario,
      firmaNombre: `${data.nombresSolcitante.toUpperCase()} ${data.apellidoSolicitante.toUpperCase()}`,
      firmaCorreo: data.correoElectronico,
    },
];
const pdf = await generate({ template, plugins, inputs });
  const blob = new Blob([pdf.buffer], { type: "application/pdf" });
  if (returnDocument) {
    return blob;
  } 

  saveAs(
    blob,
    "Anexo 6 - Pagos al exterior.pdf"
  );
  
}