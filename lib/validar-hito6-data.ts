export type ValidationStatus = "NO CUMPLE" | "CUMPLE PARCIALMENTE" | "CUMPLE" | "PENDIENTE";

export type ChecklistItemState = {
  checked: boolean;
  notes?: string;
  subitems?: Record<string, boolean>;
};

export type ProjectInfo = {
  municipio: string;
  operador: string;
  contrato: string;
  fecha: string;
  fechaEntregaInicial?: string;
  fechaEntregaCorrecciones?: string;
};

export type ValidationSectionItem = {
  item: string;
  subitems?: string[];
  hints?: string[];
  exts?: string[];
  type?: "section" | "file" | "folder" | "folder_nonempty" | "folder_photos" | "folder_with_excel" | "encounter" | "mutation_report";
};

export type ValidationSection = {
  title: string;
  items: ValidationSectionItem[];
};

export const VALIDATION_SECTIONS: ValidationSection[] = [
  {
    title: "1. DOCUMENTO DIAGNÓSTICO",
    items: [
      { item: "Carpeta 1. DOCUMENTO DIAGNÓSTICO", type: "section" },
      { item: "Documento / oficio de aprobación", type: "file", exts: [".pdf", ".doc", ".docx"] },
      { item: "A.1.1. Informe Técnico Diagnóstico", type: "folder_nonempty" },
      { item: "A.1.2. Cartografía e Insumos", type: "folder_nonempty" },
      { item: "A.1.3. Anexos Complementarios", type: "folder_nonempty" },
    ],
  },
  {
    title: "2. PLAN DE TRABAJO",
    items: [
      { item: "Carpeta 2. PLAN DE TRABAJO", type: "section" },
      { item: "Documento / oficio de aprobación", type: "file", exts: [".pdf", ".doc", ".docx"] },
      { item: "A.2.1. CRONOGRAMA INICIAL", type: "folder_nonempty" },
      { item: "A.2.2. CRONOGRAMA OTROSÍ N°01", type: "folder_nonempty" },
      { item: "A.2.3. OTROS ANEXOS", type: "folder" },
    ],
  },
  {
    title: "3. PGAS",
    items: [
      { item: "Carpeta 3. PGAS", type: "section" },
      { item: "Documento / oficio de aprobación", type: "file", exts: [".pdf", ".doc", ".docx"] },
      { item: "A.3.1. Plan de Gestión Ambiental y Social", type: "folder_nonempty" },
      { item: "A.3.2. Fichas de Manejo Ambiental", type: "folder_nonempty" },
      { item: "A.3.3. Evidencias de Ejecución", type: "folder_nonempty" },
    ],
  },
  {
    title: "4. PLAN DE CALIDAD",
    items: [
      { item: "Carpeta 4. PLAN DE CALIDAD", type: "section" },
      { item: "Documento / oficio de aprobación", type: "file", exts: [".pdf", ".doc", ".docx"] },
      { item: "A.4.1. Plan de Control de Calidad", type: "folder_nonempty" },
      { item: "A.4.2. Matriz de Riesgos y Calidad", type: "folder_nonempty" },
      { item: "A.4.3. Formatos y Registros de Control", type: "folder_nonempty" },
    ],
  },
  {
    title: "5. INFORME INTERLOCUCIÓN NIVEL 1",
    items: [
      { item: "Carpeta 5. INFORME INTERLOCUCIÓN NIVEL 1", type: "section" },
      { item: "Documento / oficio de aprobación", type: "file", exts: [".pdf", ".doc", ".docx"] },
      { item: "A.5.1. INFORME DE RESULTADOS", type: "folder_nonempty" },
      { item: "A.5.2. ACTA DE REUNIÓN", type: "folder_nonempty" },
      { item: "A.5.3. LISTADO DE ASISTENCIA", type: "folder_nonempty" },
      { item: "A.5.4. REGISTRO FOTOGRÁFICO", type: "folder_photos", exts: [".jpg", ".jpeg", ".png"] },
      { item: "A.5.5. OTROS ANEXOS", type: "folder" },
    ],
  },
  {
    title: "6. INFORME INTERLOCUCIÓN NIVEL 2",
    items: [
      { item: "Carpeta 6. INFORME INTERLOCUCIÓN NIVEL 2", type: "section" },
      { item: "Documento / oficio de aprobación", type: "file", exts: [".pdf", ".doc", ".docx"] },
      { item: "A.6.1. INFORME DE RESULTADOS", type: "folder_nonempty" },
      {
        item: "A.6.2. Carpeta(s) de encuentro AAAAMMDD_LUGAR_ZONA",
        type: "encounter",
        subitems: [
          "A.6.2.1. ACTA DE REUNIÓN",
          "A.6.2.2. LISTADO DE ASISTENCIA",
          "A.6.2.3. REGISTRO FOTOGRÁFICO",
        ],
      },
      { item: "A.6.3. OTROS ANEXOS", type: "folder" },
    ],
  },
  {
    title: "7. INFORME INTERLOCUCIÓN NIVEL 3",
    items: [
      { item: "Carpeta 7. INFORME INTERLOCUCIÓN NIVEL 3", type: "section" },
      { item: "Documento / oficio de aprobación", type: "file", exts: [".pdf", ".doc", ".docx"] },
      { item: "A.7.1. INFORME DE RESULTADOS", type: "folder_nonempty" },
      {
        item: "A.7.2. Carpeta(s) de encuentro AAAAMMDD_LUGAR_ZONA",
        type: "encounter",
        subitems: [
          "A.7.2.1. ACTA DE REUNIÓN",
          "A.7.2.2. LISTADO DE ASISTENCIA",
          "A.7.2.3. REGISTRO FOTOGRÁFICO",
        ],
      },
      { item: "A.7.3. OTROS ANEXOS", type: "folder" },
    ],
  },
  {
    title: "8. INFORME INTERLOCUCIÓN NIVEL 4",
    items: [
      { item: "Carpeta 8. INFORME INTERLOCUCIÓN NIVEL 4", type: "section" },
      { item: "Documento / oficio de aprobación", type: "file", exts: [".pdf", ".doc", ".docx"] },
      { item: "A.8.1. INFORME DE RESULTADOS", type: "folder_nonempty" },
      { item: "A.8.2. ACTA DE REUNIÓN", type: "folder_nonempty" },
      { item: "A.8.3. LISTADO DE ASISTENCIA", type: "folder_nonempty" },
      { item: "A.8.4. REGISTRO FOTOGRÁFICO", type: "folder_photos", exts: [".jpg", ".jpeg", ".png"] },
      { item: "A.8.5. OTROS ANEXOS", type: "folder" },
    ],
  },
  {
    title: "9. ESTUDIO JURÍDICO",
    items: [
      { item: "Carpeta 9. ESTUDIO JURÍDICO", type: "section" },
      { item: "Documento / oficio de aprobación", type: "file", exts: [".pdf", ".doc", ".docx"] },
      { item: "A.9.1. INFORME ESTUDIO JURÍDICO", type: "folder_nonempty" },
      { item: "A.9.2. MATRIZ ESTUDIO JURÍDICO", type: "folder_nonempty" },
    ],
  },
  {
    title: "10. ZONA URBANA",
    items: [
      { item: "Carpeta 10. ZONA URBANA", type: "section" },
      { item: "A.10.1.1 REGISTRO FOTOGRÁFICO", type: "folder_photos", exts: [".jpg", ".jpeg", ".png"] },
      { item: "A.10.1.2 BASE DE DATOS CATASTRAL", type: "folder_nonempty" },
      { item: "A.10.1.3 METADATOS (incluye Excel)", type: "folder_with_excel", exts: [".xls", ".xlsx"] },
      {
        item: "A.10.1.4 REPORTE SALDOS DE MUTACIÓN",
        type: "mutation_report",
        subitems: [
          "Documento Word con análisis de mutaciones",
          "Archivo Excel con detalle de mutaciones",
        ],
      },
    ],
  },
  {
    title: "11. ZONA RURAL",
    items: [
      { item: "Carpeta 11. ZONA RURAL", type: "section" },
      { item: "A.11.1.1 REGISTRO FOTOGRÁFICO", type: "folder_photos", exts: [".jpg", ".jpeg", ".png"] },
      { item: "A.11.1.2 BASE DE DATOS CATASTRAL", type: "folder_nonempty" },
      { item: "A.11.1.3 METADATOS (incluye Excel)", type: "folder_with_excel", exts: [".xls", ".xlsx"] },
      {
        item: "A.11.1.4 REPORTE SALDOS DE MUTACIÓN",
        type: "mutation_report",
        subitems: [
          "Documento Word con análisis de mutaciones",
          "Archivo Excel con detalle de mutaciones",
        ],
      },
    ],
  },
  {
    title: "12. CARPETA PDF",
    items: [
      { item: "Carpeta 12. CARPETA PDF", type: "section" },
      { item: "A.12.1. ORTOFOTO", type: "folder_nonempty", exts: [".pdf"] },
      { item: "A.12.2. PLANO_CONJUNTO_ZONA URBANA 1:2000", type: "folder_nonempty", exts: [".pdf"] },
      { item: "A.12.3. PLANO_CONJUNTO_ZONA RURAL 1:10000", type: "folder_nonempty", exts: [".pdf"] },
      { item: "A.12.4. PLANO M_CABECERA 1:500", type: "folder_nonempty", exts: [".pdf"] },
      { item: "A.12.5. PLANO M_CENTROSP_ 1:500", type: "folder_nonempty", exts: [".pdf"] },
    ],
  },
  {
    title: "13. CARPETA MXD",
    items: [
      { item: "Carpeta 13. CARPETA MXD", type: "section" },
      { item: "A.13.1. ORTOFOTO", type: "folder_nonempty", exts: [".mxd"] },
      { item: "A.13.2. PLANO_CONJUNTO_ZONA URBANA 1:2000", type: "folder_nonempty", exts: [".mxd"] },
      { item: "A.13.3. PLANO_CONJUNTO_ZONA RURAL 1:10000", type: "folder_nonempty", exts: [".mxd"] },
      { item: "A.13.4. PLANO M_CABECERA 1:500", type: "folder_nonempty", exts: [".mxd"] },
      { item: "A.13.5. PLANO M_CENTROSP_ 1:500", type: "folder_nonempty", exts: [".mxd"] },
    ],
  },
];

