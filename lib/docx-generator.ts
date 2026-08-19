import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  HeadingLevel,
  ImageRun,
} from "docx";

import type { ProjectInfo, ChecklistItemState } from "./validar-hito6-data";
import { calculateValidationStats, VALIDATION_SECTIONS } from "./validar-hito6-data";
import type { ChecklistRecord } from "./checklist-data";
import { CHECKLIST_FIELDS } from "./checklist-data";

export function buildOficioDocument(
  projectInfo: ProjectInfo,
  state: Record<string, ChecklistItemState>
): Document {
  const stats = calculateValidationStats(state);
  const now = new Date();
  const dateFormatted = projectInfo.fecha
    ? new Date(projectInfo.fecha).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })
    : now.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });

  const dateCompact = now.toISOString().slice(0, 10).replace(/-/g, "");
  const oficioNo = `OFCANT-CATS-${dateCompact}-01`;
  const municipioName = (projectInfo.municipio || "XXXX").toUpperCase();

  // Colors
  const NAVY = "1F4E78";
  const LIGHT_GRAY = "F2F2F2";
  const BORDER_COLOR = "D3D3D3";

  const tableHeaderCell = (text: string, widthPct: number) =>
    new TableCell({
      width: { size: widthPct, type: WidthType.PERCENTAGE },
      shading: { fill: NAVY },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text,
              bold: true,
              color: "FFFFFF",
              size: 20, // 10pt
              font: "Calibri",
            }),
          ],
        }),
      ],
    });

  const tableDataCell = (text: string, widthPct: number, bold = false, align = AlignmentType.LEFT, fill = "FFFFFF") =>
    new TableCell({
      width: { size: widthPct, type: WidthType.PERCENTAGE },
      shading: { fill },
      children: [
        new Paragraph({
          alignment: align,
          children: [
            new TextRun({
              text,
              bold,
              size: 19, // 9.5pt
              font: "Calibri",
            }),
          ],
        }),
      ],
    });

  // Table 1 Items (Memorias Técnicas)
  const tabla1Activities = [
    { num: "A", act: "ASPECTOS GENERALES DEL CONTRATO", isHeader: true },
    { num: "", act: "INTRODUCCIÓN", isHeader: true },
    { num: "1", act: "OBJETIVOS DEL PROCESO", defaultDone: true },
    { num: "2", act: "ALCANCE DEL PROCESO", defaultDone: true },
    { num: "3", act: "MARCO NORMATIVO CATASTRAL EMPLEADO", defaultDone: true },
    { num: "4", act: "IDENTIFICACIÓN DEL MUNICIPIO", defaultDone: true },
    { num: "5", act: "ALISTAMIENTO PARA LA INTERVENCIÓN", isHeader: true },
    { num: "5.1", act: "ANÁLISIS DE INSUMOS CATASTRALES, REGISTRALES, ORDENAMIENTO TERRITORIAL, AMBIENTAL, LICENCIAS DE CONSTRUCCIÓN, ENTRE OTROS.", defaultDone: true },
    { num: "5.2", act: "DIAGNÓSTICO DE LA BASE DE DATOS CATASTRAL VIGENTE AL INICIO DEL PROCESO, INCLUYENDO EL RESULTADO DE LA INTERRELACIÓN CON EL REGISTRO", defaultDone: true },
    { num: "5.3", act: "RELACIÓN DE MUTACIONES Y TRÁMITES DE CONSERVACIÓN", defaultDone: true },
    { num: "5.4", act: "PLAN DE CALIDAD APROBADO", defaultDone: true },
    { num: "5.5", act: "RESOLUCIÓN DE INICIO DEL PROCESO", defaultDone: true },
    { num: "6", act: "RESULTADOS DE LA OPERACIÓN", isHeader: true },
    { num: "6.1", act: "MÉTODO PARA LA RECOLECCIÓN DE INFORMACIÓN", defaultDone: true },
    { num: "6.2", act: "UNIDADES DE INTERVENCIÓN", defaultDone: true },
    { num: "6.3", act: "EJECUCIÓN OPERATIVA", isHeader: true },
    { num: "6.3.1", act: "Cronograma de intervención con el detalle de las actividades realizadas y sus hitos", defaultDone: true },
    { num: "6.3.2", act: "Resultados del reconocimiento predial urbano", defaultDone: true },
    { num: "6.3.3", act: "Resultados del reconocimiento predial rural disperso", defaultDone: true },
    { num: "6.4", act: "Resultados del componente social", isHeader: true },
    { num: "6.4.1", act: "Resultados de la participación – Interlocuciones", defaultDone: true },
    { num: "6.4.1.1", act: "Interlocución Nivel 1", defaultDone: true },
    { num: "6.4.1.2", act: "Interlocución Nivel 2", defaultDone: true },
    { num: "6.4.1.3", act: "Interlocución Nivel 3", defaultDone: true },
    { num: "6.4.1.4", act: "Interlocución Nivel 4", defaultDone: true },
    { num: "6.4.2", act: "Resultados de la estrategia de comunicaciones", defaultDone: true },
    { num: "6.4.3", act: "Implementación de la política de Género", isHeader: true },
    { num: "6.4.3.1", act: "Participación general de mujeres y población diferencial en actividades de interlocución y socialización.", defaultDone: true },
    { num: "6.4.3.2", act: "Estrategias implementadas para promover participación incluyente y no discriminatoria.", defaultDone: true },
    { num: "6.4.3.3", act: "Dificultades o limitaciones identificadas durante la implementación del enfoque diferencial.", defaultDone: true },
    { num: "6.4.3.4", act: "Conclusiones generales sobre el cumplimiento de la política de género y recomendaciones para futuros procesos.", defaultDone: true },
    { num: "6.4.4", act: "Atención y Gestión de PQRSD", isHeader: true },
    { num: "6.4.4.1", act: "Radicado de Mercurio", defaultDone: true },
    { num: "6.4.4.2", act: "Usuario solicitante", defaultDone: true },
    { num: "6.4.4.3", act: "Fecha de la reclamación", defaultDone: true },
    { num: "6.4.4.4", act: "Motivo de la reclamación", defaultDone: true },
    { num: "6.4.4.5", act: "Indicar si es competencia o no del operador de barrido predial o del económico", defaultDone: true },
    { num: "6.4.4.6", act: "Estado de la reclamación", defaultDone: true },
    { num: "6.4.4.7", act: "Radicado en BCGS asociado a la reclamación (si aplica)", defaultDone: true },
    { num: "6.4.5", act: "Intervenciones en territorios Étnicos", defaultDone: true },
    { num: "6.4.6", act: "Implementación de salvaguardas ambientales", defaultDone: true },
    { num: "6.5", act: "DE LOS PRODUCTOS", isHeader: true },
    { num: "6.5.1", act: "Acto administrativo de clausura e inscripción en catastro de los predios actualizados", defaultDone: true },
    { num: "6.5.2", act: "Resultados de la base de datos catastral actualizada", defaultDone: true },
    { num: "6.5.3", act: "Resultados de La Interrelación SNR", defaultDone: true },
    { num: "6.5.4", act: "Resultados de la implementación del plan de calidad", defaultDone: true },
    { num: "6.5.5", act: "Estadísticas de la información catastral al culminar el proceso", isHeader: true },
    { num: "6.5.5.1", act: "Número de predios actualizados", defaultDone: true },
    { num: "6.5.5.2", act: "Análisis por destino", defaultDone: true },
    { num: "6.5.5.3", act: "Análisis por áreas", defaultDone: true },
    { num: "6.5.5.4", act: "Predios cancelados", defaultDone: true },
    { num: "6.5.5.5", act: "Predios nuevos", defaultDone: true },
    { num: "6.5.5.6", act: "Omisiones y comisiones", defaultDone: true },
    { num: "6.5.5.7", act: "Interrelación catastro – registro", defaultDone: true },
    { num: "6.5.6", act: "Resultados del proceso de reclamaciones", defaultDone: true },
    { num: "7", act: "CONCLUSIONES", isHeader: true },
    { num: "7.1", act: "Estado inicial y final de la información física, jurídica de los predios intervenidos.", defaultDone: true },
    { num: "7.2", act: "Calidad y consistencia de la información obtenida durante el proceso.", defaultDone: true },
    { num: "7.3", act: "Resultados del reconocimiento predial y de la interrelación catastro – registro.", defaultDone: true },
    { num: "7.4", act: "Cumplimiento del plan de calidad y los mecanismos de control implementados.", defaultDone: true },
    { num: "7.5", act: "Resultados de la gestión social y del proceso de atención de reclamaciones.", defaultDone: true },
    { num: "7.6", act: "Principales dificultades técnicas, operativas, administrativas o territoriales presentadas durante la ejecución y la manera en que fueron gestionadas.", defaultDone: true },
    { num: "7.7", act: "Estado de los insumos cartográficos y bases de datos utilizados que harán parte de los entregables a cada municipio.", defaultDone: true },
    { num: "7.8", act: "Articulación institucional entre gestor catastral, operador, interventoría y entidades territoriales.", defaultDone: true },
    { num: "7.9", act: "Recomendaciones orientadas a garantizar la sostenibilidad y conservación de la información catastral actualizada.", defaultDone: true },
    { num: "7.10", act: "Cumplimiento normativo del proceso", defaultDone: true },
  ];

  const table1Rows = [
    new TableRow({
      children: [
        tableHeaderCell("N°", 8),
        tableHeaderCell("ACTIVIDADES", 52),
        tableHeaderCell("ESTADO", 15),
        tableHeaderCell("OBSERVACIONES", 25),
      ],
    }),
  ];

  tabla1Activities.forEach((rowItem) => {
    if (rowItem.isHeader) {
      table1Rows.push(
        new TableRow({
          children: [
            tableDataCell(rowItem.num, 8, true, AlignmentType.CENTER, LIGHT_GRAY),
            tableDataCell(rowItem.act, 52, true, AlignmentType.LEFT, LIGHT_GRAY),
            tableDataCell("", 15, true, AlignmentType.CENTER, LIGHT_GRAY),
            tableDataCell("", 25, false, AlignmentType.LEFT, LIGHT_GRAY),
          ],
        })
      );
    } else {
      const isComplete = stats.percentage >= 87.5;
      const statusText = isComplete ? "CUMPLE" : stats.percentage > 50 ? "CUMPLE PARCIAL" : "NO CUMPLE";
      const obsText = isComplete ? "Verificado y aprobado según especificaciones técnicas." : "Presenta observaciones que deben ser subsanadas.";

      table1Rows.push(
        new TableRow({
          children: [
            tableDataCell(rowItem.num, 8, false, AlignmentType.CENTER),
            tableDataCell(rowItem.act, 52, false, AlignmentType.LEFT),
            tableDataCell(statusText, 15, true, AlignmentType.CENTER),
            tableDataCell(obsText, 25, false, AlignmentType.LEFT),
          ],
        })
      );
    }
  });

  // Table 2 Items (Anexos Hito 6)
  const table2Rows = [
    new TableRow({
      children: [
        tableHeaderCell("N°", 8),
        tableHeaderCell("ACTIVIDADES DE ANEXOS HITO 6", 52),
        tableHeaderCell("ESTADO", 15),
        tableHeaderCell("OBSERVACIONES", 25),
      ],
    }),
  ];

  let itemCounter = 1;
  VALIDATION_SECTIONS.forEach((sec) => {
    sec.items.forEach((itemObj) => {
      const key = `${sec.title}::${itemObj.item}`;
      const itemDone = !!state[key]?.checked;
      const statusText = itemDone ? "CUMPLE" : "NO CUMPLE";
      const obsText = state[key]?.notes || (itemDone ? "Verificado en estructura." : "Pendiente por subsanar o entregar.");

      table2Rows.push(
        new TableRow({
          children: [
            tableDataCell(String(itemCounter++), 8, false, AlignmentType.CENTER),
            tableDataCell(`${sec.title} - ${itemObj.item}`, 52, false, AlignmentType.LEFT),
            tableDataCell(statusText, 15, true, AlignmentType.CENTER),
            tableDataCell(obsText, 25, false, AlignmentType.LEFT),
          ],
        })
      );
    });
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `Medellín, ${dateFormatted}`,
                bold: true,
                size: 22,
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [
              new TextRun({
                text: `Oficio N°: ${oficioNo}`,
                size: 20,
                font: "Calibri",
                color: "555555",
              }),
            ],
          }),
          new Paragraph({ text: "", space: { after: 200 } }),

          new Paragraph({
            children: [
              new TextRun({ text: "Señor(es):\n", bold: true, size: 22, font: "Calibri" }),
              new TextRun({ text: `OPERADOR DEL BARRIDO PREDIAL - ${projectInfo.operador || "VALOR +"}`, bold: true, size: 22, font: "Calibri" }),
            ],
          }),
          new Paragraph({ text: "", space: { after: 150 } }),

          new Paragraph({
            children: [
              new TextRun({ text: "Asunto: ", bold: true, size: 22, font: "Calibri" }),
              new TextRun({
                text: `Concepto sobre la primera versión asociada al Hito 06 referente a la entrega de las memorias técnicas del proyecto con el 100% de los entregables aprobados correspondientes a la etapa 1, 2 y 3 del municipio `,
                size: 22,
                font: "Calibri",
              }),
              new TextRun({ text: municipioName, bold: true, size: 22, font: "Calibri" }),
              new TextRun({ text: `, del componente de barrido predial.`, size: 22, font: "Calibri" }),
            ],
          }),
          new Paragraph({ text: "", space: { after: 250 } }),

          new Paragraph({
            children: [
              new TextRun({
                text: `Respetuoso saludo,\n\nLa Interventoría Conestudios S.A.S., de conformidad con las funciones establecidas en el Contrato No. 151, suscrito el 6 de junio de 2024, con acta de inicio del 13 de junio de 2024, y con base en la información suministrada por el operador del componente de barrido predial, emite el presente concepto y las respectivas consideraciones frente a la entrega correspondiente al Hito 06, relacionado con las memorias técnicas del proyecto, las cuales deberán contener el 100 % de los entregables aprobados correspondientes a las etapas 1, 2 y 3, así como los informes finales. Es importante precisar que el presente concepto se emite de conformidad con las obligaciones y condiciones establecidas en el contrato suscrito con el operador, así como con los lineamientos técnicos impartidos por el Supervisor Valor + mediante correo electrónico del 16 de julio de 2026.`,
                size: 21,
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({ text: "", space: { after: 300 } }),

          // Heading Tabla 1
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: `MEMORIAS TÉCNICAS DEL MUNICIPIO DE ${municipioName}`,
                bold: true,
                size: 24,
                color: NAVY,
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Tabla 1. Concepto sobre las memorias técnicas", italic: true, size: 20, font: "Calibri" }),
            ],
          }),
          new Paragraph({ text: "", space: { after: 150 } }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: table1Rows,
          }),

          new Paragraph({ text: "", space: { after: 400 } }),

          // Heading Tabla 2
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: `REVISIÓN DE LOS ANEXOS ASOCIADOS A LAS MEMORIAS TÉCNICAS DEL MUNICIPIO DE ${municipioName}`,
                bold: true,
                size: 24,
                color: NAVY,
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Tabla 2. Concepto sobre los anexos asociados a las memorias técnicas", italic: true, size: 20, font: "Calibri" }),
            ],
          }),
          new Paragraph({ text: "", space: { after: 150 } }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: table2Rows,
          }),

          new Paragraph({ text: "", space: { after: 400 } }),

          // Conclusion
          new Paragraph({
            children: [
              new TextRun({ text: "CONCLUSIÓN: ", bold: true, size: 22, font: "Calibri", color: NAVY }),
              new TextRun({
                text: `Por lo anterior, se puede concluir que los productos entregados `,
                size: 22,
                font: "Calibri",
              }),
              new TextRun({
                text: `${stats.concept} `,
                bold: true,
                size: 22,
                font: "Calibri",
                color: stats.concept === "CUMPLE" ? "008000" : "D9534F",
              }),
              new TextRun({
                text: `con las especificaciones técnicas (Porcentaje obtenido: ${stats.percentage}%). ${
                  stats.concept === "CUMPLE"
                    ? "La entrega cumple satisfactoriamente con la totalidad de los requerimientos contractuales."
                    : "Presenta errores de fondo o faltantes que deben ser subsanados con la entrega de una nueva versión."
                }`,
                size: 22,
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({ text: "", space: { after: 200 } }),

          new Paragraph({
            children: [
              new TextRun({
                text: `El presente concepto de interventoría se expide sin perjuicio de las observaciones que en algún momento pueda emitir la Supervisión Valor + y/o el Gestor Catastral a través de los diferentes espacios de revisión y/o retroalimentación.\n\nSe solicita al operador realizar la entrega de los ajustes solicitados en un plazo máximo de cuatro (4) días hábiles.`,
                size: 21,
                font: "Calibri",
              }),
            ],
          }),
          new Paragraph({ text: "", space: { after: 500 } }),

          // Signatures
          new Paragraph({
            children: [
              new TextRun({ text: "Cordialmente,\n\n\n\n", size: 22, font: "Calibri" }),
              new TextRun({ text: "BLANCA RUTH JARAMILLO SOTO\n", bold: true, size: 22, font: "Calibri" }),
              new TextRun({ text: "Líder de reconocimiento predial Conestudios S.A.S.\n", size: 20, font: "Calibri" }),
              new TextRun({ text: "Interventoría Contrato No. 151 de 2024", size: 19, font: "Calibri", color: "666666" }),
            ],
          }),
        ],
      },
    ],
  });

  return doc;
}

