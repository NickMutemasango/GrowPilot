"use client";

import { useId } from "react";
import { CalendarRange, X } from "lucide-react";
import type { DateRange } from "@/lib/admin/affiliate-reports";

type AffiliateDateRangeBarProps = {
  range: DateRange;
  onChange: (range: DateRange) => void;
  /** Said under the controls, e.g. "8 sales in this period". */
  summary: string;
  /** Shown instead when the two dates are the wrong way round. */
  warning?: string | null;
};

/** From and to, both inclusive. Leaving either empty leaves that end open. */
export function AffiliateDateRangeBar({ range, onChange, summary, warning }: AffiliateDateRangeBarProps) {
  const id = useId();
  const set = (changes: Partial<DateRange>) => onChange({ ...range, ...changes });
  const filtered = Boolean(range.from || range.to);

  return (
    <div
      role="group"
      aria-label="Filter affiliate sales by date"
      className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-44 flex-1 sm:max-w-56">
          <label htmlFor={`${id}-from`} className="text-sm font-semibold text-ink">
            From
          </label>
          <input
            id={`${id}-from`}
            type="date"
            value={range.from}
            max={range.to || undefined}
            onChange={(event) => set({ from: event.target.value })}
            className="mt-1 h-12 w-full rounded-xl border-2 border-line bg-surface px-3 text-base text-ink focus:border-primary"
          />
        </div>
        <div className="min-w-44 flex-1 sm:max-w-56">
          <label htmlFor={`${id}-to`} className="text-sm font-semibold text-ink">
            To
          </label>
          <input
            id={`${id}-to`}
            type="date"
            value={range.to}
            min={range.from || undefined}
            onChange={(event) => set({ to: event.target.value })}
            className="mt-1 h-12 w-full rounded-xl border-2 border-line bg-surface px-3 text-base text-ink focus:border-primary"
          />
        </div>
        {filtered && (
          <button
            type="button"
            onClick={() => onChange({ from: "", to: "" })}
            className="inline-flex min-h-12 items-center justify-center gap-1.5 rounded-xl border-2 border-line px-4 text-base font-semibold whitespace-nowrap text-ink hover:bg-secondary"
          >
            <X aria-hidden="true" className="size-5" />
            Clear dates
          </button>
        )}
      </div>

      <p className="flex items-start gap-2 text-sm text-ink-muted" aria-live="polite">
        <CalendarRange aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <span>
          {warning ?? summary}
          {!warning && !filtered && " Both dates are inclusive; leave one empty to leave that end open."}
        </span>
      </p>
    </div>
  );
}
