"use client";

import type { ChangeEvent, FormEvent } from "react";
import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { generateOficioDocxBlob } from "../lib/docx-generator";
import {
  CHECKLIST_FIELDS,
  DELIVERY_VALUES,
  MASTER_CATEGORIES,
  STATUS_VALUES,
  calculateRecordProgress,
  createInitialRecords,
  isDeliveryStatus,
  mergeImportedRecords,
  type ChecklistRecord,
  type ChecklistField,
  type ChecklistStatus,
  type DeliveryStatus,
  type RecordStage,
} from "../lib/checklist-data";

const STORAGE_KEY = "hito6-checklist-dashboard-v2";
const ALL_OPERATORS = "Todos los operadores";
const ALL_STAGES = "Todos los estados";
const ALL_DELIVERIES = "Todas las entregas";

const CHECKLIST_LAYOUT_COLUMNS: ChecklistField["group"][][] = [
  ["General", "Planos MXD", "Metadatos"],
  ["Planos PDF"],
  ["Diagnostico"],
  ["Interlocuciones"],
  ["Zona Urbana"],
  ["Zona Rural"],
];

type StorageMode = "cloud" | "local";
type AuthState = "checking" | "authenticated" | "anonymous";

const STATUS_META: Record<
  ChecklistStatus,
  { className: string; shortLabel: string }
> = {
  Pendiente: { className: "status-pending", shortLabel: "Pendiente" },
  Cumple: { className: "status-complete", shortLabel: "Cumple" },
  "Cumple parcial": { className: "status-partial", shortLabel: "Parcial" },
  "No cumple": { className: "status-failed", shortLabel: "No cumple" },
  "N/A": { className: "status-muted", shortLabel: "N/A" },
};

const DISPLAY_STATUS_VALUES = STATUS_VALUES.filter(
  (value) => value !== "Pendiente",
);

const STAGE_META: Record<RecordStage, { className: string; label: string }> = {
  Pendiente: { className: "stage-pending", label: "Pendiente" },
  Parcial: { className: "stage-partial", label: "Parcial" },
  "Con pendientes": { className: "stage-failed", label: "Con pendientes" },
  Completo: { className: "stage-complete", label: "Completo" },
};

const DELIVERY_META: Record<
  DeliveryStatus,
  { className: string; label: string; shortLabel: string }
> = {
  "Sin registrar": {
    className: "delivery-unknown",
    label: "Sin registrar",
    shortLabel: "Sin registrar",
  },
  Entrego: {
    className: "delivery-yes",
    label: "Entrego informacion",
    shortLabel: "Entrego",
  },
  "No entrego": {
    className: "delivery-no",
    label: "No entrego informacion",
    shortLabel: "No entrego",
  },
};

