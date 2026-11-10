import { CircleCheck, CircleDashed, CirclePlay } from "lucide-react";
import type { LessonStatus } from "@/types/student";

const statuses = {
  completed: { label: "Completed", icon: CircleCheck },
  "in-progress": { label: "In progress", icon: CirclePlay },
  "not-started": { label: "Not started", icon: CircleDashed },
} satisfies Record<LessonStatus, { label: string; icon: typeof CircleCheck }>;

type LessonCompletionStatusProps = {
  status: LessonStatus;
  /** Use on a dark (green) background, such as the current lesson. */
  inverted?: boolean;
  /** "Not started" is read by screen readers but not shown, to keep long lists calm. */
  hideNotStarted?: boolean;
};

/** A lesson's status in words and an icon, so it never depends on colour alone. */
export function LessonCompletionStatus({ status, inverted, hideNotStarted }: LessonCompletionStatusProps) {
  const { label, icon: Icon } = statuses[status];
  if (status === "not-started" && hideNotStarted) return <span className="sr-only">{label}</span>;

  const tone = inverted
    ? "text-white"
    : status === "completed"
      ? "text-primary-strong"
      : "text-ink-muted";

  return (
    <span className={`inline-flex items-center gap-1 font-semibold ${tone}`}>
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      {label}
    </span>
  );
}
