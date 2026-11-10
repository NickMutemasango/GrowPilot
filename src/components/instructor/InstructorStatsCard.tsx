import type { LucideIcon } from "lucide-react";

/** One number with a label, for the instructor overview. Stacked so it reads well at any width. */
export function InstructorStatsCard({ icon: Icon, title, value, note }: { icon: LucideIcon; title: string; value: number; note: string }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5 shadow-header">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
          <Icon aria-hidden="true" className="size-5" />
        </span>
        <h3 className="text-base leading-snug font-semibold text-ink">{title}</h3>
      </div>
      <p className="mt-3 text-4xl font-bold text-ink">{value}</p>
      <p className="mt-1 text-base text-ink-muted">{note}</p>
    </div>
  );
}
