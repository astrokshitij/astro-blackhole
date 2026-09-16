"use client";

import React, { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(255, 255, 255, 0.08)",
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-white/12 bg-gradient-to-b from-white/[0.045] to-white/[0.015] p-7 transition-[border-color,background-color,transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-white/30 hover:shadow-[0_16px_50px_-15px_rgba(255,255,255,0.12)] sm:p-9",
        className
      )}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Layer */}
      <div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(520px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 70%)`,
        }}
        aria-hidden="true"
      />
      {/* Top Bevel Highlight (Simulates directional glass lighting) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
        aria-hidden="true"
      />
      <div className="relative z-10 flex h-full flex-col">{children}</div>
    </div>
  );
}

interface SpotlightLinkProps extends React.ComponentPropsWithoutRef<typeof Link> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
}

export function SpotlightLink({
  href,
  children,
  className,
  spotlightColor = "rgba(255, 255, 255, 0.09)",
  ...props
}: SpotlightLinkProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  return (
    <Link
      ref={cardRef}
      href={href}
      onMouseMove={handleMouseMove}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-white/12 bg-gradient-to-b from-white/[0.045] to-white/[0.015] p-7 transition-[border-color,background-color,transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-white/30 hover:shadow-[0_16px_50px_-15px_rgba(255,255,255,0.12)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:p-9",
        className
      )}
      {...props}
    >
      {/* Dynamic Cursor Spotlight Layer */}
      <div
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(520px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 70%)`,
        }}
        aria-hidden="true"
      />
      {/* Top Bevel Highlight (Simulates directional glass lighting) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"
        aria-hidden="true"
      />
      <div className="relative z-10 flex h-full flex-col">{children}</div>
    </Link>
  );
}
