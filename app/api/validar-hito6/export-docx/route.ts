import { generateOficioDocxBuffer } from "../../../../lib/docx-generator";
import { isAuthenticatedRequest, unauthorizedResponse } from "../../../../lib/auth";
import type { ProjectInfo, ChecklistItemState } from "../../../../lib/validar-hito6-data";

export async function POST(request: Request) {
  try {
    if (!(await isAuthenticatedRequest(request))) {
      return unauthorizedResponse();
    }

    const body = await request.json().catch(() => ({}));
    const projectInfo: ProjectInfo = body.projectInfo || { municipio: "", operador: "", contrato: "", fecha: "" };
    const checklistState: Record<string, ChecklistItemState> = body.checklistState || {};

    const buffer = await generateOficioDocxBuffer(projectInfo, checklistState);

    const filename = `OFCANT-CATS_${(projectInfo.municipio || "PROYECTO").toUpperCase()}_CONCEPTO_HITO_06.docx`;

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Error al generar archivo Word";
    return Response.json({ error: msg }, { status: 500 });
  }
}
