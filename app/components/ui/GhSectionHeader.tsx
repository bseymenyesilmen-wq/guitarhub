import type { ReactNode } from "react";

type GhSectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function GhSectionHeader({ eyebrow, title, description, action }: GhSectionHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="gh-kicker text-[11px] sm:text-xs">{eyebrow}</p>}
        <h2 className="gh-section-title mt-1 text-2xl font-black sm:text-3xl">{title}</h2>
        {description && <p className="gh-muted mt-2 max-w-2xl text-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}
