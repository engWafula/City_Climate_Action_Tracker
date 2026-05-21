import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

export const adminAccessTokenCookie = "oef_admin_access_token";
export const adminRefreshTokenCookie = "oef_admin_refresh_token";

const accessTokenMaxAgeSeconds = 60 * 15;
const refreshTokenMaxAgeSeconds = 60 * 60 * 24 * 7;

const accessTokenEnvKey = "AUTH_ACCESS_TOKEN_EXPIRES_IN_SECONDS";

type AdminJwtPayload = {
  sub: string;
  role: string;
  type: "access" | "refresh";
  iat: number;
  exp: number;
};

function getMaxAgeSeconds(envKey: string, fallback: number) {
  const value = process.env[envKey];

  if (!value) {
    return fallback;
  }

  const seconds = Number(value);

  if (!Number.isInteger(seconds) || seconds <= 0) {
    throw new Error(`${envKey} must be a positive number of seconds.`);
  }

  return seconds;
}

function base64UrlEncode(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function getJwtSecret() {
  const secret = process.env.AUTH_JWT_SECRET ?? process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET;

  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_JWT_SECRET must be set in production.");
  }

  return secret ?? "development-only-auth-secret";
}

function signJwt(payload: AdminJwtPayload) {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", getJwtSecret()).update(signingInput).digest("base64url");

  return `${signingInput}.${signature}`;
}

function verifyJwt(token: string, type: AdminJwtPayload["type"]) {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return null;
  }

  const [encodedHeader, encodedPayload, signature] = parts;

  if (!encodedHeader || !encodedPayload || !signature) {
    return null;
  }

  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = createHmac("sha256", getJwtSecret()).update(signingInput).digest("base64url");
  const signatureBuffer = Buffer.from(signature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    return null;
  }

  try {
    const header = JSON.parse(base64UrlDecode(encodedHeader)) as Partial<{ alg: string; typ: string }>;
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as Partial<AdminJwtPayload>;
    const now = Math.floor(Date.now() / 1000);

    if (
      header.alg !== "HS256" ||
      header.typ !== "JWT" ||
      !payload.sub ||
      payload.role !== "admin" ||
      payload.type !== type ||
      !payload.exp ||
      payload.exp <= now
    ) {
      return null;
    }

    return payload as AdminJwtPayload;
  } catch {
    return null;
  }
}

async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(adminAccessTokenCookie)?.value;
}

async function getRefreshToken() {
  const cookieStore = await cookies();
  return cookieStore.get(adminRefreshTokenCookie)?.value;
}

function createAccessToken(userId: string, maxAgeSeconds: number) {
  const now = Math.floor(Date.now() / 1000);

  return signJwt({
    sub: userId,
    role: "admin",
    type: "access",
    iat: now,
    exp: now + maxAgeSeconds
  });
}

function createRefreshToken(userId: string) {
  const now = Math.floor(Date.now() / 1000);

  return signJwt({
    sub: userId,
    role: "admin",
    type: "refresh",
    iat: now,
    exp: now + refreshTokenMaxAgeSeconds
  });
}

async function setAccessTokenCookie(userId: string) {
  const accessTokenMaxAge = getMaxAgeSeconds(accessTokenEnvKey, accessTokenMaxAgeSeconds);
  const cookieStore = await cookies();

  cookieStore.set(adminAccessTokenCookie, createAccessToken(userId, accessTokenMaxAge), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: accessTokenMaxAge
  });
}

async function refreshAccessToken(userId: string) {
  try {
    await setAccessTokenCookie(userId);
  } catch {
    // Some server render paths can read cookies but cannot write them.
  }
}

export async function authenticateAdmin(username: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { username }
  });

  if (!user || user.role !== "admin" || !verifyPassword(password, user.passwordHash)) {
    return null;
  }

  return user;
}

export async function isAdminAuthenticated() {
  const accessToken = await getAccessToken();

  if (accessToken) {
    const payload = verifyJwt(accessToken, "access");

    if (payload) {
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
        select: { role: true }
      });

      return user?.role === "admin";
    }
  }

  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return false;
  }

  const payload = verifyJwt(refreshToken, "refresh");

  if (!payload) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { role: true }
  });

  if (user?.role !== "admin") {
    return false;
  }

  await refreshAccessToken(payload.sub);
  return true;
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

export async function createAdminTokens(userId: string) {
  const accessTokenMaxAge = getMaxAgeSeconds(accessTokenEnvKey, accessTokenMaxAgeSeconds);
  const accessToken = createAccessToken(userId, accessTokenMaxAge);
  const refreshToken = createRefreshToken(userId);

  const cookieStore = await cookies();
  cookieStore.set(adminAccessTokenCookie, accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: accessTokenMaxAge
  });
  cookieStore.set(adminRefreshTokenCookie, refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: refreshTokenMaxAgeSeconds
  });
}

export async function clearAdminTokens() {
  const cookieStore = await cookies();
  cookieStore.delete(adminAccessTokenCookie);
  cookieStore.delete(adminRefreshTokenCookie);
}
