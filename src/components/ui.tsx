import type { ReactNode } from "react";
import Link from "next/link";

/* Container ------------------------------------------------------------- */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${className}`}>
      {children}
    </div>
  );
}

/* Button / link-button -------------------------------------------------- */
type ButtonVariant = "primary" | "secondary" | "ghost" | "outline" | "success" | "danger";
type ButtonSize = "sm" | "md" | "lg";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-60 select-none";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-gold text-black hover:bg-gold-hover shadow-[0_6px_20px_-8px_rgba(212,175,55,0.6)]",
  secondary: "bg-elevated text-foreground hover:bg-[#24242c] border border-border",
  ghost: "text-foreground hover:bg-elevated",
  outline: "border border-gold/50 text-gold hover:bg-gold/10",
  success: "bg-success text-white hover:bg-success/90",
  danger: "bg-danger text-white hover:bg-danger/90",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className = "",
): string {
  return `${buttonBase} ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`;
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  return (
    <Link href={href} className={buttonClasses(variant, size, className)}>
      {children}
    </Link>
  );
}

/* Badge ----------------------------------------------------------------- */
type BadgeTone = "gold" | "silver" | "success" | "danger" | "neutral";

const badgeTones: Record<BadgeTone, string> = {
  gold: "bg-gold/15 text-gold border-gold/30",
  silver: "bg-silver/10 text-silver border-silver/25",
  success: "bg-success/15 text-success border-success/30",
  danger: "bg-danger/15 text-danger border-danger/30",
  neutral: "bg-elevated text-muted border-border",
};

export function Badge({
  children,
  tone = "neutral",
  className = "",
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeTones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/* Section heading ------------------------------------------------------- */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "start";
}) {
  const alignment = align === "center" ? "items-center text-center" : "items-start text-start";
  return (
    <div className={`flex flex-col gap-3 ${alignment}`}>
      {eyebrow ? (
        <span className="text-xs font-semibold uppercase tracking-widest text-gold">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">{title}</h2>
      {description ? (
        <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">{description}</p>
      ) : null}
    </div>
  );
}

/* Empty state ----------------------------------------------------------- */
export function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-12 text-center">
      {icon ? <div className="text-gold">{icon}</div> : null}
      <p className="font-semibold text-foreground">{title}</p>
      {description ? <p className="max-w-sm text-sm text-muted">{description}</p> : null}
    </div>
  );
}

/* Card shell ------------------------------------------------------------ */
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-5 transition-colors ${className}`}
    >
      {children}
    </div>
  );
}
