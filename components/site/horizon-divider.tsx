import React from "react";
import { cn } from "@/lib/utils";

export function HorizonDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("relative my-12 flex w-full items-center justify-center sm:my-16", className)}
    >
      {/* Base horizon line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      {/* Ambient photon aura */}
      <div className="absolute h-px w-2/5 bg-gradient-to-r from-transparent via-white/40 to-transparent blur-[1px]" />
      {/* Central event horizon singularity spark */}
      <div className="absolute h-[3px] w-[3px] rounded-full bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.7)]" />
    </div>
  );
}
