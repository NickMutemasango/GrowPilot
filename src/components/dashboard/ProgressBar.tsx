import { useId } from "react";

type ProgressBarProps = {
  /** 0–100; values outside this range are clamped. */
  value: number;
  /** What the bar measures, read out by screen readers, e.g. the course title. */
  label: string;
  /** Optional plain-English detail, e.g. "4 of 9 lessons done". */
  detail?: string;
  size?: "md" | "lg";
};

/** Green-on-sage progress bar with the percentage always shown as text. */
export function ProgressBar({ value, label, detail, size = "md" }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, Math.round(value)));
  const labelId = useId();

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p id={labelId} className={`font-semibold text-ink ${size === "lg" ? "text-xl" : "text-lg"}`}>
          {percent}% complete
          <span className="sr-only"> for {label}</span>
        </p>
        {detail && <p className="text-base text-ink-muted">{detail}</p>}
      </div>
      <div
        role="progressbar"
        aria-labelledby={labelId}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={detail ? `${percent}% complete, ${detail}` : `${percent}% complete`}
        className={`mt-2 overflow-hidden rounded-full bg-secondary ring-1 ring-primary/10 ${
          size === "lg" ? "h-4" : "h-3"
        }`}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 motion-reduce:transition-none"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
