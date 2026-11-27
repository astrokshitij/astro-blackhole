import type { Metadata } from "next";
import { ButtonLink } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="flex min-h-[70svh] items-center bg-black pt-16">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <p className="font-sans text-sm font-bold uppercase tracking-[0.1em] text-[#f0b545]">
          404
        </p>
        <h1 className="font-display mt-4 text-[clamp(2rem,4.5vw,3.2rem)] font-black leading-[1.1] tracking-tight text-white">
          Past the horizon
        </h1>
        <p className="mt-5 max-w-md text-base leading-relaxed text-white/70 sm:text-lg">
          This page is not here. Nothing that crosses an event horizon comes
          back either, but in that case there is at least a reason.
        </p>
        <div className="mt-9">
          <ButtonLink href="/" variant="secondary">
            Back to the start
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
