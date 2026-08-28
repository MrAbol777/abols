import type { Metadata } from "next";
import { requireCustomer } from "@/lib/auth/customer";
import { ProfileForm } from "@/components/dashboard/ProfileForm";

export const metadata: Metadata = { title: "پروفایل" };

export const dynamic = "force-dynamic";

export default async function DashboardProfilePage() {
  const customer = await requireCustomer();
  return <ProfileForm name={customer.name} phone={customer.phone} />;
}