import type { ReactNode } from "react";
import { Container, Badge } from "./ui";

/**
 * Shared layout for static content pages (about, rules, privacy, refund,
 * tutorial) so they stay consistent and readable.
 */
export function ContentPage({
  badge,
  title,
  intro,
  children,
}: {
  badge: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <Container className="py-12 sm:py-16">
      <article className="mx-auto max-w-3xl">
        <div className="flex flex-col gap-3">
          <Badge tone="gold" className="self-start">{badge}</Badge>
          <h1 className="text-3xl font-extrabold text-foreground sm:text-4xl">{title}</h1>
          {intro ? <p className="text-sm leading-7 text-muted sm:text-base">{intro}</p> : null}
        </div>
        <div className="mt-8 flex flex-col gap-8">{children}</div>
      </article>
    </Container>
  );
}

/** A heading + prose block used repeatedly on content pages. */
export function ContentSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      <div className="text-sm leading-8 text-muted">{children}</div>
    </section>
  );
}