import fs from "node:fs";
import path from "node:path";
import { isAuthenticatedRequest, unauthorizedResponse } from "../../../lib/auth";

export async function POST(request: Request) {
  try {
    if (!(await isAuthenticatedRequest(request))) {
      return unauthorizedResponse();
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads", "evidence");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const recordId = (formData.get("recordId") as string) || "GEN";
      const fieldId = (formData.get("fieldId") as string) || "FLD";

      if (!file) {
        return Response.json({ error: "No se envió ningún archivo de imagen." }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = file.name.split(".").pop() || "jpg";
      const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, "").toLowerCase() || "jpg";
      const safeRecordId = recordId.replace(/[^a-zA-Z0-9_-]/g, "");
      const safeFieldId = fieldId.replace(/[^a-zA-Z0-9_-]/g, "");
      const filename = `${safeRecordId}_${safeFieldId}_${Date.now()}.${cleanExt}`;
      const filePath = path.join(uploadsDir, filename);

      fs.writeFileSync(filePath, buffer);

      const url = `/uploads/evidence/${filename}`;
      return Response.json({ url, success: true });
    }

    const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const imageBase64 = typeof payload.imageBase64 === "string" ? payload.imageBase64 : "";
    const recordId = (typeof payload.recordId === "string" ? payload.recordId : "GEN").replace(/[^a-zA-Z0-9_-]/g, "");
    const fieldId = (typeof payload.fieldId === "string" ? payload.fieldId : "FLD").replace(/[^a-zA-Z0-9_-]/g, "");

    if (!imageBase64 || !imageBase64.includes("base64,")) {
      return Response.json({ error: "Imagen no válida o vacía." }, { status: 400 });
    }

    const matches = imageBase64.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!matches) {
      return Response.json({ error: "Formato de imagen base64 no reconocido." }, { status: 400 });
    }

    const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    const filename = `${recordId}_${fieldId}_${Date.now()}.${ext}`;
    const filePath = path.join(uploadsDir, filename);

    fs.writeFileSync(filePath, buffer);

    const url = `/uploads/evidence/${filename}`;
    return Response.json({ url, success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al guardar imagen en servidor";
    return Response.json({ error: message }, { status: 500 });
  }
}
