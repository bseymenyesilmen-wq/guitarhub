import type { HTMLAttributes, ReactNode } from "react";

type GhCardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  glow?: boolean;
};

export function GhCard({ children, glow = false, className = "", ...props }: GhCardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] border border-white/10 bg-zinc-950/72 p-5 shadow-2xl shadow-black/25 ring-1 ring-white/[0.03] backdrop-blur-xl ${glow ? "shadow-red-950/30 before:pointer-events-none before:absolute before:inset-0 before:rounded-[2rem] before:bg-gradient-to-br before:from-red-500/10 before:to-transparent" : ""} ${className}`}
      {...props}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}