export function calculateValidationStats(state: Record<string, ChecklistItemState>) {
  let totalItems = 0;
  let checkedItems = 0;

  VALIDATION_SECTIONS.forEach((section) => {
    section.items.forEach((itemObj) => {
      totalItems += 1;
      const key = `${section.title}::${itemObj.item}`;
      const itemState = state[key];
      if (itemState?.checked) {
        checkedItems += 1;
      }
      if (itemObj.subitems && itemObj.subitems.length > 0) {
        itemObj.subitems.forEach((sub) => {
          totalItems += 1;
          const subKey = `${key}::${sub}`;
          if (itemState?.subitems?.[subKey] || state[subKey]?.checked) {
            checkedItems += 1;
          }
        });
      }
    });
  });

  const percentage = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;
  let concept: ValidationStatus = "NO CUMPLE";

  if (percentage >= 87.5) {
    concept = "CUMPLE";
  } else if (percentage > 50) {
    concept = "CUMPLE PARCIALMENTE";
  }

  return {
    totalItems,
    checkedItems,
    percentage: Math.round(percentage * 10) / 10,
    concept,
  };
}

export function generateValidationConceptText(
  projectInfo: ProjectInfo,
  state: Record<string, ChecklistItemState>
): string {
  const stats = calculateValidationStats(state);
  const now = new Date();
  const fechaStr = projectInfo.fecha || now.toLocaleDateString("es-CO");

  let text = `========================================================================\n`;
  text += `           CONCEPTO DE VALIDACIÓN TÉCNICA - HITO 6            \n`;
  text += `========================================================================\n\n`;
  text += `INFORMACIÓN DEL PROYECTO:\n`;
  text += `------------------------------------------------------------------------\n`;
  text += `Municipio:             ${projectInfo.municipio || "No especificado"}\n`;
  text += `Operador:              ${projectInfo.operador || "No especificado"}\n`;
  text += `Contrato:              ${projectInfo.contrato || "No especificado"}\n`;
  text += `Fecha del documento:   ${fechaStr}\n`;
  text += `Fecha de generación:   ${now.toLocaleString("es-CO")}\n`;
  text += `------------------------------------------------------------------------\n\n`;

  text += `RESULTADO DE CUMPLIMIENTO:\n`;
  text += `------------------------------------------------------------------------\n`;
  text += `Ítems Verificados:     ${stats.checkedItems} de ${stats.totalItems}\n`;
  text += `Porcentaje Obtenido:   ${stats.percentage}%\n`;
  text += `CONCEPTO TÉCNICO:      [ ${stats.concept} ]\n`;
  text += `------------------------------------------------------------------------\n\n`;

  text += `CRITERIOS DE CONCEPTO:\n`;
  text += `  • 0.0%  - 50.0%:   NO CUMPLE\n`;
  text += `  • 50.1% - 87.5%:   CUMPLE PARCIALMENTE\n`;
  text += `  • 87.6% - 100.0%:  CUMPLE\n\n`;

  text += `DESGLOSE POR SECCIÓN Y ENTREGABLES:\n`;
  text += `========================================================================\n\n`;

  VALIDATION_SECTIONS.forEach((sec) => {
    let secChecked = 0;
    let secTotal = 0;
    sec.items.forEach((itemObj) => {
      secTotal += 1;
      const key = `${sec.title}::${itemObj.item}`;
      if (state[key]?.checked) secChecked += 1;
      if (itemObj.subitems) {
        itemObj.subitems.forEach((sub) => {
          secTotal += 1;
          const subKey = `${key}::${sub}`;
          if (state[key]?.subitems?.[subKey] || state[subKey]?.checked) secChecked += 1;
        });
      }
    });

    const secPct = secTotal > 0 ? Math.round((secChecked / secTotal) * 100) : 0;
    text += `[${secPct}%] ${sec.title}\n`;

    sec.items.forEach((itemObj) => {
      const key = `${sec.title}::${itemObj.item}`;
      const itemDone = !!state[key]?.checked;
      const checkMark = itemDone ? "[X]" : "[ ]";
      text += `   ${checkMark} ${itemObj.item}\n`;

      if (itemObj.subitems) {
        itemObj.subitems.forEach((sub) => {
          const subKey = `${key}::${sub}`;
          const subDone = !!(state[key]?.subitems?.[subKey] || state[subKey]?.checked);
          const subCheck = subDone ? "   [X]" : "   [ ]";
          text += `      ${subCheck} ${sub}\n`;
        });
      }
    });
    text += `\n`;
  });

  text += `========================================================================\n`;
  text += `Fin del Concepto Técnico de Validación - HITO 6\n`;
  text += `========================================================================\n`;

  return text;
}

