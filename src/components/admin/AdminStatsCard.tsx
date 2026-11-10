import type { LucideIcon } from "lucide-react";
import type { StatSource } from "@/lib/admin/service";

type AdminStatsCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  value: number | null;
  /**
   * Shown instead of the number, for a figure that is not a plain count
   * — an amount of money, say, which has to carry its currency. `value`
   * is still what the figure means, so a card can never show a formatted
   * string with nothing behind it.
   */
  valueLabel?: string;
  source: StatSource;
};

const sourceLabels: Record<StatSource, string> = {
  live: "Live",
  catalogue: "From the course catalogue",
  unavailable: "Needs the database",
};

/** One platform figure, always saying where it came from. */
export function AdminStatsCard({ icon: Icon, title, description, value, valueLabel, source }: AdminStatsCardProps) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5 shadow-header">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
            <Icon aria-hidden="true" className="size-5" />
          </span>
          <h3 className="text-base leading-snug font-semibold text-ink">{title}</h3>
        </div>
      </div>
      <p className="mt-4 text-4xl font-bold tracking-tight text-ink">
        {value === null ? <span aria-label="Not available">—</span> : (valueLabel ?? value.toLocaleString("en-US"))}
      </p>
      <p className="mt-1 text-base text-ink-muted">{description}</p>
      <p
        className="mt-3 self-start rounded-full bg-canvas px-2.5 py-0.5 text-sm font-semibold text-ink-muted ring-1 ring-line"
      >
        {sourceLabels[source]}
      </p>
    </div>
  );
}
