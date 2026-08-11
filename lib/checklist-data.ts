export const STATUS_VALUES = [
  "Pendiente",
  "Cumple",
  "Cumple parcial",
  "No cumple",
  "N/A",
] as const;

export type ChecklistStatus = (typeof STATUS_VALUES)[number];

export const DELIVERY_VALUES = [
  "Sin registrar",
  "Entrego",
  "No entrego",
] as const;

export type DeliveryStatus = (typeof DELIVERY_VALUES)[number];

export type ChecklistField = {
  id: string;
  group:
    | "General"
    | "Diagnostico"
    | "Interlocuciones"
    | "Zona Urbana"
    | "Zona Rural"
    | "Planos PDF"
    | "Planos MXD"
    | "Metadatos";
  section?: string;
  label: string;
  legacyId?: string;
};

export type ChecklistRecord = {
  id: string;
  oferente: string;
  municipio: string;
  deliveryStatus: DeliveryStatus;
  checks: Record<string, ChecklistStatus>;
  fieldObservations?: Record<string, string>;
  fieldEvidence?: Record<string, string>;
  observations: string;
  updatedAt: string | null;
};

export type RecordStage =
  | "Pendiente"
  | "Parcial"
  | "Con pendientes"
  | "Completo";

export const GROUP_ORDER: ChecklistField["group"][] = [
  "General",
  "Planos PDF",
  "Planos MXD",
  "Diagnostico",
  "Interlocuciones",
  "Zona Urbana",
  "Zona Rural",
  "Metadatos",
];

export type SubgroupDef = {
  title: string;
  filter: (field: ChecklistField) => boolean;
};

export type MasterCategory = {
  title: string;
  subgroups: SubgroupDef[];
};

export const MASTER_CATEGORIES: MasterCategory[] = [
  {
    title: "Documentación",
    subgroups: [
      {
        title: "Diagnóstico",
        filter: (f) => f.group === "Diagnostico" && f.section === "Diagnostico",
      },
      {
        title: "Plan de trabajo",
        filter: (f) => f.group === "Diagnostico" && f.section === "Plan de Trabajo",
      },
      {
        title: "PGAS",
        filter: (f) => f.group === "Diagnostico" && f.section === "PGAS",
      },
      {
        title: "Plan de calidad",
        filter: (f) => f.group === "Diagnostico" && f.section === "PLAN DE CALIDAD",
      },
      {
        title: "Zona Urbana",
        filter: (f) => f.group === "Zona Urbana",
      },
      {
        title: "Zona Rural",
        filter: (f) => f.group === "Zona Rural",
      },
    ],
  },
  {
    title: "Componente Social",
    subgroups: [
      {
        title: "Nivel 1",
        filter: (f) => f.group === "Interlocuciones" && f.section === "Nivel 1",
      },
      {
        title: "Nivel 2",
        filter: (f) => f.group === "Interlocuciones" && f.section === "Nivel 2",
      },
      {
        title: "Nivel 3",
        filter: (f) => f.group === "Interlocuciones" && f.section === "Nivel 3",
      },
      {
        title: "Nivel 4",
        filter: (f) => f.group === "Interlocuciones" && f.section === "Nivel 4",
      },
    ],
  },
  {
    title: "Componente Cartográfico",
    subgroups: [
      {
        title: "Planos MXD",
        filter: (f) => f.group === "Planos MXD",
      },
      {
        title: "Planos PDF",
        filter: (f) => f.group === "Planos PDF",
      },
      {
        title: "Metadatos",
        filter: (f) => f.group === "Metadatos",
      },
    ],
  },
];

