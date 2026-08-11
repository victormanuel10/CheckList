import { getNativeDb } from "../../../lib/db-adapter";
import {
  CHECKLIST_FIELDS,
  createInitialRecords,
  isDeliveryStatus,
  mergeImportedRecords,
  readChecklistFieldStatus,
  type ChecklistRecord,
  type ChecklistStatus,
  type DeliveryStatus,
} from "../../../lib/checklist-data";
import { isAuthenticatedRequest, unauthorizedResponse } from "../../../lib/auth";

function getDbBinding() {
  let cfEnv: any = null;
  try {
    cfEnv = (globalThis as any).env;
  } catch {}
  return cfEnv?.DB || getNativeDb();
}

type DbRecord = {
  id: string;
  oferente: string;
  municipio: string;
  delivery_status?: DeliveryStatus | string | null;
  checks: string | Record<string, ChecklistStatus>;
  field_observations?: string | Record<string, string> | null;
  field_evidence?: string | Record<string, string> | null;
  observations: string | null;
  updated_at: string | null;
};

function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : "Error inesperado";
  const detail =
    error instanceof Error && error.cause instanceof Error
      ? error.cause.message
      : "";
  const combined = `${message}\n${detail}`.trim();

  if (combined.includes("no such table")) {
    return "La base de datos del checklist aun no tiene la tabla creada.";
  }

  return combined;
}

