import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "tempmail-admin-secret-change-me";
const COOKIE_NAME = "admin_session";

export function signToken(payload: { username: string }): string {
  return jwt.sign(payload, ADMIN_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): { username: string } | null {
  try {
    return jwt.verify(token, ADMIN_SECRET) as { username: string };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<{ authenticated: boolean; username?: string }> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return { authenticated: false };

  const payload = verifyToken(token);
  if (!payload) return { authenticated: false };

  return { authenticated: true, username: payload.username };
}

export function getSessionCookieOptions(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  };
}

export function getLogoutCookieOptions() {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  };
}
