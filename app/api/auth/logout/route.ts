import { buildClearSessionCookie } from "../../../../lib/auth";

export async function POST(request: Request) {
  return Response.json(
    { authenticated: false },
    {
      headers: {
        "Set-Cookie": buildClearSessionCookie(request.url),
      },
    },
  );
}