async function ensureSchema() {
  const db = getDbBinding();
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS checklist_records (
      id text PRIMARY KEY NOT NULL,
      oferente text NOT NULL,
      municipio text NOT NULL,
      delivery_status text DEFAULT 'Sin registrar' NOT NULL,
      checks text NOT NULL,
      observations text DEFAULT '' NOT NULL,
      updated_at text,
      created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`,
  ).run();

  try {
    await db.prepare(
      "ALTER TABLE checklist_records ADD COLUMN delivery_status text DEFAULT 'Sin registrar' NOT NULL",
    ).run();
  } catch {}
  try {
    await db.prepare(
      "ALTER TABLE checklist_records ADD COLUMN field_observations text DEFAULT '{}' NOT NULL",
    ).run();
  } catch {}
  try {
    await db.prepare(
      "ALTER TABLE checklist_records ADD COLUMN field_evidence text DEFAULT '{}' NOT NULL",
    ).run();
  } catch {}
}

function normalizeChecks(value: unknown): Record<string, ChecklistStatus> {
  let source = value;

  if (typeof value === "string") {
    try {
      source = JSON.parse(value);
    } catch {
      source = {};
    }
  }

  const checks =
    source && typeof source === "object"
      ? (source as Record<string, unknown>)
      : {};

  return Object.fromEntries(
    CHECKLIST_FIELDS.map((field) => [
      field.id,
      readChecklistFieldStatus(checks, field) ?? "Pendiente",
    ]),
  );
}

function parseJsonRecord<T>(value: unknown): Record<string, T> {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as Record<string, T>;
    } catch {
      return {};
    }
  }
  return typeof value === "object" ? (value as Record<string, T>) : {};
}

function rowToRecord(row: DbRecord): ChecklistRecord {
  return {
    id: row.id,
    oferente: row.oferente,
    municipio: row.municipio,
    deliveryStatus: isDeliveryStatus(row.delivery_status)
      ? row.delivery_status
      : "Sin registrar",
    checks: normalizeChecks(row.checks),
    fieldObservations: parseJsonRecord<string>(row.field_observations),
    fieldEvidence: parseJsonRecord<string>(row.field_evidence),
    observations: row.observations ?? "",
    updatedAt: row.updated_at ?? null,
  };
}

function insertStatement(record: ChecklistRecord) {
  return getDbBinding().prepare(
    `INSERT INTO checklist_records
      (id, oferente, municipio, delivery_status, checks, field_observations, field_evidence, observations, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).bind(
    record.id,
    record.oferente,
    record.municipio,
    record.deliveryStatus,
    JSON.stringify(record.checks),
    JSON.stringify(record.fieldObservations ?? {}),
    JSON.stringify(record.fieldEvidence ?? {}),
    record.observations,
    record.updatedAt,
  );
}

async function insertMany(records: ChecklistRecord[]) {
  if (records.length === 0) {
    return;
  }
  await getDbBinding().batch(records.map(insertStatement));
}

async function listRecords() {
  await ensureSchema();
  const result = await getDbBinding().prepare(
    `SELECT id, oferente, municipio, delivery_status, checks, field_observations, field_evidence, observations, updated_at
      FROM checklist_records
      ORDER BY oferente, municipio`,
  ).all<DbRecord>();

  return (result.results ?? []).map(rowToRecord);
}

async function seedIfNeeded() {
  await ensureSchema();
  const existing = await getDbBinding().prepare(
    "SELECT id FROM checklist_records LIMIT 1",
  ).first<{ id: string }>();

  if (!existing) {
    await insertMany(createInitialRecords());
  }
}

async function replaceAll(records: ChecklistRecord[]) {
  await ensureSchema();
  await getDbBinding().prepare("DELETE FROM checklist_records").run();
  await insertMany(records);
}

export async function GET(request: Request) {
  try {
    if (!(await isAuthenticatedRequest(request))) {
      return unauthorizedResponse();
    }
    await seedIfNeeded();
    return Response.json({ records: await listRecords() });
  } catch (error) {
    return Response.json({ error: apiError(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await isAuthenticatedRequest(request))) {
      return unauthorizedResponse();
    }
    const payload = (await request.json()) as Record<string, unknown>;
    const id = typeof payload.id === "string" ? payload.id : "";

    if (!id) {
      return Response.json({ error: "Falta el ID del municipio." }, { status: 400 });
    }

    await seedIfNeeded();
    const current = await getDbBinding().prepare(
      `SELECT id, oferente, municipio, delivery_status, checks, field_observations, field_evidence, observations, updated_at
        FROM checklist_records
        WHERE id = ?
        LIMIT 1`,
    )
      .bind(id)
      .first<DbRecord>();

    if (!current) {
      return Response.json({ error: "Municipio no encontrado." }, { status: 404 });
    }

    const currentRecord = rowToRecord(current);
    const incomingChecks =
      payload.checks && typeof payload.checks === "object"
        ? (payload.checks as Record<string, unknown>)
        : {};
    const checks = { ...currentRecord.checks };

    for (const field of CHECKLIST_FIELDS) {
      const status = readChecklistFieldStatus(incomingChecks, field);
      if (status) {
        checks[field.id] = status;
      }
    }

    const fieldObservations =
      payload.fieldObservations && typeof payload.fieldObservations === "object"
        ? (payload.fieldObservations as Record<string, string>)
        : currentRecord.fieldObservations ?? {};

    const fieldEvidence =
      payload.fieldEvidence && typeof payload.fieldEvidence === "object"
        ? (payload.fieldEvidence as Record<string, string>)
        : currentRecord.fieldEvidence ?? {};

    const updatedAt = new Date().toISOString();
    const record: ChecklistRecord = {
      ...currentRecord,
      deliveryStatus: isDeliveryStatus(payload.deliveryStatus)
        ? payload.deliveryStatus
        : currentRecord.deliveryStatus,
      checks,
      fieldObservations,
      fieldEvidence,
      observations:
        typeof payload.observations === "string"
          ? payload.observations
          : currentRecord.observations,
      updatedAt,
    };

    await getDbBinding().prepare(
      `UPDATE checklist_records
        SET delivery_status = ?, checks = ?, field_observations = ?, field_evidence = ?, observations = ?, updated_at = ?
        WHERE id = ?`,
    )
      .bind(
        record.deliveryStatus,
        JSON.stringify(record.checks),
        JSON.stringify(record.fieldObservations ?? {}),
        JSON.stringify(record.fieldEvidence ?? {}),
        record.observations,
        record.updatedAt,
        record.id,
      )
      .run();

    return Response.json({ record });
  } catch (error) {
    return Response.json({ error: apiError(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    if (!(await isAuthenticatedRequest(request))) {
      return unauthorizedResponse();
    }
    const payload = await request.json();
    const records = mergeImportedRecords(payload);
    await replaceAll(records);

    return Response.json({ records });
  } catch (error) {
    return Response.json({ error: apiError(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthenticatedRequest(request))) {
      return unauthorizedResponse();
    }
    const payload = (await request.json().catch(() => ({}))) as {
      action?: string;
    };

    if (payload.action !== "reset") {
      return Response.json({ error: "Accion no soportada." }, { status: 400 });
    }

    const records = createInitialRecords();
    await replaceAll(records);
    return Response.json({ records });
  } catch (error) {
    return Response.json({ error: apiError(error) }, { status: 500 });
  }
}
