import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";

export const adminSessionCookie = "oef_admin_session";

const sessionMaxAgeSeconds = 60 * 60 * 8;

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function getSessionToken() {
  const cookieStore = await cookies();
  return cookieStore.get(adminSessionCookie)?.value;
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
  const token = await getSessionToken();

  if (!token) {
    return false;
  }

  const session = await prisma.userSession.findUnique({
    where: { tokenHash: hashSessionToken(token) },
    include: { user: true }
  });

  if (!session || session.expiresAt <= new Date() || session.user.role !== "admin") {
    return false;
  }

  return true;
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

export async function createAdminSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + sessionMaxAgeSeconds * 1000);

  await prisma.userSession.create({
    data: {
      userId,
      tokenHash: hashSessionToken(token),
      expiresAt
    }
  });

  const cookieStore = await cookies();
  cookieStore.set(adminSessionCookie, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: sessionMaxAgeSeconds
  });
}

export async function clearAdminSession() {
  const token = await getSessionToken();

  if (token) {
    await prisma.userSession.deleteMany({
      where: { tokenHash: hashSessionToken(token) }
    });
  }

  const cookieStore = await cookies();
  cookieStore.delete(adminSessionCookie);
}
