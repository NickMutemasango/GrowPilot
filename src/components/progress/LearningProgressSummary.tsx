import { ProgressBar } from "@/components/dashboard/ProgressBar";

type LearningProgressSummaryProps = {
  courseTitle: string;
  completed: number;
  total: number;
  progress: number;
};

/** "4 of 9 lessons completed" with a progress bar, for the lesson sidebar. */
export function LearningProgressSummary({ courseTitle, completed, total, progress }: LearningProgressSummaryProps) {
  return (
    <ProgressBar
      value={progress}
      label={courseTitle}
      detail={`${completed} of ${total} lessons completed`}
    />
  );
}
