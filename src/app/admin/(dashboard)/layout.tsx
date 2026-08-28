import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/auth/admin";

/**
 * Protected admin layout. Mandatory server-side authorization: every page under
 * /admin passes through requireAdmin(); unauthenticated or non-admin users are
 * redirected to /admin/login. (proxy.ts is only an early-redirect optimization,
 * never the security boundary.)
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();

  return (
    <AdminShell adminName={admin.name ?? admin.phone}>{children}</AdminShell>
  );
}
