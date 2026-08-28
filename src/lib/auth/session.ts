import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/**
 * Opaque database-backed sessions for both admins and customers.
 *
 * Security model:
 * - A cryptographically random token is generated and sent to the browser ONLY
 *   as an HTTP-only cookie.
 * - Only the SHA-256 hash of that token is stored in the Session table.
 * - On each request the cookie is hashed and looked up; the raw token never
 *   touches the database and is never exposed to client JavaScript.
 * - Admin and customer sessions use distinct cookie names so a single browser
 *   can be logged in to the storefront and the admin panel independently.
 */

export const ADMIN_SESSION_COOKIE = "abol_admin_session";
export const CUSTOMER_SESSION_COOKIE = "abol_customer_session";

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const COOKIE_NAMES = new Set([ADMIN_SESSION_COOKIE, CUSTOMER_SESSION_COOKIE]);

export type SessionUser = {
  id: string;
  phone: string;
  name: string | null;
  role: string;
  isActive: boolean;
};

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function assertCookieName(name: string): void {
  if (!COOKIE_NAMES.has(name)) {
    throw new Error("invalid session cookie name");
  }
}

/**
 * Create a session for a user and set the HTTP-only cookie.
 * MUST be called from a Server Action or Route Handler (it mutates cookies).
 */
export async function createSession(userId: string, cookieName: string): Promise<void> {
  assertCookieName(cookieName);
  const token = crypto.randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({ data: { tokenHash, userId, expiresAt } });

  const store = await cookies();
  store.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

/**
 * Resolve the current session's user from a specific cookie. Returns null when
 * there is no cookie, the session is missing/expired, or the user is inactive.
 * Read-only with respect to cookies (safe to call during render). Expired
 * session rows are cleaned up opportunistically (DB only, not the cookie).
 */
export async function getSessionUser(
  cookieName: string,
): Promise<SessionUser | null> {
  assertCookieName(cookieName);
  const store = await cookies();
  const token = store.get(cookieName)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);

  try {
    const session = await prisma.session.findUnique({
      where: { tokenHash },
      include: {
        user: {
          select: { id: true, phone: true, name: true, role: true, isActive: true },
        },
      },
    });

    if (!session) return null;

    if (session.expiresAt.getTime() < Date.now()) {
      // Opportunistic cleanup of the expired row (does not touch the cookie).
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      return null;
    }

    if (!session.user || !session.user.isActive) return null;

    return session.user;
  } catch {
    return null;
  }
}

/**
 * Invalidate the current session for the given cookie: delete the DB row and
 * clear the cookie. MUST be called from a Server Action or Route Handler.
 */
export async function deleteCurrentSession(cookieName: string): Promise<void> {
  assertCookieName(cookieName);
  const store = await cookies();
  const token = store.get(cookieName)?.value;
  if (token) {
    const tokenHash = hashToken(token);
    await prisma.session.deleteMany({ where: { tokenHash } }).catch(() => {});
  }
  store.delete(cookieName);
}