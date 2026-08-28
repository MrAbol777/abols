import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAdminCategories } from "@/lib/admin-catalog";
import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata: Metadata = {
  title: "ویرایش دسته",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminCategoryEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const categories = await getAdminCategories();
  const category = categories.find((c) => c.id === id);
  if (!category) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">ویرایش دسته: {category.name}</h1>
        <p className="mt-1 text-sm text-muted">تغییرات پس از ذخیره در فروشگاه اعمال می‌شود.</p>
      </div>
      <div className="max-w-lg rounded-2xl border border-border bg-surface p-5">
        <CategoryForm category={category} />
      </div>
    </div>
  );
}