export const CHECKLIST_FIELDS: ChecklistField[] = [
  {
    id: "general_estructura_general",
    group: "General",
    label: "Estructura general",
  },
  {
    id: "mxd_estructura_interna",
    group: "Planos MXD",
    label: "Estructura interna",
  },
  {
    id: "mxd_planos_mxd",
    group: "Planos MXD",
    label: "Planos MXD",
    legacyId: "mxd_planos_pdf",
  },
  {
    id: "mxd_planos_manzaneros",
    group: "Planos MXD",
    label: "Planos manzaneros",
  },
  {
    id: "mxd_planos_prediales_2000",
    group: "Planos MXD",
    label: "Planos prediales 2000",
  },
  {
    id: "mxd_planos_prediales_10000",
    group: "Planos MXD",
    label: "Planos prediales 10000",
  },
  {
    id: "mxd_planos_zhf_2000",
    group: "Planos MXD",
    label: "Planos ZHF 2000",
  },
  {
    id: "mxd_planos_zhf_10000",
    group: "Planos MXD",
    label: "Planos ZHF 10000",
  },
  {
    id: "mxd_planos_zhe_2000",
    group: "Planos MXD",
    label: "Planos ZHE 2000",
  },
  {
    id: "mxd_planos_zhe_10000",
    group: "Planos MXD",
    label: "Planos ZHE 10000",
  },
  {
    id: "mxd_planos_ortofoto_2000",
    group: "Planos MXD",
    label: "Planos ortofoto 2000",
  },
  {
    id: "mxd_planos_ortofoto_10000",
    group: "Planos MXD",
    label: "Planos ortofoto 10000",
  },
  {
    id: "pdf_estructura_interna",
    group: "Planos PDF",
    label: "Estructura interna",
  },
  { id: "pdf_planos_pdf", group: "Planos PDF", label: "Planos PDF" },
  {
    id: "pdf_planos_manzaneros",
    group: "Planos PDF",
    label: "Planos manzaneros",
  },
  {
    id: "pdf_planos_prediales_2000",
    group: "Planos PDF",
    label: "Planos prediales 2000",
  },
  {
    id: "pdf_planos_prediales_10000",
    group: "Planos PDF",
    label: "Planos prediales 10000",
  },
  {
    id: "pdf_planos_zhf_2000",
    group: "Planos PDF",
    label: "Planos ZHF 2000",
  },
  {
    id: "pdf_planos_zhf_10000",
    group: "Planos PDF",
    label: "Planos ZHF 10000",
  },
  {
    id: "pdf_planos_zhe_2000",
    group: "Planos PDF",
    label: "Planos ZHE 2000",
  },
  {
    id: "pdf_planos_zhe_10000",
    group: "Planos PDF",
    label: "Planos ZHE 10000",
  },
  {
    id: "pdf_planos_ortofoto_2000",
    group: "Planos PDF",
    label: "Planos ortofoto 2000",
  },
  {
    id: "pdf_planos_ortofoto_10000",
    group: "Planos PDF",
    label: "Planos ortofoto 10000",
  },
  {
    id: "diagnostico_documento",
    group: "Diagnostico",
    section: "Diagnostico",
    label: "Documento Diagnostico",
    legacyId: "documento_diagnostico",
  },
  {
    id: "diagnostico_oficio_aprobacion",
    group: "Diagnostico",
    section: "Diagnostico",
    label: "Oficio de aprobación",
    legacyId: "documento_diagnostico_a_1_2",
  },
  {
    id: "diagnostico_anexos",
    group: "Diagnostico",
    section: "Diagnostico",
    label: "Anexos",
    legacyId: "documento_diagnostico_a_1_3",
  },
  {
    id: "plan_trabajo_documento",
    group: "Diagnostico",
    section: "Plan de Trabajo",
    label: "Documento plan de trabajo",
    legacyId: "plan_trabajo",
  },
  {
    id: "plan_trabajo_oficio_aprobacion",
    group: "Diagnostico",
    section: "Plan de Trabajo",
    label: "Oficio de aprobación",
    legacyId: "plan_trabajo",
  },
  {
    id: "plan_trabajo_cronograma_inicial",
    group: "Diagnostico",
    section: "Plan de Trabajo",
    label: "Cronograma Inicial",
  },
  {
    id: "plan_trabajo_cronograma_otrosi_01",
    group: "Diagnostico",
    section: "Plan de Trabajo",
    label: "Cronograma Otrosí",
  },
  {
    id: "plan_trabajo_anexos",
    group: "Diagnostico",
    section: "Plan de Trabajo",
    label: "Anexos",
    legacyId: "plan_trabajo_otros_anexos",
  },
  {
    id: "pgas_documento",
    group: "Diagnostico",
    section: "PGAS",
    label: "Documento PGAS",
    legacyId: "pgas",
  },
  {
    id: "pgas_oficio_aprobacion",
    group: "Diagnostico",
    section: "PGAS",
    label: "Oficio de aprobación",
    legacyId: "pgas_a_3_2",
  },
  {
    id: "pgas_anexos",
    group: "Diagnostico",
    section: "PGAS",
    label: "Anexos",
    legacyId: "pgas_a_3_3",
  },
  {
    id: "plan_calidad_documento",
    group: "Diagnostico",
    section: "PLAN DE CALIDAD",
    label: "Documento del plan de calidad",
    legacyId: "plan_calidad",
  },
  {
    id: "plan_calidad_oficio_aprobacion",
    group: "Diagnostico",
    section: "PLAN DE CALIDAD",
    label: "Oficio de aprobación",
    legacyId: "plan_calidad_a_4_2",
  },
  {
    id: "plan_calidad_anexos",
    group: "Diagnostico",
    section: "PLAN DE CALIDAD",
    label: "Anexos",
    legacyId: "plan_calidad_a_4_3",
  },
  {
    id: "interlocucion_n1_informe_resultados",
    group: "Interlocuciones",
    section: "Nivel 1",
    label: "Informe de resultados",
    legacyId: "informe_interlocucion_nivel_1",
  },
  {
    id: "interlocucion_n1_acta_reunion",
    group: "Interlocuciones",
    section: "Nivel 1",
    label: "Acta de reunión",
    legacyId: "informe_interlocucion_nivel_1",
  },
  {
    id: "interlocucion_n1_listado_asistencia",
    group: "Interlocuciones",
    section: "Nivel 1",
    label: "Listado de asistencia",
    legacyId: "informe_interlocucion_nivel_1",
  },
  {
    id: "interlocucion_n1_registro_fotografico",
    group: "Interlocuciones",
    section: "Nivel 1",
    label: "Registro fotográfico",
    legacyId: "informe_interlocucion_nivel_1",
  },
  {
    id: "interlocucion_n1_otros_anexos",
    group: "Interlocuciones",
    section: "Nivel 1",
    label: "Otros anexos",
    legacyId: "informe_interlocucion_nivel_1",
  },
  {
    id: "interlocucion_n2_informe_resultados",
    group: "Interlocuciones",
    section: "Nivel 2",
    label: "Informe de resultados",
    legacyId: "informe_interlocucion_nivel_2",
  },
  {
    id: "interlocucion_n2_acta_reunion",
    group: "Interlocuciones",
    section: "Nivel 2",
    label: "Acta de reunión",
    legacyId: "informe_interlocucion_nivel_2",
  },
  {
    id: "interlocucion_n2_listado_asistencia",
    group: "Interlocuciones",
    section: "Nivel 2",
    label: "Listado de asistencia",
    legacyId: "informe_interlocucion_nivel_2",
  },
  {
    id: "interlocucion_n2_registro_fotografico",
    group: "Interlocuciones",
    section: "Nivel 2",
    label: "Registro fotográfico",
    legacyId: "informe_interlocucion_nivel_2",
  },
  {
    id: "interlocucion_n2_otros_anexos",
    group: "Interlocuciones",
    section: "Nivel 2",
    label: "Otros anexos",
    legacyId: "informe_interlocucion_nivel_2",
  },
  {
    id: "interlocucion_n3_informe_resultados",
    group: "Interlocuciones",
    section: "Nivel 3",
    label: "Informe de resultados",
    legacyId: "informe_interlocucion_nivel_3",
  },
  {
    id: "interlocucion_n3_acta_reunion",
    group: "Interlocuciones",
    section: "Nivel 3",
    label: "Acta de reunión",
    legacyId: "informe_interlocucion_nivel_3",
  },
  {
    id: "interlocucion_n3_listado_asistencia",
    group: "Interlocuciones",
    section: "Nivel 3",
    label: "Listado de asistencia",
    legacyId: "informe_interlocucion_nivel_3",
  },
  {
    id: "interlocucion_n3_registro_fotografico",
    group: "Interlocuciones",
    section: "Nivel 3",
    label: "Registro fotográfico",
    legacyId: "informe_interlocucion_nivel_3",
  },
  {
    id: "interlocucion_n3_otros_anexos",
    group: "Interlocuciones",
    section: "Nivel 3",
    label: "Otros anexos",
    legacyId: "informe_interlocucion_nivel_3",
  },
  {
    id: "interlocucion_n4_informe_resultados",
    group: "Interlocuciones",
    section: "Nivel 4",
    label: "Informe de resultados",
    legacyId: "informe_interlocucion_nivel_4",
  },
  {
    id: "interlocucion_n4_acta_reunion",
    group: "Interlocuciones",
    section: "Nivel 4",
    label: "Acta de reunión",
    legacyId: "informe_interlocucion_nivel_4",
  },
  {
    id: "interlocucion_n4_listado_asistencia",
    group: "Interlocuciones",
    section: "Nivel 4",
    label: "Listado de asistencia",
    legacyId: "informe_interlocucion_nivel_4",
  },
  {
    id: "interlocucion_n4_registro_fotografico",
    group: "Interlocuciones",
    section: "Nivel 4",
    label: "Registro fotográfico",
    legacyId: "informe_interlocucion_nivel_4",
  },
  {
    id: "interlocucion_n4_otros_anexos",
    group: "Interlocuciones",
    section: "Nivel 4",
    label: "Otros anexos",
    legacyId: "informe_interlocucion_nivel_4",
  },
  {
    id: "urbana_registro_fotografico",
    group: "Zona Urbana",
    label: "Registro Fotográfico",
  },
  {
    id: "urbana_base_datos_catastral",
    group: "Zona Urbana",
    label: "Base de datos Catastral",
    legacyId: "urbana_alfanumerico",
  },
  { id: "urbana_metadatos", group: "Zona Urbana", label: "Metadatos" },
  {
    id: "urbana_saldos_mutacion",
    group: "Zona Urbana",
    label: "Saldos de Mutación",
    legacyId: "urbana_reporte_saldos_mutacion",
  },
  {
    id: "rural_registro_fotografico",
    group: "Zona Rural",
    label: "Registro Fotográfico",
  },
  {
    id: "rural_base_datos_catastral",
    group: "Zona Rural",
    label: "Base de datos Catastral",
    legacyId: "rural_alfanumerico",
  },
  { id: "rural_metadatos", group: "Zona Rural", label: "Metadatos" },
  {
    id: "rural_saldos_mutacion",
    group: "Zona Rural",
    label: "Saldos de Mutación",
    legacyId: "rural_reporte_saldos_mutacion",
  },
  {
    id: "metadatos",
    group: "Metadatos",
    label: "Metadatos",
  },
];

