import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import type { Role, User } from "@prisma/client";
import { db } from "@/lib/db";
import { can, type StaffPermission } from "@/lib/permissions";

export { can } from "@/lib/permissions";

const COOKIE = "godesi_session";
const MAX_AGE = 60 * 60 * 24 * 30;

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(value);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const token = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret());

  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function destroySession() {
  cookies().delete(COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    if (!payload.sub) return null;
    return db.user.findUnique({ where: { id: payload.sub } });
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

/** Admins plus moderators — everyone allowed on the content desk. */
export function isStaff(user: { role: Role }) {
  return user.role === "ADMIN" || user.role === "MODERATOR";
}

export async function requireStaff(): Promise<User> {
  const user = await requireUser();
  if (!isStaff(user)) throw new Error("FORBIDDEN");
  return user;
}

/** Staff access narrowed to one area, e.g. only events or only news. */
export async function requirePermission(
  permission: StaffPermission,
): Promise<User> {
  const user = await requireStaff();
  if (!can(user, permission)) throw new Error("FORBIDDEN");
  return user;
}

export async function requireRole(role: Role): Promise<User> {
  const user = await requireUser();
  if (user.role !== role) throw new Error("FORBIDDEN");
  return user;
}
