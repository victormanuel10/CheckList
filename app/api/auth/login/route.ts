import {
  buildSessionCookie,
  createSessionToken,
  validateCredentials,
} from "../../../../lib/auth";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as {
    username?: unknown;
    password?: unknown;
  };

  if (!validateCredentials(payload.username, payload.password)) {
    return Response.json(
      { error: "Usuario o contrasena incorrectos." },
      { status: 401 },
    );
  }

  const token = await createSessionToken();
  return Response.json(
    { authenticated: true },
    {
      headers: {
        "Set-Cookie": buildSessionCookie(token, request.url),
      },
    },
  );
}
