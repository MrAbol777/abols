import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminBlogPostById } from "@/lib/admin-content";
import { BlogForm } from "@/components/admin/BlogForm";

export const metadata: Metadata = {
  title: "ویرایش مقاله",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminBlogEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getAdminBlogPostById(id);
  if (!post) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/blog" className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-gold/40 hover:text-gold focus-visible:outline-gold" aria-label="بازگشت به وبلاگ">
          <svg className="h-4 w-4 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">ویرایش: {post.title}</h1>
          <p className="mt-1 text-sm text-muted">تغییرات مقاله را ذخیره کنید.</p>
        </div>
      </div>

      <BlogForm
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          isPublished: post.isPublished,
          publishedAt: post.publishedAt,
          updatedAt: post.updatedAt,
        }}
        content={post.content}
      />
    </div>
  );
}