export const OPERATORS_MUNICIPALITIES = [
  ["AMUNORTE", "ALEJANDRIA"],
  ["AMUNORTE", "BETANIA"],
  ["AMUNORTE", "CISNEROS"],
  ["AMUNORTE", "CIUDAD BOLIVAR"],
  ["AMUNORTE", "LA PINTADA"],
  ["AMUNORTE", "SANTA FE DE ANTIOQUIA"],
  ["AMUNORTE", "SANTA ROSA DE OSOS"],
  ["ARBITRIUM SAS", "ARBOLETES"],
  ["ARBITRIUM SAS", "NECOCLI"],
  ["ARBITRIUM SAS", "SAN JUAN DE URABA"],
  ["ARBITRIUM SAS", "SAN PEDRO DE URABA"],
  ["CADEC", "ARMENIA"],
  ["CADEC", "JERICO"],
  ["CADEC", "URRAO"],
  ["CADEC", "VENECIA"],
  ["ENINCO SAS", "CAUCASIA"],
  ["FLY NORTH SAS", "AMALFI"],
  ["FUNDACION FORJANDO FUTURO FF", "OLAYA"],
  ["GEOSAT", "LA CEJA"],
  ["GEOSAT", "SOPETRAN"],
  ["GREEM OAK SAS", "ABEJORRAL"],
  ["INCACIF", "PUERTO BERRIO"],
  ["INCACIF", "PUERTO TRIUNFO"],
  ["JORGE ELIECER GAITAN", "COCORNA"],
  ["JORGE ELIECER GAITAN", "GUATAPE"],
  ["JORGE ELIECER GAITAN", "SAN CARLOS"],
  ["JORGE ELIECER GAITAN", "SAN RAFAEL"],
  ["PCC", "EL SANTUARIO"],
  ["PCC", "GUARNE"],
  ["SICO", "AMAGA"],
  ["SICO", "APARTADO"],
  ["TOPOCARTO", "CAREPA"],
  ["TOPOCARTO", "CHIGORODO"],
  ["UT GESTION DEL TERRITORIO", "DON MATIAS"],
  ["UT GESTION DEL TERRITORIO", "ENTRERRIOS"],
  ["UT GESTION DEL TERRITORIO", "LA UNION"],
  ["UT GESTION DEL TERRITORIO", "SAN PEDRO DE LOS MILAGROS"],
  ["UT GESTION DEL TERRITORIO", "SONSON"],
  ["UT GESTION DEL TERRITORIO", "YARUMAL"],
] as const;

