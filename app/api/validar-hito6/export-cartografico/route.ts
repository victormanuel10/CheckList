import { generateCartographicConceptDocxBuffer } from "../../../../lib/docx-generator";
import { isAuthenticatedRequest, unauthorizedResponse } from "../../../../lib/auth";
import type { ProjectInfo, ChecklistItemState } from "../../../../lib/validar-hito6-data";
import { createInitialRecords, type ChecklistRecord } from "../../../../lib/checklist-data";

export async function POST(request: Request) {
  try {
    if (!(await isAuthenticatedRequest(request))) {
      return unauthorizedResponse();
    }

    const body = await request.json().catch(() => ({}));
    const projectInfo: ProjectInfo = body.projectInfo || { municipio: "BETANIA", operador: "VALOR +", contrato: "Contrato 179-2024", fecha: "" };
    const checklistState: Record<string, ChecklistItemState> = body.checklistState || {};
    const recordPayload: ChecklistRecord | undefined = body.record;

    let targetRecord: ChecklistRecord;

    if (recordPayload && recordPayload.id) {
      targetRecord = recordPayload;
    } else {
      const initial = createInitialRecords();
      const base = initial.find((r) => r.municipio.toLowerCase() === (projectInfo.municipio || "betania").toLowerCase()) || initial[0];
      const checks: Record<string, any> = {};
      const fieldObservations: Record<string, string> = {};

      Object.entries(checklistState).forEach(([key, val]) => {
        const parts = key.split("::");
        const itemLabel = parts[parts.length - 1] || key;
        checks[itemLabel] = val.checked ? "Cumple" : "No cumple";
        if (val.notes) {
          fieldObservations[itemLabel] = val.notes;
        }
      });

      targetRecord = {
        ...base,
        municipio: projectInfo.municipio || base.municipio,
        oferente: projectInfo.operador || base.oferente,
        checks: { ...base.checks, ...checks },
        fieldObservations: { ...base.fieldObservations, ...fieldObservations },
      };
    }

    const buffer = await generateCartographicConceptDocxBuffer(targetRecord, projectInfo);
    const filename = `REVISIÓN_COMPONENTE_CARTOGRÁFICO_CONCEPTO_HITO_06_${(targetRecord.municipio || "PROYECTO").toUpperCase()}.docx`;

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error al generar concepto cartográfico Word";
    return Response.json({ error: msg }, { status: 500 });
  }
}
