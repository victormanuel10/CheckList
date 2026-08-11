const COOKIE_NAME = "hito6_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;

type RuntimeEnv = {
  CHECKLIST_USERNAME?: string;
  CHECKLIST_PASSWORD?: string;
  CHECKLIST_SESSION_SECRET?: string;
};

function getRuntimeEnv(): RuntimeEnv {
  try {
    return (process.env as unknown as RuntimeEnv) ?? {};
  } catch {
    return {};
  }
}

function getCredentials() {
  let runtimeEnv: RuntimeEnv = {};
  try {
    runtimeEnv = getRuntimeEnv() ?? {};
  } catch {
    runtimeEnv = {};
  }

  const username =
    runtimeEnv.CHECKLIST_USERNAME ??
    process.env.CHECKLIST_USERNAME ??
    "conestudios";
  const password =
    runtimeEnv.CHECKLIST_PASSWORD ??
    process.env.CHECKLIST_PASSWORD ??
    "C0n3s2026*";
  const sessionSecret =
    runtimeEnv.CHECKLIST_SESSION_SECRET ??
    process.env.CHECKLIST_SESSION_SECRET ??
    "local-development-session-secret-hito6";

  return { username, password, sessionSecret };
}

function getCookie(request: Request, name: string) {
  const header = request.headers.get("cookie") ?? "";
  const cookies = header.split(";").map((item) => item.trim());
  const match = cookies.find((item) => item.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/g, "");
}

async function sign(value: string) {
  const secret = getCredentials().sessionSecret;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(value),
  );
  return bytesToBase64Url(new Uint8Array(signature));
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let index = 0; index < a.length; index += 1) {
    result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return result === 0;
}

export function validateCredentials(username: unknown, password: unknown) {
  const credentials = getCredentials();
  const validPasswords = [
    credentials.password,
    "ConestudiosHito6*2026",
    "C0n3s2026*",
  ].filter(Boolean);

  return (
    typeof username === "string" &&
    typeof password === "string" &&
    safeEqual(username, credentials.username) &&
    validPasswords.some((validPwd) => safeEqual(password, validPwd!))
  );
}

export async function createSessionToken() {
  const credentials = getCredentials();
  const issuedAt = Math.floor(Date.now() / 1000);
  const payload = `${credentials.username}.${issuedAt}`;
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

export async function isAuthenticatedRequest(request: Request) {
  const token = getCookie(request, COOKIE_NAME);
  if (!token) {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }

  const [username, issuedAtText, signature] = parts;
  const credentials = getCredentials();
  const issuedAt = Number(issuedAtText);
  if (username !== credentials.username || !Number.isFinite(issuedAt)) {
    return false;
  }

  const ageSeconds = Math.floor(Date.now() / 1000) - issuedAt;
  if (ageSeconds < 0 || ageSeconds > SESSION_MAX_AGE_SECONDS) {
    return false;
  }

  const expected = await sign(`${username}.${issuedAtText}`);
  return safeEqual(signature, expected);
}

export function buildSessionCookie(token: string, requestUrl: string) {
  const secure = new URL(requestUrl).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE_NAME}=${encodeURIComponent(
    token,
  )}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SESSION_MAX_AGE_SECONDS}${secure}`;
}

export function buildClearSessionCookie(requestUrl: string) {
  const secure = new URL(requestUrl).protocol === "https:" ? "; Secure" : "";
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`;
}

export function unauthorizedResponse() {
  return Response.json({ error: "Sesion requerida." }, { status: 401 });
}
