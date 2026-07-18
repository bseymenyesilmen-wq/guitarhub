import type { ReactNode } from "react";

type GhEmptyStateProps = {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function GhEmptyState({ icon = "♪", title, description, action }: GhEmptyStateProps) {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-white/12 bg-black/25 p-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-600/15 text-2xl text-red-200 ring-1 ring-red-500/25">{icon}</div>
      <h3 className="mt-4 text-xl font-black text-white">{title}</h3>
      {description && <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-zinc-400">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