export async function generateOficioDocxBuffer(
  projectInfo: ProjectInfo,
  state: Record<string, ChecklistItemState>
): Promise<Buffer> {
  const doc = buildOficioDocument(projectInfo, state);
  return await Packer.toBuffer(doc);
}

export async function generateOficioDocxBlob(
  projectInfo: ProjectInfo,
  state: Record<string, ChecklistItemState>
): Promise<Blob> {
  const doc = buildOficioDocument(projectInfo, state);
  return await Packer.toBlob(doc);
}

export const CARTOGRAPHIC_REVIEW_ITEMS = [
  { num: "01", label: "ZONA URBANA  BASE DE DATOS CATASTRAL", fieldIds: ["zona_urbana_gdb", "zona_urbana_alfanumerico", "general_estructura_general"] },
  { num: "02", label: "ZONA URBANA  METADATOS", fieldIds: ["metadatos_urbana", "metadatos_general"] },
  { num: "03", label: "ZONA RURAL  BASE DE DATOS CATASTRAL", fieldIds: ["zona_rural_gdb", "zona_rural_alfanumerico"] },
  { num: "04", label: "ZONA RURAL  METADATOS", fieldIds: ["metadatos_rural"] },
  { num: "05", label: "CARPETA PDF  ORTOFOTO 1:2.000", fieldIds: ["pdf_planos_ortofoto_2000"] },
  { num: "06", label: "CARPETA PDF  ORTOFOTO 1:10.000", fieldIds: ["pdf_planos_ortofoto_10000"] },
  { num: "07", label: "CARPETA PDF  PLANO_CONJUNTO_ZONA URBANA 1:2000", fieldIds: ["pdf_planos_prediales_2000", "pdf_planos_manzaneros"] },
  { num: "08", label: "CARPETA PDF  PLANO_CONJUNTO_ZONA URBANA 1:2000 - ZONAS HOMOGÉNEAS FÍSICAS", fieldIds: ["pdf_planos_zhf_2000"] },
  { num: "09", label: "CARPETA PDF  PLANO_CONJUNTO_ZONA URBANA 1:2000 - ZONAS HOMOGÉNEAS ECONÓMICAS", fieldIds: ["pdf_planos_zhe_2000"] },
  { num: "10", label: "CARPETA PDF  PLANO_CONJUNTO_ZONA RURAL 1:10000", fieldIds: ["pdf_planos_prediales_10000"] },
  { num: "11", label: "CARPETA PDF  PLANO_CONJUNTO_ZONA RURAL 1:10000 - ZONAS HOMOGÉNEAS FÍSICAS", fieldIds: ["pdf_planos_zhf_10000"] },
  { num: "12", label: "CARPETA PDF  PLANO_CONJUNTO_ZONA RURAL 1:10000 - ZONAS HOMOGÉNEAS ECONÓMICAS", fieldIds: ["pdf_planos_zhe_10000"] },
  { num: "13", label: "CARPETA PDF  PLANO M_CABECERA 1:500", fieldIds: ["pdf_planos_cabecera_500", "pdf_planos_pdf"] },
  { num: "14", label: "CARPETA PDF  PLANO M_CENTROSP_ 1:500", fieldIds: ["pdf_planos_centrosp_500"] },
  { num: "15", label: "CARPETA MXD  ORTOFOTO 1:2.000 / ORTOFOTO 1:10.000", fieldIds: ["mxd_planos_ortofoto_2000", "mxd_planos_ortofoto_10000"] },
  { num: "16", label: "CARPETA MXD  PLANO_CONJUNTO_ZONA URBANA 1:2000", fieldIds: ["mxd_planos_prediales_2000", "mxd_planos_manzaneros"] },
  { num: "17", label: "CARPETA MXD  PLANO_CONJUNTO_ZONA URBANA 1:2000 - ZONAS HOMOGÉNEAS FÍSICAS", fieldIds: ["mxd_planos_zhf_2000"] },
  { num: "18", label: "CARPETA MXD  PLANO_CONJUNTO_ZONA URBANA 1:2000 - ZONAS HOMOGÉNEAS ECONÓMICAS", fieldIds: ["mxd_planos_zhe_2000"] },
  { num: "19", label: "CARPETA MXD  PLANO_CONJUNTO_ZONA RURAL 1:10000", fieldIds: ["mxd_planos_prediales_10000"] },
  { num: "20", label: "CARPETA MXD  PLANO_CONJUNTO_ZONA RURAL 1:10000 - ZONAS HOMOGÉNEAS FÍSICAS", fieldIds: ["mxd_planos_zhf_10000"] },
  { num: "21", label: "CARPETA MXD  PLANO_CONJUNTO_ZONA RURAL 1:10000 - ZONAS HOMOGÉNEAS ECONÓMICAS", fieldIds: ["mxd_planos_zhe_10000"] },
  { num: "22", label: "CARPETA MXD  PLANO M_CABECERA 1:500", fieldIds: ["mxd_planos_cabecera_500", "mxd_planos_mxd", "mxd_estructura_interna"] },
  { num: "23", label: "CARPETA MXD  PLANO M_CENTROSP_ 1:500", fieldIds: ["mxd_planos_centrosp_500"] },
];

