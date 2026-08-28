import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getPost(slug: string) {
  try {
    return await prisma.blogPost.findFirst({
      where: { slug, isPublished: true },
    });
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return { title: post?.title ?? "مقاله پیدا نشد", description: post?.excerpt ?? undefined };
}

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <Container className="py-10 sm:py-14">
      <article className="mx-auto max-w-3xl">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted" aria-label="مسیر">
          <Link href="/" className="transition-colors hover:text-gold focus-visible:outline-gold">خانه</Link>
          <span aria-hidden>/</span>
          <Link href="/blog" className="transition-colors hover:text-gold focus-visible:outline-gold">وبلاگ</Link>
        </nav>

        <h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">{post.title}</h1>
        {post.excerpt ? <p className="mt-3 text-sm leading-7 text-muted sm:text-base">{post.excerpt}</p> : null}
        {post.publishedAt ? (
          <p className="mt-3 text-xs text-muted tnum">انتشار: {formatDate(post.publishedAt)}</p>
        ) : null}

        {post.featuredImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.featuredImage}
            alt={post.title}
            className="mt-6 aspect-[3/1] w-full rounded-2xl border border-border object-cover"
          />
        ) : null}

        <div className="mt-8 whitespace-pre-line text-sm leading-8 text-foreground/90 sm:text-base sm:leading-9">
          {post.content}
        </div>
      </article>
    </Container>
  );
}