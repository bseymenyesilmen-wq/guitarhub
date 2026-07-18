import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type GhButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type GhButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: GhButtonVariant;
  href?: string;
  fullWidth?: boolean;
};

const variantClass: Record<GhButtonVariant, string> = {
  primary: "bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg shadow-red-950/35 hover:from-red-400 hover:to-red-600",
  secondary: "border border-white/10 bg-white/[0.06] text-zinc-100 hover:border-red-500/45 hover:bg-white/10",
  ghost: "bg-zinc-950/60 text-zinc-300 hover:bg-zinc-900 hover:text-white",
  danger: "bg-red-950/80 text-red-100 ring-1 ring-red-500/25 hover:bg-red-800",
};

export function GhButton({ children, variant = "primary", href, fullWidth = false, className = "", type = "button", ...props }: GhButtonProps) {
  const classes = `inline-flex min-h-12 items-center justify-center rounded-2xl px-5 py-3 text-sm font-black transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${variantClass[variant]} ${fullWidth ? "w-full" : ""} ${className}`;

  if (href) {
    return <Link href={href} className={classes}>{children}</Link>;
  }

  return <button type={type} className={classes} {...props}>{children}</button>;
}