async function resolveImageBytes(url: string): Promise<Buffer | Uint8Array | null> {
  if (!url) return null;
  try {
    if (url.startsWith("data:image/")) {
      const base64Data = url.split(",")[1];
      if (!base64Data) return null;
      if (typeof window === "undefined") {
        return Buffer.from(base64Data, "base64");
      } else {
        const binary = atob(base64Data);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
      }
    }

    if (typeof window === "undefined") {
      const fs = require("node:fs");
      const path = require("node:path");
      let localPath = url;
      if (url.startsWith("/")) {
        localPath = path.join(process.cwd(), "public", url);
        if (!fs.existsSync(localPath)) {
          localPath = path.join(process.cwd(), "dist", "client", url);
        }
        if (!fs.existsSync(localPath)) {
          localPath = path.join(process.cwd(), url);
        }
      }
      if (fs.existsSync(localPath)) {
        return fs.readFileSync(localPath);
      }
    }

    const res = await fetch(url);
    if (res.ok) {
      const arrayBuf = await res.arrayBuffer();
      return new Uint8Array(arrayBuf);
    }
  } catch (err) {
    console.warn("No se pudo cargar imagen para exportar a Word:", url, err);
  }
  return null;
}

export async function buildCartographicConceptDocument(
  record: ChecklistRecord,
  customProjectInfo?: ProjectInfo
): Promise<Document> {
  const now = new Date();
  const dateFormatted = customProjectInfo?.fecha
    ? new Date(customProjectInfo.fecha).toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" })
    : now.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });

  const municipioName = (record.municipio || customProjectInfo?.municipio || "BETANIA").toUpperCase();
  const contratoNo = customProjectInfo?.contrato || "Contrato 179-2024";

  const NAVY = "1F4E78";
  const LIGHT_GRAY = "F2F2F2";

  const tableHeaderCell = (text: string, widthPct: number) =>
    new TableCell({
      width: { size: widthPct, type: WidthType.PERCENTAGE },
      shading: { fill: NAVY },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text, bold: true, color: "FFFFFF", size: 20, font: "Calibri" }),
          ],
        }),
      ],
    });

  const tableDataCell = (text: string, widthPct: number, bold = false, align = AlignmentType.LEFT, fill = "FFFFFF") =>
    new TableCell({
      width: { size: widthPct, type: WidthType.PERCENTAGE },
      shading: { fill },
      children: [
        new Paragraph({
          alignment: align,
          children: [
            new TextRun({ text, bold, size: 19, font: "Calibri" }),
          ],
        }),
      ],
    });

  const tableRows = [
    new TableRow({
      children: [
        tableHeaderCell("N°", 8),
        tableHeaderCell("ACTIVIDADES DE ANEXOS HITO 6", 52),
        tableHeaderCell("ESTADO", 15),
        tableHeaderCell("OBSERVACIONES", 25),
      ],
    }),
  ];

  CARTOGRAPHIC_REVIEW_ITEMS.forEach((item) => {
    let statusText = "PENDIENTE";
    let obsText = "";

    for (const fId of item.fieldIds) {
      const st = record.checks?.[fId];
      if (st) {
        if (st === "Cumple") statusText = "CUMPLE";
        else if (st === "Cumple parcial") statusText = "PARCIAL";
        else if (st === "No cumple") statusText = "NO CUMPLE";
        else if (st === "No aplica") statusText = "N/A";
        else statusText = st.toUpperCase();
      }
      const obs = record.fieldObservations?.[fId];
      if (obs && obs.trim()) {
        obsText = obs.trim();
        break;
      }
    }

    if (!obsText) {
      if (statusText === "CUMPLE") obsText = "Verificado y aprobado según especificaciones técnicas.";
      else if (statusText === "N/A") obsText = "No aplica para este municipio.";
      else obsText = "Presenta observaciones que deben ser subsanadas.";
    }

    tableRows.push(
      new TableRow({
        children: [
          tableDataCell(item.num, 8, false, AlignmentType.CENTER),
          tableDataCell(item.label, 52, false, AlignmentType.LEFT),
          tableDataCell(statusText, 15, true, AlignmentType.CENTER),
          tableDataCell(obsText, 25, false, AlignmentType.LEFT),
        ],
      })
    );
  });

  const evidenceElements: any[] = [];
  const evidenceKeys = Object.keys(record.fieldEvidence ?? {});

  if (evidenceKeys.length > 0) {
    evidenceElements.push(
      new Paragraph({ text: "", space: { after: 300 } }),
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [
          new TextRun({
            text: `EVIDENCIA FOTOGRÁFICA Y REGISTRO DE HALLAZGOS CARTOGRÁFICOS`,
            bold: true,
            size: 24,
            color: NAVY,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({ text: "", space: { after: 150 } })
    );

    let photoCounter = 1;
    for (const fieldId of evidenceKeys) {
      const imgUrl = record.fieldEvidence?.[fieldId];
      if (!imgUrl) continue;

      const fieldDef = CHECKLIST_FIELDS.find((f) => f.id === fieldId);
      const fieldLabel = fieldDef ? `${fieldDef.group} - ${fieldDef.label}` : fieldId;
      const obsText = record.fieldObservations?.[fieldId] || "";

      const imgBytes = await resolveImageBytes(imgUrl);
      if (imgBytes) {
        evidenceElements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Hallazgo Cartográfico N° ${photoCounter++}: ${fieldLabel}`,
                bold: true,
                size: 22,
                font: "Calibri",
                color: NAVY,
              }),
            ],
          }),
          new Paragraph({ text: "", space: { after: 100 } }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new ImageRun({
                data: imgBytes as any,
                transformation: {
                  width: 480,
                  height: 270,
                },
              }),
            ],
          }),
          new Paragraph({ text: "", space: { after: 100 } }),
          new Paragraph({
            children: [
              new TextRun({ text: "Observaciones: ", bold: true, size: 20, font: "Calibri" }),
              new TextRun({
                text: obsText || "Evidencia fotográfica cargada para la verificación técnica del elemento.",
                italic: true,
                size: 20,
                font: "Calibri",
                color: "444444",
              }),
            ],
          }),
          new Paragraph({ text: "", space: { after: 300 } })
        );
      }
    }
  }

  const hasNoCumple = Object.values(record.checks ?? {}).includes("No cumple");
  const overallConcept = hasNoCumple ? "NO CUMPLE" : "CUMPLE";

  const children: any[] = [
    new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [
        new TextRun({ text: `Medellín, ${dateFormatted}`, bold: true, size: 22, font: "Calibri" }),
      ],
    }),
    new Paragraph({ text: "", space: { after: 200 } }),

    new Paragraph({
      children: [
        new TextRun({ text: "Señor\n", bold: true, size: 22, font: "Calibri" }),
        new TextRun({ text: "ANDRÉS EMILIO LONDOÑO SÁNCHEZ\n", bold: true, size: 22, font: "Calibri" }),
        new TextRun({ text: "ASOCIACIÓN DE MUNICIPIOS DEL NORTE ANTIOQUEÑO\n", size: 20, font: "Calibri" }),
        new TextRun({ text: "AMUNORTE\n", bold: true, size: 20, font: "Calibri" }),
        new TextRun({ text: `${contratoNo}`, size: 20, font: "Calibri" }),
      ],
    }),
    new Paragraph({ text: "", space: { after: 200 } }),

    new Paragraph({
      children: [
        new TextRun({ text: "Asunto: ", bold: true, size: 22, font: "Calibri" }),
        new TextRun({
          text: `Concepto sobre la primera versión asociada al Hito 06 referente a la entrega de las memorias técnicas del proyecto con el 100% de los entregables aprobados correspondientes a la etapa 1, 2 y 3 del municipio `,
          size: 22,
          font: "Calibri",
        }),
        new TextRun({ text: municipioName, bold: true, size: 22, font: "Calibri" }),
        new TextRun({ text: `, del componente de barrido predial.`, size: 22, font: "Calibri" }),
      ],
    }),
    new Paragraph({ text: "", space: { after: 250 } }),

    new Paragraph({
      children: [
        new TextRun({
          text: `Respetuoso saludo,  La Interventoría Conestudios S.A.S., de conformidad con las funciones establecidas en el Contrato No. 151, suscrito el 6 de junio de 2024, con acta de inicio del 13 de junio de 2024, y con base en la información suministrada por el operador del componente de barrido predial, emite el presente concepto y las respectivas consideraciones frente a la entrega correspondiente al Hito 06, relacionado con las memorias técnicas del proyecto, las cuales deberán contener el 100 % de los entregables aprobados correspondientes a las etapas 1, 2 y 3, así como los informes finales. Es importante precisar que el presente concepto se emite de conformidad con las obligaciones y condiciones establecidas en el contrato suscrito con el operador, así como con los lineamientos técnicos impartidos por el Supervisor Valor + mediante correo electrónico del 16 de julio de 2026.`,
          size: 21,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({ text: "", space: { after: 300 } }),

    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [
        new TextRun({
          text: `REVISIÓN DE LOS ANEXOS ASOCIADOS AL COMPONENTE CARTOGRÁFICO DE LAS MEMORIAS TÉCNICAS DEL MUNICIPIO DE ${municipioName}`,
          bold: true,
          size: 24,
          color: NAVY,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({ text: "", space: { after: 150 } }),

    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: tableRows,
    }),

    ...evidenceElements,

    new Paragraph({ text: "", space: { after: 300 } }),

    new Paragraph({
      children: [
        new TextRun({ text: "CONCLUSIÓN: ", bold: true, size: 22, font: "Calibri", color: NAVY }),
        new TextRun({ text: `Por lo anterior, se puede concluir que los productos entregados `, size: 22, font: "Calibri" }),
        new TextRun({
          text: `${overallConcept} `,
          bold: true,
          size: 22,
          font: "Calibri",
          color: overallConcept === "CUMPLE" ? "008000" : "D9534F",
        }),
        new TextRun({
          text: `con las especificaciones técnicas. Presenta errores de fondo o faltantes que deben ser subsanados con la entrega de una nueva versión.`,
          size: 22,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({ text: "", space: { after: 200 } }),

    new Paragraph({
      children: [
        new TextRun({
          text: `El presente concepto de interventoría se expide sin perjuicio de las observaciones que en algún momento pueda emitir la Supervisión Valor + y/o el Gestor Catastral a través de los diferentes espacios de revisión y/o retroalimentación.  Se solicita al operador realizar la entrega de los ajustes solicitados en un plazo máximo de cuatro (4) días hábiles.`,
          size: 21,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({ text: "", space: { after: 400 } }),

    new Paragraph({
      children: [
        new TextRun({ text: "Cordialmente,\n\n\n\n", size: 22, font: "Calibri" }),
        new TextRun({ text: "BLANCA RUTH JARAMILLO SOTO\n", bold: true, size: 22, font: "Calibri" }),
        new TextRun({ text: "Líder de reconocimiento predial Conestudios S.A.S.\n", size: 20, font: "Calibri" }),
        new TextRun({ text: "Interventoría Contrato No. 151 de 2024", size: 19, font: "Calibri", color: "666666" }),
      ],
    }),
  ];

  return new Document({
    sections: [{ properties: {}, children }],
  });
}

export async function generateCartographicConceptDocxBuffer(
  record: ChecklistRecord,
  customProjectInfo?: ProjectInfo
): Promise<Buffer> {
  const doc = await buildCartographicConceptDocument(record, customProjectInfo);
  return await Packer.toBuffer(doc);
}

export async function generateCartographicConceptDocxBlob(
  record: ChecklistRecord,
  customProjectInfo?: ProjectInfo
): Promise<Blob> {
  const doc = await buildCartographicConceptDocument(record, customProjectInfo);
  return await Packer.toBlob(doc);
}
