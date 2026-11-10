import { CircleCheck, CircleDashed, CirclePlay, Users } from "lucide-react";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { formatCertificateDate } from "@/lib/certificates/format";
import { calculateProgress, getCourseStatus } from "@/lib/progress/calculate";
import type { InstructorStudentRow } from "@/types/instructor";
import type { CourseStatus } from "@/types/student";

const statuses: Record<CourseStatus, { label: string; icon: typeof CircleCheck; className: string }> = {
  "not-started": { label: "Not Started", icon: CircleDashed, className: "bg-canvas text-ink ring-1 ring-line" },
  "in-progress": { label: "In Progress", icon: CirclePlay, className: "bg-accent/35 text-[#6b4e00]" },
  completed: { label: "Completed", icon: CircleCheck, className: "bg-primary text-white" },
};

/** Students in the instructor's courses: name, course, date and progress only. */
export function StudentProgressTable({ rows }: { rows: InstructorStudentRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-3xl border-2 border-dashed border-line bg-surface px-6 py-14 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
          <Users aria-hidden="true" className="size-8" />
        </span>
        <h2 className="mt-5 text-2xl font-bold text-ink">No Students Enrolled Yet</h2>
        <p className="mt-2 max-w-md text-lg text-ink-muted">Your enrolled students will appear here once your course is available.</p>
      </div>
    );
  }

  const withProgress = rows.map((row) => ({
    ...row,
    progress: calculateProgress(row.completedLessons, row.totalLessons),
    status: getCourseStatus(row.completedLessons, row.totalLessons),
  }));

  return (
    <>
      <table className="hidden w-full overflow-hidden rounded-2xl border border-line bg-surface text-left md:table">
        <thead className="bg-secondary/60 text-base text-ink">
          <tr>
            <th scope="col" className="px-5 py-3 font-semibold">Student</th>
            <th scope="col" className="px-5 py-3 font-semibold">Course</th>
            <th scope="col" className="px-5 py-3 font-semibold">Enrolled</th>
            <th scope="col" className="w-64 px-5 py-3 font-semibold">Progress</th>
            <th scope="col" className="px-5 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line text-base">
          {withProgress.map((row) => (
            <tr key={row.id}>
              <th scope="row" className="px-5 py-4 font-semibold text-ink">{row.displayName}</th>
              <td className="px-5 py-4 text-ink">{row.courseTitle}</td>
              <td className="px-5 py-4 whitespace-nowrap text-ink">{formatCertificateDate(row.enrolledAt)}</td>
              <td className="px-5 py-4">
                <ProgressBar value={row.progress} label={`${row.displayName}, ${row.courseTitle}`} detail={`${row.completedLessons} of ${row.totalLessons}`} />
              </td>
              <td className="px-5 py-4">
                <StatusBadge status={row.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="flex flex-col gap-3 md:hidden">
        {withProgress.map((row) => (
          <li key={row.id} className="rounded-2xl border border-line bg-surface p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-bold text-ink">{row.displayName}</p>
                <p className="text-base text-ink-muted">{row.courseTitle}</p>
                <p className="text-base text-ink-muted">Enrolled {formatCertificateDate(row.enrolledAt)}</p>
              </div>
              <StatusBadge status={row.status} />
            </div>
            <div className="mt-3">
              <ProgressBar value={row.progress} label={`${row.displayName}, ${row.courseTitle}`} detail={`${row.completedLessons} of ${row.totalLessons} lessons`} />
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function StatusBadge({ status }: { status: CourseStatus }) {
  const { label, icon: Icon, className } = statuses[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-base font-semibold whitespace-nowrap ${className}`}>
      <Icon aria-hidden="true" className="size-4" />
      {label}
    </span>
  );
}
