import { isAuthenticatedRequest } from "../../../../lib/auth";

export async function GET(request: Request) {
  return Response.json({
    authenticated: await isAuthenticatedRequest(request),
  });
}
