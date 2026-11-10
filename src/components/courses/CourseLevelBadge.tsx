import type { CourseLevel } from "@/types/course";

const styles: Record<CourseLevel, { bars: number; className: string }> = {
  Beginner: { bars: 1, className: "bg-secondary text-primary-strong" },
  Intermediate: { bars: 2, className: "bg-accent/35 text-[#6b4e00]" },
  Advanced: { bars: 3, className: "bg-ink text-white" },
};

/**
 * Difficulty badge. The word is always shown; the 1–3 bars and colour are
 * extra hints, so meaning never depends on colour alone.
 */
export function CourseLevelBadge({ level }: { level: CourseLevel }) {
  const { bars, className } = styles[level];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-base font-semibold ${className}`}
    >
      <span aria-hidden="true" className="flex items-end gap-0.5">
        {[1, 2, 3].map((bar) => (
          <span
            key={bar}
            className={`w-1 rounded-sm bg-current ${bar <= bars ? "" : "opacity-25"}`}
            style={{ height: `${4 + bar * 3}px` }}
          />
        ))}
      </span>
      {level}
    </span>
  );
}
