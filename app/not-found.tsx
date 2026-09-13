import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex min-h-[70svh] items-center bg-black pt-16">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/55">
          404
        </p>
        <h1 className="font-display mt-5 text-[clamp(1.9rem,5.5vw,3.5rem)] font-light uppercase leading-[1.08] tracking-[0.1em] text-white">
          Past the horizon
        </h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-white/65 sm:text-base">
          This page is not here. Nothing that crosses an event horizon comes
          back either, but in that case there is at least a reason.
        </p>
        <Link
          href="/"
          className="font-display mt-9 inline-block rounded-full border border-white/30 px-6 py-3 text-xs font-light uppercase tracking-[0.18em] text-white/85 transition-colors hover:border-white hover:text-white"
        >
          Back to the start
        </Link>
      </div>
    </section>
  );
}
