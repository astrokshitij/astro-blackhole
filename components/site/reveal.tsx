import type { ReactNode } from "react";
/** Content is visible in server HTML. Motion must never gate reading. */
export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  yOffset?: number;
  duration?: number;
  once?: boolean;
}) {
  return <div className={className}>{children}</div>;
}
