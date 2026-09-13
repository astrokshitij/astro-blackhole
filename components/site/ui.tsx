import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ArrowGlyph } from "./icons";

/* -------------------------------------------------------------------- *
 *  One definition per pattern. Every page uses these, so spacing, type  *
 *  and interaction stay identical across the site.                      *
 * -------------------------------------------------------------------- */

export const buttonStyles = cva(
  "font-display inline-flex items-center justify-center gap-2 rounded-full font-light uppercase tracking-[0.18em] transition-[background-color,border-color,color,transform] duration-200 active:translate-y-px",
  {
    variants: {
      variant: {
        primary: "bg-white text-black font-medium hover:bg-white/85",
        secondary:
          "border border-white/30 text-white/85 hover:border-white hover:text-white hover:bg-white/[0.06]",
        ghost: "text-white/70 hover:text-white",
      },
      size: {
        sm: "px-5 py-2.5 text-[11px]",
        md: "px-6 py-3 text-xs",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonLinkProps = VariantProps<typeof buttonStyles> & {
  href: string;
  children: React.ReactNode;
  className?: string;
  external?: boolean;
};

export function ButtonLink({
  href,
  children,
  variant,
  size,
  className,
  external,
}: ButtonLinkProps) {
  const classes = cn(buttonStyles({ variant, size }), className);
  if (external || href.startsWith("http") || href.startsWith("mailto:")) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}

/** Consistent vertical rhythm for every band on every page. */
export function Section({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("bg-black", className)}>
      <div className="mx-auto max-w-6xl px-5 pt-16 pb-24 sm:px-8 sm:pt-24 sm:pb-32">
        {children}
      </div>
    </section>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/55">
      {children}
    </p>
  );
}

export function SectionHeading({
  index,
  title,
  dek,
}: {
  index?: string;
  title: string;
  dek?: string;
}) {
  return (
    <header className="mb-14 max-w-2xl">
      {index ? <Eyebrow>{index}</Eyebrow> : null}
      <h2 className="font-display mt-4 text-2xl font-light leading-tight tracking-[0.02em] text-white sm:text-4xl">
        {title}
      </h2>
      {dek ? (
        <p className="mt-4 text-sm leading-relaxed text-white/60 sm:text-base">{dek}</p>
      ) : null}
    </header>
  );
}

/** The continue-reading block at the foot of every inner page. */
export function NextPage({ href, title }: { href: string; title: string }) {
  return (
    <Link
      href={href}
      className="group mt-20 flex items-center justify-between gap-6 border-t border-white/10 pt-8 transition-colors hover:border-white/40"
    >
      <span>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">
          Next
        </span>
        <span className="font-display mt-2 block text-xl font-light text-white sm:text-2xl">
          {title}
        </span>
      </span>
      <ArrowGlyph className="h-5 w-5 shrink-0 text-white/55 transition-transform duration-200 group-hover:translate-x-1.5 group-hover:text-white" />
    </Link>
  );
}
