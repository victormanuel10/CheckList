import fs from "node:fs";
import path from "node:path";

export async function GET(
  request: Request,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params?.filename?.replace(/[^a-zA-Z0-9._-]/g, "") || "";
    if (!filename) {
      return new Response("Not found", { status: 404 });
    }

    const publicPath = path.join(process.cwd(), "public", "uploads", "evidence", filename);
    const distPath = path.join(process.cwd(), "dist", "client", "uploads", "evidence", filename);

    let targetPath = "";
    if (fs.existsSync(publicPath)) {
      targetPath = publicPath;
    } else if (fs.existsSync(distPath)) {
      targetPath = distPath;
    }

    if (!targetPath) {
      return new Response("Image not found", { status: 404 });
    }

    const buffer = fs.readFileSync(targetPath);
    const ext = filename.split(".").pop()?.toLowerCase() || "jpg";
    let contentType = "image/jpeg";
    if (ext === "png") contentType = "image/png";
    if (ext === "webp") contentType = "image/webp";
    if (ext === "gif") contentType = "image/gif";
    if (ext === "svg") contentType = "image/svg+xml";

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return new Response("Error loading image", { status: 500 });
  }
}
