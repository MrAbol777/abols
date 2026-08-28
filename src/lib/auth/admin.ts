import { redirect } from "next/navigation";
import {
  getSessionUser,
  ADMIN_SESSION_COOKIE,
  type SessionUser,
} from "./session";

/**
 * Authorization helpers. Server-side authorization is the mandatory security
 * boundary for admin routes (proxy.ts is only an early-redirect optimization).
 */

export async function getCurrentUser(): Promise<SessionUser | null> {
  return getSessionUser(ADMIN_SESSION_COOKIE);
}

export async function getCurrentAdmin(): Promise<SessionUser | null> {
  const user = await getSessionUser(ADMIN_SESSION_COOKIE);
  if (!user || !user.isActive || user.role !== "ADMIN") return null;
  return user;
}

/**
 * Require an authenticated, active ADMIN. Redirects to the login page otherwise.
 * Call this at the top of every protected admin page/layout/action.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
