import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { requireCustomer } from "@/lib/auth/customer";

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const customer = await requireCustomer();
  return (
    <DashboardShell customerName={customer.name ?? customer.phone}>
      {children}
    </DashboardShell>
  );
}