export function createDefaultChecks(): Record<string, ChecklistStatus> {
  return Object.fromEntries(
    CHECKLIST_FIELDS.map((field) => [field.id, "Pendiente"]),
  );
}

export function createInitialRecords(): ChecklistRecord[] {
  return OPERATORS_MUNICIPALITIES.map(([oferente, municipio], index) => ({
    id: `CHK-${String(index + 1).padStart(3, "0")}`,
    oferente,
    municipio,
    deliveryStatus: "Sin registrar",
    checks: createDefaultChecks(),
    fieldObservations: {},
    fieldEvidence: {},
    observations: "",
    updatedAt: null,
  }));
}

export function isChecklistStatus(value: unknown): value is ChecklistStatus {
  return (
    typeof value === "string" &&
    STATUS_VALUES.includes(value as ChecklistStatus)
  );
}

export function normalizeChecklistStatus(
  value: unknown,
): ChecklistStatus | null {
  if (value === "No aplica") {
    return "N/A";
  }

  return isChecklistStatus(value) ? value : null;
}

export function readChecklistFieldStatus(
  checks: Record<string, unknown>,
  field: ChecklistField,
): ChecklistStatus | null {
  return (
    normalizeChecklistStatus(checks[field.id]) ??
    (field.legacyId ? normalizeChecklistStatus(checks[field.legacyId]) : null)
  );
}

