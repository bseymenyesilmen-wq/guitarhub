import type { InputHTMLAttributes } from "react";

type GhInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  helper?: string;
};

export function GhInput({ label, helper, className = "", ...props }: GhInputProps) {
  return (
    <label className="block rounded-2xl border border-white/10 bg-black/35 px-4 py-3 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-500/20">
      <span className="text-[11px] font-black uppercase tracking-[0.16em] text-zinc-500">{label}</span>
      <input
        className={`mt-1 min-h-8 w-full bg-transparent text-base font-bold text-white outline-none placeholder:text-zinc-600 ${className}`}
        {...props}
      />
      {helper && <span className="mt-1 block text-xs font-semibold text-zinc-500">{helper}</span>}
    </label>
  );
}
