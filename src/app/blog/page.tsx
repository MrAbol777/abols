import type { Metadata } from "next";
import Link from "next/link";
import { Container, EmptyState } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "وبلاگ",
  description: "مقالات آموزشی ابول استور — راهنمای خرید CP، اکانت و کمبو کالاف دیوتی موبایل.",
};

export const dynamic = "force-dynamic";

async function getPublishedPosts() {
  try {
    return await prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: "desc" },
      select: { id: true, title: true, slug: true, excerpt: true, publishedAt: true },
    });
  } catch {
    return [];
  }
}

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("fa-IR", { year: "numeric", month: "long", day: "numeric" }).format(date);
}

export default async function BlogListPage() {
  const posts = await getPublishedPosts();

  return (
    <Container className="py-10 sm:py-14">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">وبلاگ ابول استور</h1>
        <p className="text-sm leading-7 text-muted">راهنماها و نکات خرید محصولات کالاف دیوتی موبایل.</p>
      </div>

      <div className="mt-8">
        {posts.length === 0 ? (
          <EmptyState title="هنوز مقاله‌ای منتشر نشده است" description="به‌زودی مطالب آموزشی منتشر می‌شوند." />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="group flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5 transition-all hover:border-gold/40 hover:shadow-[0_16px_50px_-24px_rgba(212,175,55,0.6)] focus-visible:outline-gold"
              >
                <h2 className="text-base font-bold text-foreground transition-colors group-hover:text-gold">
                  {p.title}
                </h2>
                {p.excerpt ? <p className="line-clamp-3 text-sm leading-7 text-muted">{p.excerpt}</p> : null}
                {p.publishedAt ? (
                  <span className="mt-auto text-xs text-muted tnum">{formatDate(p.publishedAt)}</span>
                ) : null}
              </Link>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}