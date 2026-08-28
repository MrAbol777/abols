import type { Metadata } from "next";
import { Badge } from "@/components/ui";
import { getAdminUsers } from "@/lib/admin-data";
import { toggleUserActiveAction, verifyUserPhoneAction } from "@/app/admin/order-actions";
import { formatNumber, formatToman } from "@/lib/format";

export const metadata: Metadata = {
  title: "کاربران",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export default async function AdminUsersPage() {
  const users = await getAdminUsers();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">کاربران</h1>
        <p className="mt-1 text-sm text-muted">مشتریان ثبت‌شده در فروشگاه.</p>
      </div>

      {users.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-12 text-center">
          <p className="font-semibold text-foreground">هنوز کاربری ثبت نشده است</p>
          <p className="mt-1 text-sm text-muted">پس از اولین ثبت‌نام، کاربران اینجا نمایش داده می‌شوند.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border text-start text-xs text-muted">
                <th scope="col" className="px-4 py-3 text-start font-medium">کاربر</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">ثبت‌نام</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">سفارش‌ها</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">مجموع خرید</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">وضعیت</th>
                <th scope="col" className="px-4 py-3 text-start font-medium">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-elevated/50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">{u.name ?? "—"}</p>
                    <p dir="ltr" className="text-xs text-muted tnum">{u.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted tnum">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3 text-muted tnum">{formatNumber(u.orderCount)}</td>
                  <td className="px-4 py-3 font-semibold text-foreground tnum">{formatToman(u.totalSpent)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {u.isPhoneVerified ? (
                        <Badge tone="success">موبایل تأیید شده</Badge>
                      ) : (
                        <Badge tone="neutral">موبایل تأیید نشده</Badge>
                      )}
                      {u.isActive ? (
                        <Badge tone="success">فعال</Badge>
                      ) : (
                        <Badge tone="danger">غیرفعال</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1.5">
                      {!u.isPhoneVerified ? (
                        <form action={verifyUserPhoneAction}>
                          <input type="hidden" name="id" value={u.id} />
                          <button
                            type="submit"
                            className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold focus-visible:outline-gold"
                          >
                            تأیید موبایل
                          </button>
                        </form>
                      ) : null}
                      <form action={toggleUserActiveAction}>
                        <input type="hidden" name="id" value={u.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-gold/40 hover:text-gold focus-visible:outline-gold"
                        >
                          {u.isActive ? "غیرفعال کن" : "فعال کن"}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}