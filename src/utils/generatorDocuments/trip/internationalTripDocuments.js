import { Font, Page, Text, View, Document as PDFDocument, pdf } from "@react-pdf/renderer";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { text, image, barcodes } from "@pdfme/schemas";
import { generate } from "@pdfme/generator";
import { saveAs } from "file-saver";
import styles from "../../stylesPdf";
import { capitalizeWords, formatDate } from "../../validaciones";
//basepdf and schemas AnexoA
import { basePdfAnexoA } from "../../basePdfAnexoA";
import { schemasAnexoA } from "../../schemasAnexoA";
Font.register({
  family: "Roboto",
  src: "https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu72xKOzY.woff2",
  fontWeight: 900,
});
const today = new Date();
const formattedDate = formatDate(today);


//Documentos para viajes tecnicos internacionales dentro de proyectos
export async function generateAnexoATripWithingProject( data, returnDocument = false) {
  const template = {
    schemas: schemasAnexoA,
    basePdf: basePdfAnexoA,
  };

  // Fusionar los arrays transporteIda y transporteRegreso en un solo array llamado transporte
  const transporte = data.transporteIda.concat(data.transporteRegreso);

  const ultimaFechaLlegada =
    transporte.length > 0
      ? transporte[transporte.length - 1]?.fechaLlegada
      : "";
  const ultimaHoraLlegada =
    transporte.length > 0 ? transporte[transporte.length - 1]?.horaLlegada : "";

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
        ". " +
        data.servidores.toUpperCase(),

      actividades:
        "Dentro de las actividades del proyecto  " +
        data.codigoProyecto +
        " titulado  '" +
        data.tituloProyecto +
        "'  se llevará a cabo un viaje técnico a cargo de la intitucion de acogida '" +
        data.nombreIntitucionAcogida +
        "', que tendrá lugar del  " +
        data.fechaInicioEvento +
        "  al  " +
        data.fechaFinEvento +
        " en la ciudad de  " +
        data.ciudadEvento +
        ", " +
        data.paisEvento +
        ". ",

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

export function generateMemoTrip(data, returnDocument = false) {
    const nombresApellidos = capitalizeWords(
      (data.nombres + " " + data.apellidos).toLowerCase()
    );
    
    let rolTexto = "";
    if (data.rolEnProyecto === "Director") {
      rolTexto = `En mi calidad de Director del Proyecto ${data.codigoProyecto}, autorizo el gasto y solicito a usted se realicen las gestiones correspondientes para realizar un viaje técnico "${data.nombreIntitucionAcogida}" a realizarse en ${data.ciudadEvento}, ${data.paisEvento}, desde ${data.fechaInicioEvento} hasta ${data.fechaFinEvento}.`;
    } else {
      rolTexto = `En mi calidad de Director del Proyecto ${data.codigoProyecto}, autorizo el gasto y solicito a usted se realicen las gestiones correspondientes para que el Sr./Sra. "${nombresApellidos}", ${data.rolEnProyecto} del proyecto, pueda realizar un viaje técnico a "${data.nombreIntitucionAcogida}", a realizarse en ${data.ciudadEvento}, ${data.paisEvento}, desde ${data.fechaInicioEvento} hasta ${data.fechaFinEvento}.`;
    }
  
    let solicitudOracion = "Para lo cual solicito ";
    if (data.pasajesAereos === "SI" && data.viaticosSubsistencias === "SI") {
      solicitudOracion +=
        "se realice la compra de pasajes aéreos y asignación de viáticos y subsistencias.";
    } else if (data.pasajesAereos === "SI") {
      solicitudOracion += "se realice la compra de pasajes aéreos.";
    } else if (data.viaticosSubsistencias === "SI") {
      solicitudOracion += "la asignación de viáticos y subsistencias.";
    } else {
      solicitudOracion = ""; // No se solicita nada, por lo que la oración queda vacía.
    }
  
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: "Formato de memorando VIAJE TECNICO DENTRO DE PROYECTO",
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
                  text: `Solicitud para viaje técnico/${data.codigoProyecto}`,
                  size: 22,
                  font: "Aptos (Cuerpo)",
                }),
              ],
              spacing: { after: 200 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: rolTexto + " " + solicitudOracion,
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
                  text: data.nombreDirector
                    ? data.nombreDirector.toUpperCase()
                    : nombresApellidos.toUpperCase(),
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
        "Memorando solicitud para viaje técnico " + data.codigoProyecto + ".docx"
      );
    });
  }
  

