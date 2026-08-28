import type { Metadata } from "next";
import { getSettingsForForm } from "@/lib/admin-content";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata: Metadata = {
  title: "تنظیمات فروشگاه",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await getSettingsForForm();
  return <SettingsForm initial={settings} />;
}