function xmlEscape(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function excelCell(value: unknown, styleId = "") {
  const text = xmlEscape(value);
  const style = styleId ? ` ss:StyleID="${styleId}"` : "";
  return `<Cell${style}><Data ss:Type="String">${text}</Data></Cell>`;
}

function excelRow(values: unknown[], styleId = "") {
  return `<Row>${values.map((v) => excelCell(v, styleId)).join("")}</Row>`;
}

export function generateValidationExcelXml(
  projectInfo: ProjectInfo,
  state: Record<string, ChecklistItemState>
): string {
  const detailRowsXml: string[] = [];

  VALIDATION_SECTIONS.forEach((sec) => {
    sec.items.forEach((itemObj) => {
      const key = `${sec.title}::${itemObj.item}`;
      const isDone = !!state[key]?.checked;
      const statusText = isDone ? "Cumple" : "No cumple";
      const statusStyle = isDone ? "Cumple" : "NoCumple";

      // Item Principal
      detailRowsXml.push(
        `<Row>
          ${excelCell(sec.title, "SectionCell")}
          ${excelCell("Según Contrato Hito 6", "SubSectionCell")}
          ${excelCell(itemObj.item, "ItemCell")}
          ${excelCell("", "CellData")}
          ${excelCell(statusText, statusStyle)}
        </Row>`
      );

      // Subitems si existen
      if (itemObj.subitems && itemObj.subitems.length > 0) {
        itemObj.subitems.forEach((sub) => {
          const subKey = `${key}::${sub}`;
          const subDone = !!(state[key]?.subitems?.[subKey] || state[subKey]?.checked);
          const subStatusText = subDone ? "Cumple" : "No cumple";
          const subStatusStyle = subDone ? "Cumple" : "NoCumple";

          detailRowsXml.push(
            `<Row>
              ${excelCell("", "SectionCell")}
              ${excelCell("", "SubSectionCell")}
              ${excelCell("", "ItemCell")}
              ${excelCell(sub, "SubItemCell")}
              ${excelCell(subStatusText, subStatusStyle)}
            </Row>`
          );
        });
      }
    });
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Size="12" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#366092" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="SectionCell">
   <Font ss:Bold="1" ss:Size="11"/>
   <Interior ss:Color="#D9E1F2" ss:Pattern="Solid"/>
   <Alignment ss:Vertical="Top" ss:WrapText="1"/>
  </Style>
  <Style ss:ID="SubSectionCell">
   <Font ss:Bold="1" ss:Size="10"/>
   <Interior ss:Color="#E7E6E6" ss:Pattern="Solid"/>
   <Alignment ss:Vertical="Top" ss:WrapText="1"/>
  </Style>
  <Style ss:ID="ItemCell">
   <Font ss:Size="10"/>
   <Interior ss:Color="#F2F2F2" ss:Pattern="Solid"/>
   <Alignment ss:Vertical="Top" ss:WrapText="1"/>
  </Style>
  <Style ss:ID="SubItemCell">
   <Font ss:Italic="1" ss:Size="9"/>
   <Alignment ss:Vertical="Top" ss:WrapText="1"/>
  </Style>
  <Style ss:ID="CellData">
   <Font ss:Size="10"/>
   <Alignment ss:Vertical="Top"/>
  </Style>
  <Style ss:ID="Cumple">
   <Font ss:Bold="1" ss:Color="#276A3C"/>
   <Interior ss:Color="#E2EFDA" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>
  </Style>
  <Style ss:ID="NoCumple">
   <Font ss:Bold="1" ss:Color="#A94442"/>
   <Interior ss:Color="#FCE4D6" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Top"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Checklist Hito 6">
  <Table>
   <Column ss:Width="250"/>
   <Column ss:Width="250"/>
   <Column ss:Width="300"/>
   <Column ss:Width="250"/>
   <Column ss:Width="100"/>
   ${excelRow(["Fecha de Entrega Inicial", projectInfo.fechaEntregaInicial || ""], "CellData")}
   ${excelRow(["Fecha de Entrega con Correcciones", projectInfo.fechaEntregaCorrecciones || ""], "CellData")}
   ${excelRow([], "CellData")}
   ${excelRow(["Sección", "Subsección", "Item", "Subitem", "Cumplido"], "Header")}
   ${detailRowsXml.join("\n")}
  </Table>
 </Worksheet>
</Workbook>`;
}