export function isDeliveryStatus(value: unknown): value is DeliveryStatus {
  return (
    typeof value === "string" &&
    DELIVERY_VALUES.includes(value as DeliveryStatus)
  );
}

export function calculateRecordProgress(record: ChecklistRecord) {
  const statuses = CHECKLIST_FIELDS.map(
    (field) => record.checks[field.id] ?? "Pendiente",
  );
  const applicable = statuses.filter((status) => status !== "N/A");
  const completed = applicable.filter((status) => status === "Cumple").length;
  const partialCount = applicable.filter(
    (status) => status === "Cumple parcial",
  ).length;
  const pending = applicable.filter((status) => status === "Pendiente").length;
  const failed = applicable.filter((status) => status === "No cumple").length;
  const effectiveCompleted = completed + partialCount * 0.5;
  const percent = applicable.length
    ? Math.round((effectiveCompleted / applicable.length) * 100)
    : 100;

  let stage: RecordStage = "Pendiente";
  if (percent === 100) {
    stage = "Completo";
  } else if (failed > 0) {
    stage = "Con pendientes";
  } else if (completed > 0 || partialCount > 0) {
    stage = "Parcial";
  }

  return {
    applicable: applicable.length,
    completed,
    partialCount,
    failed,
    pending,
    percent,
    stage,
  };
}

export function mergeImportedRecords(input: unknown): ChecklistRecord[] {
  const payload =
    input && typeof input === "object" && "records" in input
      ? (input as { records?: unknown }).records
      : input;
  const incoming = Array.isArray(payload) ? payload : [];
  const baseRecords = createInitialRecords();
  const byId = new Map<string, unknown>();
  const byNaturalKey = new Map<string, unknown>();

  for (const value of incoming) {
    if (!value || typeof value !== "object") {
      continue;
    }
    const record = value as Record<string, unknown>;
    if (typeof record.id === "string") {
      byId.set(record.id, value);
    }
    if (
      typeof record.oferente === "string" &&
      typeof record.municipio === "string"
    ) {
      byNaturalKey.set(`${record.oferente}||${record.municipio}`, value);
    }
  }

  return baseRecords.map((base) => {
    const raw =
      byId.get(base.id) ?? byNaturalKey.get(`${base.oferente}||${base.municipio}`);

    if (!raw || typeof raw !== "object") {
      return base;
    }

    const source = raw as Record<string, unknown>;
    const sourceChecks =
      source.checks && typeof source.checks === "object"
        ? (source.checks as Record<string, unknown>)
        : {};
    const checks = { ...base.checks };

    for (const field of CHECKLIST_FIELDS) {
      const status = readChecklistFieldStatus(sourceChecks, field);
      if (status) {
        checks[field.id] = status;
      }
    }

    const fieldObservations =
      source.fieldObservations && typeof source.fieldObservations === "object"
        ? (source.fieldObservations as Record<string, string>)
        : source.field_observations && typeof source.field_observations === "object"
          ? (source.field_observations as Record<string, string>)
          : {};

    const fieldEvidence =
      source.fieldEvidence && typeof source.fieldEvidence === "object"
        ? (source.fieldEvidence as Record<string, string>)
        : source.field_evidence && typeof source.field_evidence === "object"
          ? (source.field_evidence as Record<string, string>)
          : {};

    return {
      ...base,
      deliveryStatus: isDeliveryStatus(source.deliveryStatus)
        ? source.deliveryStatus
        : isDeliveryStatus(source.delivery_status)
          ? source.delivery_status
          : "Sin registrar",
      checks,
      fieldObservations,
      fieldEvidence,
      observations:
        typeof source.observations === "string" ? source.observations : "",
      updatedAt: typeof source.updatedAt === "string" ? source.updatedAt : null,
    };
  });
}
