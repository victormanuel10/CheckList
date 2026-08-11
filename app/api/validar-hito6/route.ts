import { getNativeDb } from "../../../lib/db-adapter";
import { isAuthenticatedRequest, unauthorizedResponse } from "../../../lib/auth";
import type { ProjectInfo, ChecklistItemState } from "../../../lib/validar-hito6-data";

function getDbBinding() {
  let cfEnv: any = null;
  try {
    cfEnv = (globalThis as any).env;
  } catch {}
  return cfEnv?.DB || getNativeDb();
}

async function ensureValidationSchema() {
  const db = getDbBinding();
  await db.prepare(
    `CREATE TABLE IF NOT EXISTS validacion_hito6_records (
      id text PRIMARY KEY NOT NULL,
      project_info text NOT NULL,
      checklist_state text NOT NULL,
      updated_at text,
      created_at text DEFAULT CURRENT_TIMESTAMP NOT NULL
    )`
  ).run();
}

export async function GET(request: Request) {
  try {
    if (!(await isAuthenticatedRequest(request))) {
      return unauthorizedResponse();
    }
    await ensureValidationSchema();

    const url = new URL(request.url);
    const id = url.searchParams.get("id") || "default";

    const record = await getDbBinding().prepare(
      `SELECT id, project_info, checklist_state, updated_at FROM validacion_hito6_records WHERE id = ? LIMIT 1`
    ).bind(id).first<any>();

    if (!record) {
      return Response.json({
        id,
        projectInfo: { municipio: "", operador: "", contrato: "", fecha: "" },
        checklistState: {},
        updatedAt: null,
      });
    }

    let projectInfo: ProjectInfo = { municipio: "", operador: "", contrato: "", fecha: "" };
    let checklistState: Record<string, ChecklistItemState> = {};

    try {
      projectInfo = typeof record.project_info === "string" ? JSON.parse(record.project_info) : record.project_info;
    } catch {}

    try {
      checklistState = typeof record.checklist_state === "string" ? JSON.parse(record.checklist_state) : record.checklist_state;
    } catch {}

    return Response.json({
      id: record.id,
      projectInfo,
      checklistState,
      updatedAt: record.updated_at,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error inesperado";
    return Response.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    if (!(await isAuthenticatedRequest(request))) {
      return unauthorizedResponse();
    }
    await ensureValidationSchema();

    const body = await request.json();
    const id = typeof body.id === "string" && body.id ? body.id : "default";
    const projectInfo = body.projectInfo || {};
    const checklistState = body.checklistState || {};
    const updatedAt = new Date().toISOString();

    const existing = await getDbBinding().prepare(
      `SELECT id FROM validacion_hito6_records WHERE id = ? LIMIT 1`
    ).bind(id).first<any>();

    if (existing) {
      await getDbBinding().prepare(
        `UPDATE validacion_hito6_records SET project_info = ?, checklist_state = ?, updated_at = ? WHERE id = ?`
      ).bind(
        JSON.stringify(projectInfo),
        JSON.stringify(checklistState),
        updatedAt,
        id
      ).run();
    } else {
      await getDbBinding().prepare(
        `INSERT INTO validacion_hito6_records (id, project_info, checklist_state, updated_at) VALUES (?, ?, ?, ?)`
      ).bind(
        id,
        JSON.stringify(projectInfo),
        JSON.stringify(checklistState),
        updatedAt
      ).run();
    }

    return Response.json({ success: true, id, updatedAt });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error inesperado";
    return Response.json({ error: msg }, { status: 500 });
  }
}