// SVG Icons
function IconBrand({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function IconExcel({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M8 13l3 4" />
      <path d="M11 13l-3 4" />
    </svg>
  );
}

function IconDownload({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconUpload({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function IconRefresh({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

function IconLogOut({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconSearch({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconCheck({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconBuilding({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}

function IconCheckCircle({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function IconAlertTriangle({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function IconClock({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function IconMessageSquare({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconCamera({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function IconTrash({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function IconEye({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconX({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function progressStyle(value: number) {
  return { "--progress": `${value}%` } as CSSProperties;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Sin cambios";
  }
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function fieldReportLabel(field: ChecklistField) {
  return [field.group, field.section, field.label].filter(Boolean).join(" - ");
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
  return `<Row>${values.map((value) => excelCell(value, styleId)).join("")}</Row>`;
}



function buildCsv(records: ChecklistRecord[]) {
  const header = [
    "ID",
    "Oferente",
    "Municipio",
    "Entrega de informacion",
    ...CHECKLIST_FIELDS.map(fieldReportLabel),
    "Observaciones",
    "Porcentaje cumplimiento",
    "Estado general",
    "Ultima actualizacion",
  ];

  const rows = records.map((record) => {
    const progress = calculateRecordProgress(record);
    return [
      record.id,
      record.oferente,
      record.municipio,
      record.deliveryStatus,
      ...CHECKLIST_FIELDS.map(
        (field) => record.checks[field.id] ?? "Pendiente",
      ),
      record.observations,
      `${progress.percent}%`,
      progress.stage,
      record.updatedAt ?? "",
    ];
  });

  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

function totalStats(records: ChecklistRecord[]) {
  const municipalityStats = records.map(calculateRecordProgress);
  const statusValues = records.flatMap((record) =>
    CHECKLIST_FIELDS.map((field) => record.checks[field.id] ?? "Pendiente"),
  );
  const applicableStatuses = statusValues.filter(
    (status) => status !== "N/A",
  );
  const completedItems = applicableStatuses.filter(
    (status) => status === "Cumple",
  ).length;
  const partialItems = applicableStatuses.filter(
    (status) => status === "Cumple parcial",
  ).length;
  const failedItems = applicableStatuses.filter(
    (status) => status === "No cumple",
  ).length;
  const pendingItems = applicableStatuses.filter(
    (status) => status === "Pendiente",
  ).length;
  const effectiveCompleted = completedItems + partialItems * 0.5;
  const percent = applicableStatuses.length
    ? Math.round((effectiveCompleted / applicableStatuses.length) * 100)
    : 100;

  return {
    percent,
    totalMunicipalities: records.length,
    deliveredMunicipalities: records.filter(
      (record) => record.deliveryStatus === "Entrego",
    ).length,
    notDeliveredMunicipalities: records.filter(
      (record) => record.deliveryStatus === "No entrego",
    ).length,
    unregisteredDeliveryMunicipalities: records.filter(
      (record) => record.deliveryStatus === "Sin registrar",
    ).length,
    completedMunicipalities: municipalityStats.filter(
      (item) => item.stage === "Completo",
    ).length,
    partialMunicipalities: municipalityStats.filter(
      (item) => item.stage === "Parcial",
    ).length,
    failedMunicipalities: municipalityStats.filter(
      (item) => item.stage === "Con pendientes",
    ).length,
    pendingMunicipalities: municipalityStats.filter(
      (item) => item.stage === "Pendiente",
    ).length,
    completedItems,
    failedItems,
    pendingItems,
    applicableItems: applicableStatuses.length,
  };
}

function summarizeOperators(records: ChecklistRecord[]) {
  const operators = Array.from(
    new Set(records.map((record) => record.oferente)),
  ).sort();

  return operators.map((operator) => {
    const municipalityRecords = records.filter(
      (record) => record.oferente === operator,
    );
    const progress = municipalityRecords.map(calculateRecordProgress);
    const percent = progress.length
      ? Math.round(
          progress.reduce((sum, item) => sum + item.percent, 0) /
            progress.length,
        )
      : 0;

    return {
      operator,
      total: municipalityRecords.length,
      percent,
      completed: progress.filter((item) => item.stage === "Completo").length,
      partial: progress.filter((item) => item.stage === "Parcial").length,
      failed: progress.filter((item) => item.stage === "Con pendientes").length,
      pending: progress.filter((item) => item.stage === "Pendiente").length,
      delivered: municipalityRecords.filter(
        (record) => record.deliveryStatus === "Entrego",
      ).length,
      notDelivered: municipalityRecords.filter(
        (record) => record.deliveryStatus === "No entrego",
      ).length,
      unregistered: municipalityRecords.filter(
        (record) => record.deliveryStatus === "Sin registrar",
      ).length,
    };
  });
}

function formatRecordObservations(record: ChecklistRecord) {
  const parts: string[] = [];
  if (record.observations?.trim()) {
    parts.push(record.observations.trim());
  }
  if (record.fieldObservations) {
    for (const [fieldId, text] of Object.entries(record.fieldObservations)) {
      if (text?.trim()) {
        const fieldObj = CHECKLIST_FIELDS.find((f) => f.id === fieldId);
        const label = fieldObj ? fieldObj.label : fieldId;
        parts.push(`* ${label}: ${text.trim()}`);
      }
    }
  }
  return parts.join(" | ");
}

function mapStatusToExcelLabel(status: ChecklistStatus | undefined) {
  if (status === "Cumple") return "OK";
  if (status === "Cumple parcial") return "PARCIAL";
  if (status === "No cumple") return "NO APROBADO";
  if (status === "N/A") return "N/A";
  return "PENDIENTE";
}

function getStatusStyleId(label: string) {
  if (label === "OK" || label === "Completo" || label === "APROBADO") return "StatusOK";
  if (label === "PARCIAL" || label === "Parcial") return "StatusPartial";
  if (label === "NO APROBADO" || label === "Con pendientes") return "StatusFailed";
  return "StatusPending";
}

function buildExcelReport(records: ChecklistRecord[]) {
  const stats = totalStats(records);
  const generatedAt = new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());
  const operatorRows = summarizeOperators(records);

  const revisionHeader = [
    "Operador",
    "Municipio",
    "Zona",
    "Fecha de entrega Inicial",
    "Aprobación Estructura",
    "Peso carpetas",
    "Aprobación Cartografia",
    "Aprobación Documentación",
    "Fecha de devolución para corrección",
    "Fecha de entrega con correcciones",
    "Observaciones",
    "Aprobación final",
  ];

  const revisionRowsXml = records
    .map((record) => {
      const progress = calculateRecordProgress(record);
      const structStatus = mapStatusToExcelLabel(record.checks["struct_files"]);
      const folderStatus = mapStatusToExcelLabel(record.checks["struct_folders"]);
      const cartoStatus = mapStatusToExcelLabel(record.checks["carto_pdf"]);
      const docStatus = mapStatusToExcelLabel(record.checks["doc_diag"]);

      const finalStatus =
        progress.stage === "Completo"
          ? "OK"
          : progress.stage === "Parcial"
            ? "PARCIAL"
            : progress.stage === "Con pendientes"
              ? "NO APROBADO"
              : "PENDIENTE";

      const dateStr = record.updatedAt
        ? new Date(record.updatedAt).toLocaleDateString("es-CO")
        : record.deliveryStatus === "Entrego"
          ? "Entregado"
          : "Sin registrar";

      const obsStr = formatRecordObservations(record);

      return `<Row>
    ${excelCell(record.oferente, "CellData")}
    ${excelCell(record.municipio, "CellData")}
    ${excelCell("General", "CellData")}
    ${excelCell(dateStr, "CellData")}
    ${excelCell(structStatus, getStatusStyleId(structStatus))}
    ${excelCell(folderStatus, getStatusStyleId(folderStatus))}
    ${excelCell(cartoStatus, getStatusStyleId(cartoStatus))}
    ${excelCell(docStatus, getStatusStyleId(docStatus))}
    ${excelCell(progress.stage === "Completo" ? "N/A" : "Pendiente", "CellData")}
    ${excelCell(record.updatedAt ? new Date(record.updatedAt).toLocaleDateString("es-CO") : "N/A", "CellData")}
    ${excelCell(obsStr, "CellData")}
    ${excelCell(finalStatus, getStatusStyleId(finalStatus))}
  </Row>`;
    })
    .join("\n");

  const detailHeader = [
    "ID",
    "Oferente",
    "Municipio",
    "Entrega de informacion",
    "Porcentaje cumplimiento",
    "Estado general",
    ...CHECKLIST_FIELDS.map(fieldReportLabel),
    "Observaciones Generales",
    "Fotos de Evidencia",
    "Ultima actualizacion",
  ];

  const detailRowsXml = records
    .map((record) => {
      const progress = calculateRecordProgress(record);
      const evidenceCount = Object.keys(record.fieldEvidence ?? {}).length;
      return `<Row>
    ${excelCell(record.id, "CellData")}
    ${excelCell(record.oferente, "CellData")}
    ${excelCell(record.municipio, "CellData")}
    ${excelCell(record.deliveryStatus, "CellData")}
    ${excelCell(`${progress.percent}%`, getStatusStyleId(progress.stage))}
    ${excelCell(progress.stage, getStatusStyleId(progress.stage))}
    ${CHECKLIST_FIELDS.map((field) => {
      const st = record.checks[field.id] ?? "Pendiente";
      return excelCell(st, getStatusStyleId(st));
    }).join("")}
    ${excelCell(formatRecordObservations(record), "CellData")}
    ${excelCell(evidenceCount > 0 ? `${evidenceCount} foto(s)` : "Sin fotos", "CellData")}
    ${excelCell(record.updatedAt ?? "", "CellData")}
  </Row>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
 <Styles>
  <Style ss:ID="Title">
   <Font ss:Bold="1" ss:Size="14" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1F4E78" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Size="10" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#1F4E78" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#D9D9D9"/>
   </Borders>
  </Style>
  <Style ss:ID="CellData">
   <Font ss:Size="10" ss:Color="#000000"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
  </Style>
  <Style ss:ID="StatusOK">
   <Font ss:Bold="1" ss:Size="10" ss:Color="#155724"/>
   <Interior ss:Color="#D4EDDA" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#C3E6CB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#C3E6CB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#C3E6CB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#C3E6CB"/>
   </Borders>
  </Style>
  <Style ss:ID="StatusPartial">
   <Font ss:Bold="1" ss:Size="10" ss:Color="#856404"/>
   <Interior ss:Color="#FFF3CD" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FFEEBA"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FFEEBA"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FFEEBA"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#FFEEBA"/>
   </Borders>
  </Style>
  <Style ss:ID="StatusFailed">
   <Font ss:Bold="1" ss:Size="10" ss:Color="#721C24"/>
   <Interior ss:Color="#F8D7DA" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F5C6CB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F5C6CB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F5C6CB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#F5C6CB"/>
   </Borders>
  </Style>
  <Style ss:ID="StatusPending">
   <Font ss:Size="10" ss:Color="#6C757D"/>
   <Interior ss:Color="#F8F9FA" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E9ECEF"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E9ECEF"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E9ECEF"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E9ECEF"/>
   </Borders>
  </Style>
 </Styles>
 <Worksheet ss:Name="Revisión Hito 6">
  <Table>
   ${excelRow(revisionHeader, "Header")}
   ${revisionRowsXml}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Detalle Completo">
  <Table>
   ${excelRow(detailHeader, "Header")}
   ${detailRowsXml}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Resumen por Operador">
  <Table>
   ${excelRow(
     [
       "Oferente",
       "Municipios",
       "Entregaron",
       "No entregaron",
       "Sin registrar",
       "Completos",
       "Parciales",
       "Con pendientes",
       "Pendientes",
       "Avance promedio",
     ],
     "Header",
   )}
   ${operatorRows
     .map((row) =>
       excelRow([
         row.operator,
         row.total,
         row.delivered,
         row.notDelivered,
         row.unregistered,
         row.completed,
         row.partial,
         row.failed,
         row.pending,
         `${row.percent}%`,
       ]),
     )
     .join("")}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Resumen General">
  <Table>
   ${excelRow(["Checklist HITO 6 - Barrido predial"], "Title")}
   ${excelRow(["Generado", generatedAt], "CellData")}
   ${excelRow(["Avance general", `${stats.percent}%`], "CellData")}
   ${excelRow(["Municipios totales", stats.totalMunicipalities], "CellData")}
   ${excelRow(["Entregaron información", stats.deliveredMunicipalities], "CellData")}
   ${excelRow(["No entregaron información", stats.notDeliveredMunicipalities], "CellData")}
   ${excelRow(["Sin registrar entrega", stats.unregisteredDeliveryMunicipalities], "CellData")}
   ${excelRow(["Entregables cumplidos", `${stats.completedItems} de ${stats.applicableItems}`], "CellData")}
  </Table>
 </Worksheet>
</Workbook>`;
}

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [records, setRecords] = useState<ChecklistRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [operatorFilter, setOperatorFilter] = useState(ALL_OPERATORS);
  const [stageFilter, setStageFilter] = useState(ALL_STAGES);
  const [deliveryFilter, setDeliveryFilter] = useState(ALL_DELIVERIES);
  const [search, setSearch] = useState("");
  const [storageMode, setStorageMode] = useState<StorageMode>("cloud");
  const [authState, setAuthState] = useState<AuthState>("checking");
  const [loginUser, setLoginUser] = useState("conestudios");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [message, setMessage] = useState("");
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [openObsFieldId, setOpenObsFieldId] = useState<string | null>(null);
  const [activeEvidenceModalUrl, setActiveEvidenceModalUrl] = useState<string | null>(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>("Documentación");

  const visibleCategories = useMemo(() => {
    return MASTER_CATEGORIES.filter((cat) => cat.title === activeCategoryTab);
  }, [activeCategoryTab]);

  async function loadChecklistRecords() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/checklist", { cache: "no-store" });
      if (response.status === 401) {
        setAuthState("anonymous");
        setRecords([]);
        return;
      }
      if (!response.ok) {
        throw new Error("No se pudo abrir la base del sitio.");
      }
      const data = (await response.json()) as { records?: unknown };
      setRecords(mergeImportedRecords(data.records ?? []));
      setStorageMode("cloud");
      setMessage("");
    } catch {
      const saved = localStorage.getItem(STORAGE_KEY);
      const fallback = saved
        ? mergeImportedRecords(JSON.parse(saved))
        : createInitialRecords();
      setRecords(fallback);
      setStorageMode("local");
      setMessage("Modo local activo");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const response = await fetch("/api/auth/session", { cache: "no-store" });
        const data = (await response.json()) as { authenticated?: boolean };
        if (cancelled) {
          return;
        }
        if (data.authenticated) {
          setAuthState("authenticated");
          await loadChecklistRecords();
        } else {
          setAuthState("anonymous");
          setIsLoading(false);
        }
      } catch {
        if (!cancelled) {
          setAuthState("anonymous");
          setIsLoading(false);
        }
      }
    }

    checkSession();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (authState === "authenticated" && records.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ records }));
    }
  }, [authState, records]);

  useEffect(() => {
    if (!records.length) {
      return;
    }
    if (!selectedId || !records.some((record) => record.id === selectedId)) {
      setSelectedId(records[0].id);
    }
  }, [records, selectedId]);

  const operators = useMemo(
    () => Array.from(new Set(records.map((record) => record.oferente))).sort(),
    [records],
  );

  const stats = useMemo(() => totalStats(records), [records]);
  const operatorSummaries = useMemo(() => summarizeOperators(records), [records]);

  const filteredRecords = useMemo(() => {
    const needle = search.trim().toLocaleLowerCase("es-CO");
    return records.filter((record) => {
      const progress = calculateRecordProgress(record);
      const matchesOperator =
        operatorFilter === ALL_OPERATORS || record.oferente === operatorFilter;
      const matchesStage =
        stageFilter === ALL_STAGES || progress.stage === stageFilter;
      const matchesDelivery =
        deliveryFilter === ALL_DELIVERIES ||
        record.deliveryStatus === deliveryFilter;
      const matchesSearch =
        !needle ||
        record.municipio.toLocaleLowerCase("es-CO").includes(needle) ||
        record.oferente.toLocaleLowerCase("es-CO").includes(needle) ||
        record.id.toLocaleLowerCase("es-CO").includes(needle);

      return matchesOperator && matchesStage && matchesDelivery && matchesSearch;
    });
  }, [deliveryFilter, operatorFilter, records, search, stageFilter]);

  const selectedRecord =
    records.find((record) => record.id === selectedId) ?? filteredRecords[0];
  const selectedProgress = selectedRecord
    ? calculateRecordProgress(selectedRecord)
    : null;

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginUser, password: loginPassword }),
      });

      if (!response.ok) {
        throw new Error("Credenciales incorrectas.");
      }

      setAuthState("authenticated");
      setLoginPassword("");
      await loadChecklistRecords();
    } catch {
      setLoginError("Usuario o contrasena incorrectos.");
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    setAuthState("anonymous");
    setRecords([]);
    setMessage("");
  }

  async function saveRecord(nextRecord: ChecklistRecord) {
    setSavingIds((current) => new Set(current).add(nextRecord.id));
    setRecords((current) =>
      current.map((record) =>
        record.id === nextRecord.id ? nextRecord : record,
      ),
    );

    if (storageMode === "local") {
      setSavingIds((current) => {
        const copy = new Set(current);
        copy.delete(nextRecord.id);
        return copy;
      });
      return;
    }

    try {
      const response = await fetch("/api/checklist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: nextRecord.id,
          deliveryStatus: nextRecord.deliveryStatus,
          checks: nextRecord.checks,
          fieldObservations: nextRecord.fieldObservations,
          fieldEvidence: nextRecord.fieldEvidence,
          observations: nextRecord.observations,
        }),
      });

      if (response.status === 401) {
        setAuthState("anonymous");
        throw new Error("Sesion expirada.");
      }
      if (!response.ok) {
        throw new Error("No se pudo guardar.");
      }

      const data = (await response.json()) as { record?: ChecklistRecord };
      if (data.record) {
        setRecords((current) =>
          current.map((record) =>
            record.id === data.record?.id ? data.record : record,
          ),
        );
      }
      setMessage("Guardado");
    } catch {
      setStorageMode("local");
      setMessage("Guardado local");
    } finally {
      setSavingIds((current) => {
        const copy = new Set(current);
        copy.delete(nextRecord.id);
        return copy;
      });
    }
  }

  function changeStatus(
    record: ChecklistRecord,
    fieldId: string,
    targetStatus: ChecklistStatus,
  ) {
    const currentStatus = record.checks[fieldId] ?? "Pendiente";
    const nextStatus =
      currentStatus === targetStatus ? "Pendiente" : targetStatus;
    saveRecord({
      ...record,
      checks: { ...record.checks, [fieldId]: nextStatus },
      updatedAt: new Date().toISOString(),
    });
  }

  function changeFieldObservation(
    record: ChecklistRecord,
    fieldId: string,
    value: string,
  ) {
    const updatedObs = { ...(record.fieldObservations ?? {}), [fieldId]: value };
    saveRecord({
      ...record,
      fieldObservations: updatedObs,
      updatedAt: new Date().toISOString(),
    });
  }

  function handleImageUpload(
    record: ChecklistRecord,
    fieldId: string,
    file: Blob | File,
  ) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        const updatedEvidence = {
          ...(record.fieldEvidence ?? {}),
          [fieldId]: dataUrl,
        };
        saveRecord({
          ...record,
          fieldEvidence: updatedEvidence,
          updatedAt: new Date().toISOString(),
        });
        setMessage("Foto guardada correctamente");
        setTimeout(() => setMessage(""), 3000);
      }
    };
    reader.readAsDataURL(file);
  }

  async function handlePasteClipboardImage(
    record: ChecklistRecord,
    fieldId: string,
  ) {
    try {
      if (navigator.clipboard && navigator.clipboard.read) {
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageType = item.types.find((t) => t.startsWith("image/"));
          if (imageType) {
            const blob = await item.getType(imageType);
            handleImageUpload(record, fieldId, blob);
            return;
          }
        }
      }
      alert("Copia una imagen al portapapeles (Ej. captura de pantalla o copiar imagen) y presiona Ctrl + V sobre el elemento.");
    } catch {
      alert("Presiona Ctrl + V sobre la casilla del elemento para pegar la imagen de tu portapapeles.");
    }
  }

  function handleRowPaste(
    record: ChecklistRecord,
    fieldId: string,
    e: React.ClipboardEvent,
  ) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const blob = items[i].getAsFile();
        if (blob) {
          e.preventDefault();
          handleImageUpload(record, fieldId, blob);
          return;
        }
      }
    }
  }

  function removeFieldEvidence(record: ChecklistRecord, fieldId: string) {
    if (
      !window.confirm(
        "¿Está seguro de que desea eliminar esta imagen de evidencia?",
      )
    ) {
      return;
    }
    const copy = { ...(record.fieldEvidence ?? {}) };
    delete copy[fieldId];
    saveRecord({
      ...record,
      fieldEvidence: copy,
      updatedAt: new Date().toISOString(),
    });
  }

  function changeDeliveryStatus(
    record: ChecklistRecord,
    deliveryStatus: DeliveryStatus,
  ) {
    saveRecord({
      ...record,
      deliveryStatus,
      updatedAt: new Date().toISOString(),
    });
  }

  function updateObservation(record: ChecklistRecord, value: string) {
    setRecords((current) =>
      current.map((item) =>
        item.id === record.id
          ? { ...item, observations: value, updatedAt: new Date().toISOString() }
          : item,
      ),
    );
  }

  function commitObservation(record: ChecklistRecord) {
    const latest = records.find((item) => item.id === record.id);
    if (latest) {
      saveRecord(latest);
    }
  }

  function markAll(record: ChecklistRecord, status: ChecklistStatus) {
    saveRecord({
      ...record,
      checks: Object.fromEntries(
        CHECKLIST_FIELDS.map((field) => [field.id, status]),
      ) as Record<string, ChecklistStatus>,
      updatedAt: new Date().toISOString(),
    });
  }

  function markGroup(
    record: ChecklistRecord,
    group: ChecklistField["group"],
    status: ChecklistStatus,
  ) {
    const nextChecks = { ...record.checks };
    for (const field of CHECKLIST_FIELDS) {
      if (field.group === group) {
        nextChecks[field.id] = status;
      }
    }

    saveRecord({
      ...record,
      checks: nextChecks,
      updatedAt: new Date().toISOString(),
    });
  }

  function markSubgroup(
    record: ChecklistRecord,
    fields: ChecklistField[],
    targetStatus: ChecklistStatus,
  ) {
    const nextChecks = { ...record.checks };
    for (const field of fields) {
      nextChecks[field.id] = targetStatus;
    }

    saveRecord({
      ...record,
      checks: nextChecks,
      updatedAt: new Date().toISOString(),
    });
  }

  async function resetData() {
    if (
      !window.confirm(
        "Restablecer todos los municipios a Pendiente y sin registro de entrega?",
      )
    ) {
      return;
    }

    const initial = createInitialRecords();
    setRecords(initial);
    setSelectedId(initial[0]?.id ?? "");

    if (storageMode === "cloud") {
      try {
        const response = await fetch("/api/checklist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reset" }),
        });
        if (!response.ok) {
          throw new Error("No se pudo restablecer.");
        }
        const data = (await response.json()) as { records?: unknown };
        setRecords(mergeImportedRecords(data.records ?? []));
        setMessage("Restablecido");
      } catch {
        setStorageMode("local");
        setMessage("Restablecido local");
      }
    }
  }

  async function importJson(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const imported = mergeImportedRecords(JSON.parse(text));
      setRecords(imported);
      setSelectedId(imported[0]?.id ?? "");

      if (storageMode === "cloud") {
        const response = await fetch("/api/checklist", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ records: imported }),
        });
        if (!response.ok) {
          throw new Error("No se pudo importar en la base.");
        }
      }

      setMessage("Importado");
    } catch {
      setMessage("Archivo no valido");
    }
  }

  function exportJson() {
    downloadFile(
      "checklist-hito6-barrido-predial.json",
      JSON.stringify({ records }, null, 2),
      "application/json",
    );
  }

  function exportCsv() {
    downloadFile(
      "checklist-hito6-barrido-predial.csv",
      `\uFEFF${buildCsv(records)}`,
      "text/csv;charset=utf-8",
    );
  }

  function exportExcel() {
    downloadFile(
      "reporte-checklist-hito6-barrido-predial.xls",
      buildExcelReport(records),
      "application/vnd.ms-excel;charset=utf-8",
    );
  }

  async function exportDocx() {
    if (!selectedRecord) {
      alert("Por favor selecciona un municipio.");
      return;
    }
    setMessage("Generando Word...");
    try {
      const stateObj: Record<string, any> = {};
      CHECKLIST_FIELDS.forEach((field) => {
        const key = `${field.group}::${field.label}`;
        const isDone = selectedRecord.checks[field.id] === "Cumple";
        stateObj[key] = {
          checked: isDone,
          notes: selectedRecord.fieldObservations?.[field.id] || "",
        };
      });

      const projectInfo = {
        municipio: selectedRecord.municipio,
        operador: selectedRecord.oferente,
        contrato: "151 DE 2024",
        fecha: selectedRecord.updatedAt
          ? new Date(selectedRecord.updatedAt).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      };

      const blob = await generateOficioDocxBlob(projectInfo, stateObj);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `OFCANT-CATS_${selectedRecord.municipio.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_CONCEPTO_HITO_06.docx`;
      anchor.click();
      URL.revokeObjectURL(url);
      setMessage("¡Word descargado!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Error al generar Word:", err);
      setMessage("Error al generar Word");
    }
  }

  if (authState !== "authenticated") {
    return (
      <main className="login-shell">
        <section className="login-card">
          <div className="login-brand">
            <div className="login-brand-icon">
              <IconBrand className="w-6 h-6" />
            </div>
            <div>
              <p className="eyebrow">HITO 6</p>
              <h1>Barrido Predial</h1>
            </div>
          </div>
          <form onSubmit={handleLogin} className="login-form">
            <label>
              <span>Usuario</span>
              <input
                value={loginUser}
                onChange={(event) => setLoginUser(event.target.value)}
                autoComplete="username"
                placeholder="Ingresa tu usuario"
              />
            </label>
            <label>
              <span>Contrasena</span>
              <input
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
              />
            </label>
            {loginError ? <p className="login-error">{loginError}</p> : null}
            <button type="submit" disabled={isLoggingIn || authState === "checking"}>
              {authState === "checking"
                ? "Validando..."
                : isLoggingIn
                  ? "Ingresando..."
                  : "Iniciar sesion"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <div className="brand-icon-wrapper">
            <IconBrand />
          </div>
          <div>
            <p className="eyebrow">HITO 6 - Barrido Predial</p>
            <h1>Checklist de Entregables</h1>
          </div>
        </div>

        <nav style={{ display: "flex", gap: "8px" }}>
          <Link href="/" className="btn-icon btn-primary">
            📋 Checklist General
          </Link>
          <Link href="/validar-hito6" className="btn-icon">
            📑 Validación Anexos HITO 6
          </Link>
        </nav>
        <div className="topbar-actions">
          <span className={`sync-pill ${storageMode}`}>
            <span className="sync-dot" />
            {storageMode === "cloud" ? "Base del sitio" : "Modo local"}
          </span>
          {message ? <span className="save-message">{message}</span> : null}
          <button type="button" className="btn-icon btn-primary" onClick={exportDocx}>
            📄 Oficio Word (.docx)
          </button>
          <button type="button" className="btn-icon btn-primary" onClick={exportExcel}>
            <IconExcel /> Reporte Excel
          </button>
          <button type="button" className="btn-icon" onClick={exportJson}>
            <IconDownload /> JSON
          </button>
          <button type="button" className="btn-icon" onClick={exportCsv}>
            <IconDownload /> CSV
          </button>
          <button type="button" className="btn-icon" onClick={() => fileInputRef.current?.click()}>
            <IconUpload /> Importar
          </button>
          <button type="button" className="btn-icon btn-danger-ghost" onClick={resetData}>
            <IconRefresh /> Restablecer
          </button>
          <button type="button" className="btn-icon" onClick={logout}>
            <IconLogOut /> Salir
          </button>
          <input
            ref={fileInputRef}
            className="hidden-input"
            type="file"
            accept="application/json,.json"
            onChange={importJson}
          />
        </div>
      </header>

      <section className="dashboard-band">
        <article className="score-panel main-score">
          <div className="score-header">
            <span>Avance General</span>
            <IconCheckCircle className="score-icon" />
          </div>
          <strong className="score-value">{isLoading ? "--" : `${stats.percent}%`}</strong>
          <div className="progress-track" style={progressStyle(stats.percent)}>
            <span />
          </div>
          <span className="score-sub">
            {stats.completedItems} de {stats.applicableItems} entregables cumplidos
          </span>
        </article>

        <article className="score-panel">
          <div className="score-header">
            <span>Municipios</span>
            <IconBuilding className="score-icon" />
          </div>
          <strong className="score-value">{stats.totalMunicipalities}</strong>
          <span className="score-sub">{stats.completedMunicipalities} completos</span>
        </article>

        <article className="score-panel">
          <div className="score-header">
            <span>Entregaron Info</span>
            <IconCheckCircle className="score-icon" />
          </div>
          <strong className="score-value">{stats.deliveredMunicipalities}</strong>
          <span className="score-sub">{stats.unregisteredDeliveryMunicipalities} sin registrar</span>
        </article>

        <article className="score-panel">
          <div className="score-header">
            <span>No Entregaron</span>
            <IconAlertTriangle className="score-icon" />
          </div>
          <strong className="score-value">{stats.notDeliveredMunicipalities}</strong>
          <span className="score-sub">por gestionar</span>
        </article>

        <article className="score-panel">
          <div className="score-header">
            <span>Parciales</span>
            <IconClock className="score-icon" />
          </div>
          <strong className="score-value">{stats.partialMunicipalities}</strong>
          <span className="score-sub">en proceso</span>
        </article>

        <article className="score-panel">
          <div className="score-header">
            <span>Con Pendientes</span>
            <IconAlertTriangle className="score-icon" />
          </div>
          <strong className="score-value">{stats.failedMunicipalities}</strong>
          <span className="score-sub">{stats.failedItems} entregables no cumplen</span>
        </article>

        <article className="score-panel">
          <div className="score-header">
            <span>Pendientes</span>
            <IconClock className="score-icon" />
          </div>
          <strong className="score-value">{stats.pendingMunicipalities}</strong>
          <span className="score-sub">{stats.pendingItems} entregables</span>
        </article>
      </section>

      <section className="filters-band" aria-label="Filtros">
        <div className="filter-control">
          <label>Operador</label>
          <select
            value={operatorFilter}
            onChange={(event) => setOperatorFilter(event.target.value)}
          >
            <option>{ALL_OPERATORS}</option>
            {operators.map((operator) => (
              <option key={operator}>{operator}</option>
            ))}
          </select>
        </div>

        <div className="filter-control">
          <label>Estado de Avance</label>
          <select
            value={stageFilter}
            onChange={(event) => setStageFilter(event.target.value)}
          >
            <option>{ALL_STAGES}</option>
            {Object.keys(STAGE_META).map((stage) => (
              <option key={stage}>{stage}</option>
            ))}
          </select>
        </div>

        <div className="filter-control">
          <label>Entrega de Info</label>
          <select
            value={deliveryFilter}
            onChange={(event) => setDeliveryFilter(event.target.value)}
          >
            <option>{ALL_DELIVERIES}</option>
            {DELIVERY_VALUES.map((delivery) => (
              <option key={delivery}>{DELIVERY_META[delivery].label}</option>
            ))}
          </select>
        </div>

        <div className="filter-control">
          <label>Buscar Municipio</label>
          <div className="search-input-wrapper">
            <IconSearch className="search-icon" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Municipio, oferente o ID..."
            />
          </div>
        </div>
      </section>

      <section className="workspace-grid">
        <aside className="municipality-panel">
          <div className="section-heading">
            <h2>Municipios</h2>
            <span className="count-badge">{filteredRecords.length}</span>
          </div>
          <div className="municipality-list">
            {filteredRecords.map((record) => {
              const progress = calculateRecordProgress(record);
              const stage = STAGE_META[progress.stage];
              return (
                <button
                  type="button"
                  key={record.id}
                  className={`municipality-row ${
                    selectedRecord?.id === record.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedId(record.id)}
                >
                  <div className="municipality-main">
                    <strong>{record.municipio}</strong>
                    <small>{record.oferente}</small>
                    <span
                      className={`delivery-chip ${
                        DELIVERY_META[record.deliveryStatus].className
                      }`}
                    >
                      {DELIVERY_META[record.deliveryStatus].shortLabel}
                    </span>
                  </div>
                  <div className="municipality-side">
                    <span className={`stage-chip ${stage.className}`}>
                      {stage.label}
                    </span>
                    <span className="municipality-percent">{progress.percent}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="detail-panel">
          {selectedRecord && selectedProgress ? (
            <>
              <div className="detail-header">
                <div className="detail-header-info">
                  <span className="detail-id-tag">ID: {selectedRecord.id}</span>
                  <h2>{selectedRecord.municipio}</h2>
                  <span className="detail-operator-tag">Oferente: {selectedRecord.oferente}</span>
                  <div className="delivery-select-box">
                    <span>Entrega de info:</span>
                    <select
                      className={
                        DELIVERY_META[selectedRecord.deliveryStatus].className
                      }
                      value={selectedRecord.deliveryStatus}
                      onChange={(event) => {
                        if (isDeliveryStatus(event.target.value)) {
                          changeDeliveryStatus(
                            selectedRecord,
                            event.target.value,
                          );
                        }
                      }}
                    >
                      {DELIVERY_VALUES.map((value) => (
                        <option value={value} key={value}>
                          {DELIVERY_META[value].label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="detail-score-box">
                  <span className="detail-score-value">{selectedProgress.percent}%</span>
                  <span
                    className={`stage-chip ${
                      STAGE_META[selectedProgress.stage].className
                    }`}
                  >
                    {STAGE_META[selectedProgress.stage].label}
                  </span>
                </div>
              </div>

              <div className="detail-actions">
                <button type="button" className="btn-icon" onClick={() => markAll(selectedRecord, "Cumple")}>
                  <IconCheck /> Marcar todos Cumple
                </button>
                <button
                  type="button"
                  className="btn-icon"
                  onClick={() => markAll(selectedRecord, "Pendiente")}
                >
                  <IconRefresh /> Marcar todos Pendiente
                </button>
                <span>
                  {savingIds.has(selectedRecord.id)
                    ? "Guardando cambios..."
                    : `Ultima edicion: ${formatDate(selectedRecord.updatedAt)}`}
                </span>
              </div>

              {/* Seccion General (arriba de las pestañas) */}
              {(() => {
                const generalFields = CHECKLIST_FIELDS.filter(
                  (f) => f.group === "General",
                );
                if (!generalFields.length) return null;

                return (
                  <div className="general-top-section">
                    <section className="check-group">
                      <div className="check-group-header">
                        <h3>
                          General
                          <span className="group-count-pill">
                            {generalFields.length}
                          </span>
                        </h3>
                        <div className="group-actions">
                          <button
                            type="button"
                            className="btn-group-action"
                            onClick={() =>
                              markGroup(selectedRecord, "General", "Cumple")
                            }
                          >
                            Cumple
                          </button>
                          <button
                            type="button"
                            className="btn-group-action"
                            onClick={() =>
                              markGroup(
                                selectedRecord,
                                "General",
                                "Cumple parcial",
                              )
                            }
                          >
                            Parcial
                          </button>
                        </div>
                      </div>
                      <div className="check-table">
                        {generalFields.map((field) => {
                          const status =
                            selectedRecord.checks[field.id] ?? "Pendiente";
                          const obsText =
                            selectedRecord.fieldObservations?.[field.id] || "";
                          const evidenceUrl =
                            selectedRecord.fieldEvidence?.[field.id] || "";
                          const hasObs = Boolean(obsText.trim());
                          const isObsOpen = openObsFieldId === field.id;

                          return (
                            <div className="check-row" key={field.id}>
                              <div className="check-row-header">
                                <span className="check-row-label">
                                  {field.label}
                                </span>
                                <div className="item-action-btns">
                                  <button
                                    type="button"
                                    className={`btn-item-action ${
                                      hasObs ? "active-obs" : ""
                                    }`}
                                    title="Agregar Observacion"
                                    onClick={() =>
                                      setOpenObsFieldId(
                                        isObsOpen ? null : field.id,
                                      )
                                    }
                                  >
                                    <IconMessageSquare />
                                    <span>Nota{hasObs ? " •" : ""}</span>
                                  </button>

                                  <label
                                    className={`btn-item-action ${
                                      evidenceUrl ? "active-evidence" : ""
                                    }`}
                                    title="Subir evidencia en imagen"
                                  >
                                    <IconCamera />
                                    <span>
                                      {evidenceUrl ? "Foto •" : "Foto"}
                                    </span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden-input"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          handleImageUpload(
                                            selectedRecord,
                                            field.id,
                                            file,
                                          );
                                          e.target.value = "";
                                        }
                                      }}
                                    />
                                  </label>
                                </div>
                              </div>

                              <div
                                className="status-options"
                                role="group"
                                aria-label={`Estado de ${field.label}`}
                              >
                                {DISPLAY_STATUS_VALUES.map((value) => (
                                  <button
                                    type="button"
                                    className={`status-option ${
                                      STATUS_META[value].className
                                    } ${status === value ? "selected" : ""}`}
                                    aria-pressed={status === value}
                                    onClick={() =>
                                      changeStatus(
                                        selectedRecord,
                                        field.id,
                                        value,
                                      )
                                    }
                                    key={value}
                                  >
                                    {STATUS_META[value].shortLabel}
                                  </button>
                                ))}
                              </div>

                              {evidenceUrl ? (
                                <div className="item-evidence-bar">
                                  <img
                                    src={evidenceUrl}
                                    alt={`Evidencia de ${field.label}`}
                                    className="item-evidence-thumb"
                                    onClick={() =>
                                      setActiveEvidenceModalUrl(evidenceUrl)
                                    }
                                  />
                                  <div className="item-evidence-controls">
                                    <button
                                      type="button"
                                      className="btn-evidence-view"
                                      onClick={() =>
                                        setActiveEvidenceModalUrl(evidenceUrl)
                                      }
                                    >
                                      <IconEye /> Ver foto
                                    </button>
                                    <button
                                      type="button"
                                      className="btn-evidence-delete"
                                      onClick={() =>
                                        removeFieldEvidence(
                                          selectedRecord,
                                          field.id,
                                        )
                                      }
                                    >
                                      <IconTrash /> Eliminar
                                    </button>
                                  </div>
                                </div>
                              ) : null}

                              {isObsOpen || hasObs ? (
                                <div className="item-obs-container">
                                  <textarea
                                    className="item-obs-textarea"
                                    placeholder={`Observación para ${field.label}...`}
                                    value={obsText}
                                    onChange={(e) =>
                                      changeFieldObservation(
                                        selectedRecord,
                                        field.id,
                                        e.target.value,
                                      )
                                    }
                                  />
                                </div>
                              ) : null}
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  </div>
                );
              })()}

              {/* Category Page Tabs */}
              <div className="category-tabs-nav" role="tablist">
                {MASTER_CATEGORIES.map((cat) => {
                  const isActive = activeCategoryTab === cat.title;
                  const catFields = CHECKLIST_FIELDS.filter((field) =>
                    cat.subgroups.some((sg) => sg.filter(field)),
                  );
                  const catCompleted = catFields.filter(
                    (f) => selectedRecord.checks[f.id] === "Cumple",
                  ).length;
                  const catPartial = catFields.filter(
                    (f) => selectedRecord.checks[f.id] === "Cumple parcial",
                  ).length;

                  return (
                    <button
                      type="button"
                      key={cat.title}
                      role="tab"
                      aria-selected={isActive}
                      className={`category-tab-btn ${isActive ? "active" : ""}`}
                      onClick={() => setActiveCategoryTab(cat.title)}
                    >
                      <span className="tab-title">{cat.title}</span>
                      <span className="tab-badge">
                        {catCompleted + catPartial * 0.5} / {catFields.length}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="check-categories-grid single-page">
                {visibleCategories.map((category) => {
                  const catFields = CHECKLIST_FIELDS.filter((field) =>
                    category.subgroups.some((sg) => sg.filter(field)),
                  );
                  const catCompleted = catFields.filter(
                    (f) => selectedRecord.checks[f.id] === "Cumple",
                  ).length;
                  const catPartial = catFields.filter(
                    (f) => selectedRecord.checks[f.id] === "Cumple parcial",
                  ).length;

                  return (
                    <div className="master-category-column" key={category.title}>
                      <div className="category-header-banner">
                        <div className="category-header-title">
                          <h3>{category.title}</h3>
                          <span className="category-count-badge">
                            {catCompleted + catPartial * 0.5} / {catFields.length}
                          </span>
                        </div>
                      </div>

                      <div className="category-subgroups-list">
                        {category.subgroups.map((subgroup) => {
                          const sgFields = CHECKLIST_FIELDS.filter(subgroup.filter);
                          if (!sgFields.length) return null;

                          return (
                            <section className="check-group" key={subgroup.title}>
                              <div className="check-group-header">
                                <h3>
                                  {subgroup.title}
                                  <span className="group-count-pill">{sgFields.length}</span>
                                </h3>
                                <div className="group-actions">
                                  <button
                                    type="button"
                                    className="btn-group-action"
                                    onClick={() =>
                                      markSubgroup(selectedRecord, sgFields, "Cumple")
                                    }
                                  >
                                    Cumple
                                  </button>
                                  <button
                                    type="button"
                                    className="btn-group-action"
                                    onClick={() =>
                                      markSubgroup(selectedRecord, sgFields, "Cumple parcial")
                                    }
                                  >
                                    Parcial
                                  </button>
                                </div>
                              </div>
                              <div className="check-table">
                                {sgFields.map((field, fieldIndex) => {
                                  const status =
                                    selectedRecord.checks[field.id] ?? "Pendiente";
                                  const obsText =
                                    selectedRecord.fieldObservations?.[field.id] || "";
                                  const evidenceUrl =
                                    selectedRecord.fieldEvidence?.[field.id] || "";
                                  const hasObs = Boolean(obsText.trim());
                                  const isObsOpen = openObsFieldId === field.id;
                                  const showSection =
                                    field.section &&
                                    field.section !== sgFields[fieldIndex - 1]?.section;

                                  return (
                                    <Fragment key={field.id}>
                                      {showSection ? (
                                        <div className="check-section-title">
                                          {field.section}
                                        </div>
                                      ) : null}
                                      <div
                                        className="check-row"
                                        tabIndex={0}
                                        onPaste={(e) => handleRowPaste(selectedRecord, field.id, e)}
                                        title="Haz clic aquí y presiona Ctrl + V para pegar una foto"
                                      >
                                        <div className="check-row-header">
                                          <span className="check-row-label">{field.label}</span>
                                          <div className="item-action-btns">
                                            <button
                                              type="button"
                                              className={`btn-item-action ${
                                                hasObs ? "active-obs" : ""
                                              }`}
                                              title="Agregar Observacion"
                                              onClick={() =>
                                                setOpenObsFieldId(
                                                  isObsOpen ? null : field.id,
                                                )
                                              }
                                            >
                                              <IconMessageSquare />
                                              <span>Nota{hasObs ? " •" : ""}</span>
                                            </button>

                                            <label
                                              className={`btn-item-action ${
                                                evidenceUrl ? "active-evidence" : ""
                                              }`}
                                              title="Subir archivo de foto"
                                            >
                                              <IconCamera />
                                              <span>{evidenceUrl ? "Foto •" : "Subir Foto"}</span>
                                              <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden-input"
                                                onChange={(e) => {
                                                  const file = e.target.files?.[0];
                                                  if (file) {
                                                    handleImageUpload(
                                                      selectedRecord,
                                                      field.id,
                                                      file,
                                                    );
                                                    e.target.value = "";
                                                  }
                                                }}
                                              />
                                            </label>

                                            <button
                                              type="button"
                                              className="btn-item-action"
                                              title="Pegar foto del portapapeles (o presiona Ctrl + V)"
                                              onClick={() =>
                                                handlePasteClipboardImage(
                                                  selectedRecord,
                                                  field.id,
                                                )
                                              }
                                            >
                                              📋 <span>Pegar</span>
                                            </button>
                                          </div>
                                        </div>

                                      <div
                                        className="status-options"
                                        role="group"
                                        aria-label={`Estado de ${field.label}`}
                                      >
                                        {DISPLAY_STATUS_VALUES.map((value) => (
                                          <button
                                            type="button"
                                            className={`status-option ${
                                              STATUS_META[value].className
                                            } ${
                                              status === value ? "selected" : ""
                                            }`}
                                            aria-pressed={status === value}
                                            onClick={() =>
                                              changeStatus(
                                                selectedRecord,
                                                field.id,
                                                value,
                                              )
                                            }
                                            key={value}
                                          >
                                            {STATUS_META[value].shortLabel}
                                          </button>
                                        ))}
                                      </div>

                                      {evidenceUrl ? (
                                        <div className="item-evidence-bar">
                                          <img
                                            src={evidenceUrl}
                                            alt={`Evidencia de ${field.label}`}
                                            className="item-evidence-thumb"
                                            onClick={() =>
                                              setActiveEvidenceModalUrl(evidenceUrl)
                                            }
                                          />
                                          <div className="item-evidence-controls">
                                            <button
                                              type="button"
                                              className="btn-evidence-view"
                                              onClick={() =>
                                                setActiveEvidenceModalUrl(evidenceUrl)
                                              }
                                            >
                                              <IconEye /> Ver foto
                                            </button>
                                            <button
                                              type="button"
                                              className="btn-evidence-delete"
                                              onClick={() =>
                                                removeFieldEvidence(
                                                  selectedRecord,
                                                  field.id,
                                                )
                                              }
                                            >
                                              <IconTrash /> Eliminar
                                            </button>
                                          </div>
                                        </div>
                                      ) : null}

                                      {isObsOpen || hasObs ? (
                                        <div className="item-obs-container">
                                          <textarea
                                            className="item-obs-textarea"
                                            placeholder={`Observación para ${field.label}...`}
                                            value={obsText}
                                            onChange={(e) =>
                                              changeFieldObservation(
                                                selectedRecord,
                                                field.id,
                                                e.target.value,
                                              )
                                            }
                                          />
                                        </div>
                                      ) : null}
                                    </div>
                                  </Fragment>
                                );
                                })}
                              </div>
                            </section>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <label className="observations-box">
                <span>Observaciones del Municipio</span>
                <textarea
                  value={selectedRecord.observations}
                  onChange={(event) =>
                    updateObservation(selectedRecord, event.target.value)
                  }
                  onBlur={() => commitObservation(selectedRecord)}
                  rows={4}
                  placeholder="Agregar comentarios u observaciones relevantes para este municipio..."
                />
              </label>
            </>
          ) : (
            <div className="empty-state">Sin municipios para mostrar</div>
          )}
        </section>
      </section>

      <section className="operators-panel">
        <div className="section-heading">
          <h2>Avance por Operador</h2>
          <span className="count-badge">{operators.length}</span>
        </div>
        <div className="operator-grid">
          {operatorSummaries.map((summary) => (
            <button
              type="button"
              className="operator-card"
              key={summary.operator}
              onClick={() => setOperatorFilter(summary.operator)}
            >
              <div className="operator-card-head">
                <strong>{summary.operator}</strong>
                <em>{summary.percent}%</em>
              </div>
              <div
                className="progress-track compact"
                style={progressStyle(summary.percent)}
              >
                <span />
              </div>
              <span className="operator-meta">
                {summary.total} municipios • {summary.delivered} entregaron •{" "}
                {summary.notDelivered} no entregaron
              </span>
            </button>
          ))}
        </div>
      </section>

      {activeEvidenceModalUrl ? (
        <div className="image-modal-backdrop" onClick={() => setActiveEvidenceModalUrl(null)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="btn-modal-close" onClick={() => setActiveEvidenceModalUrl(null)}>
              <IconX />
            </button>
            <img src={activeEvidenceModalUrl} alt="Vista previa de evidencia" className="image-modal-img" />
          </div>
        </div>
      ) : null}
    </main>
  );
}
