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
} from "docx";

import type { ProjectInfo, ChecklistItemState } from "./validar-hito6-data";
import { calculateValidationStats, VALIDATION_SECTIONS } from "./validar-hito6-data";

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