export async function generateAnexoB2WithinProject(data, returnDocument = false) {
  const MyPDFDocument = (
    <PDFDocument>
      <Page style={styles.page}>
        {/* Título del formulario */}
        <Text style={styles.header}>
          Anexo 2B - FORMULARIO PARA SALIDAS AL EXTERIOR DENTRO DE PROYECTOS
          VIAJES TÉCNICOS
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
              <Text style={styles.tableCellText}>
                Nombre de la institución de acogida:
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>
                {data.nombreIntitucionAcogida || "_________"}
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
                {data.ciudadEvento.toUpperCase() || "_________"}
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>
                Fechas del viaje técnico:
              </Text>
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
              <Text style={styles.tableCellText}>
                Solicita para el viaje técnico:
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
            </View>
          </View>
        </View>

        {/* 1. Datos De la Salida de Campo*/}

        <Text style={styles.sectionTitle}>
          3. JUSTIFICACIÓN DEL VIAJE TÉCNICO{" "}
        </Text>

        <Text style={styles.baseText}>
          3.1 Objetivo, resultado o producto del proyecto al que aporta el viaje
          técnico.
        </Text>
        <Text style={styles.textBlue}>{data.objetivoProyecto}</Text>
        <Text style={styles.baseText}>
          3.2 Relevancia del viaje técnico para el desarrollo del proyecto.
        </Text>
        <Text style={styles.textBlue}>{data.relevanciaViajeTecnico}</Text>
        <Text style={styles.sectionTitle}>
          4. CRONOGRAMA DE ACTIVIDADES A REALIZAR EN EL VIAJE TÉCNICO{" "}
        </Text>

        <Text style={styles.baseText}>4.1 Cronograma</Text>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol15}>
              <Text style={styles.tableCellTextCenter}>N°</Text>
            </View>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellTextCenter}>Fecha</Text>
            </View>
            <View style={styles.tableColAuto}>
              <Text style={styles.tableCellTextCenter}>
                Descripcion de la actividad a realizar
              </Text>
            </View>
          </View>
          {data.actividadesInmutables.map((actividad, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableCol15}>
                <Text style={styles.tableCellTextBlueCenter}>
                  {(index + 1).toString()}
                </Text>
              </View>
              <View style={styles.tableCol25}>
                <Text style={styles.tableCellTextBlueCenter}>
                  {actividad.fecha}
                </Text>
              </View>
              <View style={styles.tableColAuto}>
                <Text style={styles.tableCellTextBlue}>
                  {actividad.descripcion}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.baseText}>
          4.2 Justificar la necesidad de la comisión de servicios mayor a 15
          días{" "}
        </Text>
        <Text style={styles.textBlue}>
          {data.justificacionComision || "No Aplica"}
        </Text>

        <Text style={styles.sectionTitle}>
          5. CALCULO REFERENCIAL DE DÍAS DE LA COMISIÓN DE SERVICIOS{" "}
        </Text>
        <Text style={styles.textBlue}>
          {"Calculo dias de comision entre las fechas de salida y de regreso al pais: " +
            data.actividadesInmutables.length}
        </Text>

        {/* Etiqueta de Firma */}
        <Text style={styles.baseText}>Firma del Solicitante:</Text>

        {/* Espacio en blanco para la firma */}
        <Text>{"\n\n\n"}</Text>

        {/* Nombre completo */}
        <Text style={styles.baseText}>________________________</Text>

        {/* Nombre completo */}
        <Text style={styles.tableCellTextBlue}>
          {`${
            data.rolEnProyecto === "Director"
              ? data.nombres + " " + data.apellidos
              : data.nombreDirector
          }`}
        </Text>

        {/* Nombre del director y código de proyecto */}
        <Text style={styles.tableCellTextBlue}>
          {`${"Director del Proyecto " + data.codigoProyecto}`}
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
  saveAs(blob, "Anexo2B_Formulario para viajes tecnicos.pdf");
}
