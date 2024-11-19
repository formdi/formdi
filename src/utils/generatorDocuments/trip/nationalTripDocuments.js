import {
  Font,
  Page,
  Text,
  View,
  Document as PDFDocument,
  pdf,
} from "@react-pdf/renderer";
import JSZip from "jszip";
import { Document, Packer, Paragraph, TextRun,Table, TableRow, TableCell } from "docx";
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

export function generateMemoSamplingTripWithinProject(
  data,
  returnDocument = false
) {
  // Crear un texto de solicitud en función de los campos pasajesAereos, viaticosSubsistencias e inscripción
  let solicitudOracion = "Para lo cual solicito ";

  let solicitudes = [];
  if (data.pasajesAereos === "SI") {
    solicitudes.push("la compra de pasajes aéreos");
  }
  if (data.viaticosSubsistencias === "SI") {
    solicitudes.push("la asignación de viáticos y subsistencias");
  }

  if (solicitudes.length > 0) {
    solicitudOracion += solicitudes.join(" y ") + ".";
  } else {
    solicitudOracion = "";
  }
  // Filtra las personas que tienen viáticos
  const participantesConViaticos = data.participante.filter((p) => p.viaticos);

  // Generar el cuerpo del memorando
  const cuerpoMemorando = `En mi calidad de Director del Proyecto ${data.codigoProyecto}, solicito se realicen los trámites pertinentes para la salida de campo y de muestreo, a realizarse del ${data.fechaInicioViaje} al ${data.fechaFinViaje} en la ciudad de ${data.ciudad}. ${solicitudOracion}`;

  // Crear el documento .docx
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Título del memorando
          new Paragraph({
            children: [
              new TextRun({
                text: "MEMORANDO - SALIDA DE CAMPO Y DE MUESTREO",
                bold: true,
                size: 24,
                font: "Aptos (Cuerpo)",
              }),
            ],
            spacing: { after: 300 },
            alignment: "center",
          }),

          // "PARA:" sección
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

          // Asunto del memorando
          new Paragraph({
            children: [
              new TextRun({
                text: "ASUNTO:\t",
                bold: true,
                size: 22,
                font: "Aptos (Cuerpo)",
              }),
              new TextRun({
                text: `Autorización de gasto y solicitud para salida de campo y de muestreo/${data.codigoProyecto}`,
                size: 22,
                font: "Aptos (Cuerpo)",
              }),
            ],
            spacing: { after: 200 },
          }),

          // Cuerpo del memorando
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
          // Condicional para incluir la sección de viáticos si hay personas con viáticos
          ...(participantesConViaticos.length > 0
            ? [
                // Texto antes de la tabla
                new Paragraph({
                  children: [
                    new TextRun({
                      text: "Se solicita viáticos para las personas:",
                      size: 20,
                      font: "Times New Roman",
                    }),
                  ],
                  spacing: { after: 200 },
                }),

                // Encabezado de la tabla usando filas y celdas
                new Table({
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: "Nombre",
                                  bold: true,
                                  size: 20,
                                  font: "Times New Roman",
                                }),
                              ],
                            }),
                          ],
                        }),
                        new TableCell({
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: "Rol",
                                  bold: true,
                                  size: 20,
                                  font: "Times New Roman",
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),

                    // Filtrar y mapear los participantes para crear las filas de la tabla
                    ...participantesConViaticos.map(
                      (p) =>
                        new TableRow({
                          children: [
                            new TableCell({
                              children: [
                                new Paragraph({
                                  children: [
                                    new TextRun({
                                      text: p.nombre,
                                      size: 20,
                                      font: "Times New Roman",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            new TableCell({
                              children: [
                                new Paragraph({
                                  children: [
                                    new TextRun({
                                      text: p.rol,
                                      size: 20,
                                      font: "Times New Roman",
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        })
                    ),
                  ],
                }),
              ]
            : []),
          // Despedida
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

          // Firma
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

          // Nombre del director del proyecto
          new Paragraph({
            children: [
              new TextRun({
                text: data.nombreDirector.toUpperCase(),
                size: 20,
                bold: true,
                font: "Times New Roman",
              }),
            ],
            spacing: { after: 100 },
          }),

          // Cargo del firmante
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

  // Guardar el archivo como .docx
  Packer.toBlob(doc).then((blob) => {
    saveAs(
      blob,
      `Memorando solicitud salida de campo ${data.codigoProyecto}.docx`
    );
  });
}

export async function generateAnexo7WithinProject(
  data,
  returnDocument = false
) {
  const MyPDFDocument = (
    <PDFDocument>
      <Page style={styles.page}>
        {/* Título del formulario */}
        <Text style={styles.header}>
          Anexo 7 – Formulario para salidas de campo y de muestreo y/o viajes
          técnicos dentro de proyectos
        </Text>

        {/* 1. Datos Generales */}
        <View style={styles.sectionTitle}>
          <Text>
            1. DATOS GENERALES PARA LA SALIDA DE CAMPO, DE MUESTREO Y/O VIAJE
            TÉCNICO
          </Text>
        </View>
        <View style={styles.subSectionTitle}>
          <Text>Complete según corresponda la siguiente información</Text>
        </View>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>Código del Proyecto:</Text>
            </View>
            <View style={styles.tableColAuto}>
              <Text style={styles.tableCellTextBlue}>
                {data.codigoProyecto || "_________"}
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>Título de Proyecto:</Text>
            </View>
            <View style={styles.tableColAuto}>
              <Text style={styles.tableCellTextBlue}>
                {data.tituloProyecto || "_________"}
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
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

          {/* Fila de encabezado (títulos) */}
          <View style={styles.tableRow}>
            <View style={styles.tableCol50}>
              <Text style={styles.tableCellText}>Personal a trasladarse:</Text>
            </View>
            <View style={styles.tableCol50}>
              <Text style={styles.tableCellText}>Rol en el Proyecto:</Text>
            </View>
          </View>

          {/* Filas dinámicas generadas con map */}
          {data.participante.map((person, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableCol50}>
                <Text style={styles.tableCellTextBlueCenter}>
                  {person.nombre || "_________"}
                </Text>
              </View>
              <View style={styles.tableCol50}>
                <Text style={styles.tableCellTextBlueCenter}>
                  {person.rol || "_________"}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* 2. Datos De la Salida de Campo */}
        <View style={styles.sectionTitle}>
          <Text>2. DATOS DE LA SALIDA DE CAMPO Y DE MUESTREO</Text>
        </View>
        <View style={styles.subSectionTitle}>
          <Text>Complete según corresponda la siguiente información</Text>
        </View>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>
                Lugar de la movilización:
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCellTextBlue}>
                {data.ciudad || "_________"}
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>Fecha de movilización:</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.baseText}>
                {"Inicio: "}
                <Text style={styles.tableCellTextBlue}>
                  {data.fechaInicioViaje || "_________"}
                </Text>
              </Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.baseText}>
                {"Fin: "}
                <Text style={styles.tableCellTextBlue}>
                  {data.fechaFinViaje || "_________"}
                </Text>
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>Solicita:</Text>
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

        {/* 3. Actividades */}
        <View style={styles.sectionTitle}>
          <Text>
            3. ACTIVIDADES DE LA SALIDA DE CAMPO, DE MUESTREO Y/O VIAJE TÉCNICO
          </Text>
        </View>
        <View style={styles.subSectionTitle}>
          <Text>Complete según corresponda la siguiente información</Text>
        </View>

        {/* Encabezado de la tabla de actividades */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol25}>
              <Text style={styles.tableCellText}>Fecha:</Text>
            </View>
            <View style={styles.tableCol75}>
              <Text style={styles.tableCellText}>Actividad:</Text>
            </View>
          </View>

          {/* Filas dinámicas de la tabla de actividades */}
          {data.actividadesInmutables.map((activity, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableCol25}>
                <Text style={styles.tableCellTextBlue}>
                  {activity.fecha || "_________"}
                </Text>
              </View>
              <View style={styles.tableCol75}>
                <Text style={styles.tableCellTextBlue}>
                  {activity.descripcion || "_________"}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* 4. Objetivo del Proyecto */}
        <View style={styles.sectionTitle}>
          <Text>4. PRODUCTOS DE LA SALIDA DE CAMPO Y DE MUESTREO</Text>
        </View>
        <View style={styles.subSectionTitle}>
          <Text>Complete según corresponda la siguiente información</Text>
        </View>

        <Text style={styles.tableCellTextBlue}>
          {data.objetivoViaje || "_________"}
        </Text>

        {/* Firma del Solicitante */}
        <Text style={styles.baseText}>Firma del Solicitante:</Text>
        <Text>{"\n\n\n"}</Text>
        <Text>________________________</Text>
        <Text style={styles.tableCellTextBlue}>
          {data.nombreDirector || "_________"}
        </Text>

        {/* Firma del Director */}
        <Text style={styles.tableCellTextBlue}>
          Director del Proyecto {data.codigoProyecto || "_________"}
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
  saveAs(blob, "Anexo7_Formulario_Salida_Campo.pdf");
}

export async function NationalSamplingTrips(data, returnDocument = false) {
  const template = {
    schemas: schemasAnexoANational,
    basePdf: basePdfAnexoANational,
  };

  const transporte = data.transporteIda.concat(data.transporteRegreso);
  const ultimaFechaLlegada =
    transporte.length > 0
      ? transporte[transporte.length - 1]?.fechaLlegada
      : "";
  const ultimaHoraLlegada =
    transporte.length > 0 ? transporte[transporte.length - 1]?.horaLlegada : "";

  let servidoresText = "";
  for (const participante of data.participante) {
    if (servidoresText) {
      servidoresText += ", ";
    }
    servidoresText += participante.nombre.toUpperCase();
  }

  const plugins = { text, image, qrcode: barcodes.qrcode };

  const zip = new JSZip();

  for (const participante of data.participante) {
    const transporteInfo = {};
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
        viaticos: participante.viaticos ? "X" : "",
        movilizacion: participante.viaticos ? "X" : "",
        subsistencias: participante.viaticos ? "X" : "",
        alimentacion: participante.viaticos ? "X" : "",

        nombresCompletos: participante.nombre.toUpperCase(),
        lugar: data.ciudad + ", Ecuador",
        puesto: participante.cargo,
        unidadPerteneciente: participante.departamento,

        fechaSalida: formatDate(data.transporteIda[0]?.fechaSalida),
        horaSalida: data.transporteIda[0]?.horaSalida,

        fechaLlegada: formatDate(ultimaFechaLlegada),
        horaLlegada: ultimaHoraLlegada,

        servidores:
            servidoresText.toUpperCase(),

        actividades:
          "Dentro de las actividades del proyecto  " +
          data.codigoProyecto +
          " titulado  ``" +
          data.tituloProyecto +
          "``, que tendrá lugar del  " +
          data.fechaInicioViaje +
          "  al  " +
          data.fechaFinViaje +
          " en la ciudad de  " +
          data.ciudad +
          ", Ecuador. ",

        ...transporteInfo,

        banco: participante.viaticos ? participante.banco : "",
        bancoTipoCuenta: participante.viaticos ? participante.tipoCuenta : "",
        numeroCuenta: participante.viaticos ? participante.numeroCuenta : "",

        nombresCompletos2:
          participante.nombre.toUpperCase() +
          "\n" +
          participante.cargo.toUpperCase() +
          "\n" +
          participante.cedula,

        nombresCompletosJefeInmediato:
          participante.nombreJefeInmediato.toUpperCase() +
          "\n" +
          participante.cargoJefeInmediato.toUpperCase(),
      },
    ];

    const pdf = await generate({ template, plugins, inputs });
    const blob = new Blob([pdf.buffer], { type: "application/pdf" });

    zip.file(`Anexo A - Solicitud de Viaticos EPN ${participante.nombre.replace(/\s+/g, "_")}.pdf`, blob);
  }
  if (returnDocument) {
    const zipBlob = await zip.generateAsync({ type: "blob" });
    return zipBlob;
  }
  const zipBlob = await zip.generateAsync({ type: "blob" });
  saveAs(zipBlob, "Anexos A - Solicitud de Viaticos EPN.zip");
}
