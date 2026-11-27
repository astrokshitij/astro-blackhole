import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ArrowGlyph } from "./icons";

/* -------------------------------------------------------------------- *
 *  One definition per pattern. Every page uses these, so spacing, type  *
 *  and interaction stay identical across the site.                      *
 * -------------------------------------------------------------------- */

export const buttonStyles = cva(
  "action-button inline-flex min-h-11 max-w-full items-center justify-center gap-2.5 rounded-full font-bold tracking-[0.03em] transition-[background-color,border-color,color,transform,filter,box-shadow] duration-200 active:translate-y-px",
  {
    variants: {
      variant: {
        primary:
          "font-black text-[#08090c] bg-[linear-gradient(93deg,#f8cd78_0%,#f0b545_55%,#d9951e_100%)] shadow-[0_4px_16px_rgba(240,181,69,0.28)] hover:brightness-105 hover:shadow-[0_6px_22px_rgba(240,181,69,0.38)]",
        secondary:
          "border border-white/25 bg-white/[0.03] text-white/90 hover:border-[#f0b545] hover:text-[#f0b545] hover:bg-white/[0.06]",
        ghost: "text-white/75 hover:text-white",
      },
      size: {
        sm: "px-5 py-2.5 text-sm",
        md: "px-6 py-3 text-base",
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
  target?: string;
  rel?: string;
};

export function ButtonLink({
  href,
  children,
  variant,
  size,
  className,
  external,
  target,
  rel,
}: ButtonLinkProps) {
  const classes = cn(buttonStyles({ variant, size }), className);
  if (external || href.startsWith("http") || href.startsWith("mailto:")) {
    return (
      <a
        href={href}
        className={classes}
        target={target ?? (external ? "_blank" : undefined)}
        rel={rel ?? (target === "_blank" || external ? "noopener noreferrer" : undefined)}
      >
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
    <section id={id} className={cn("editorial-section", className)}>
      <div className="site-width section-inner">
        {children}
      </div>
    </section>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="eyebrow">
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
      <h2 className="section-title mt-4">
        {title}
      </h2>
      {dek ? (
        <p className="mt-4 text-base leading-relaxed text-white/70 sm:text-lg">{dek}</p>
      ) : null}
    </header>
  );
}

/** The continue-reading block at the foot of every inner page. */
export function NextPage({ href, title }: { href: string; title: string }) {
  return (
    <Link
      href={href}
      className="group mt-20 flex items-center justify-between gap-6 rounded-[10px] border border-white/12 bg-[#111319] px-6 py-6 shadow-[0_3px_24px_rgba(0,0,0,0.45)] transition-all hover:border-[#f0b545]/50"
    >
      <span>
        <span className="font-sans text-sm font-bold uppercase tracking-[0.08em] text-[#f0b545]">
          Next page
        </span>
        <span className="font-display mt-1.5 block text-2xl font-black text-white sm:text-3xl">
          {title}
        </span>
      </span>
      <ArrowGlyph className="h-5 w-5 shrink-0 text-[#f0b545] transition-transform duration-200 group-hover:translate-x-1.5" />
    </Link>
  );
}
