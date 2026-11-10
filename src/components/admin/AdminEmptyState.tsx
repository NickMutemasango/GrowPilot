import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/** A friendly "nothing here" message for admin sections and lists. */
export function AdminEmptyState({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-dashed border-line bg-surface px-6 py-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
        <Icon aria-hidden="true" className="size-7" />
      </span>
      <p className="mt-4 text-lg font-bold text-ink">{title}</p>
      {children && <div className="mt-1 max-w-md text-base text-ink-muted">{children}</div>}
    </div>
  );
}
