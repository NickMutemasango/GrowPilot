import type { Metadata } from "next";
import { StudentProgressTable } from "@/components/instructor/StudentProgressTable";
import { getInstructorStudents, requireInstructor } from "@/lib/instructor/service";

export const metadata: Metadata = { title: "Students" };

export default async function InstructorStudentsPage() {
  const context = await requireInstructor("/instructor/students");
  const rows = await getInstructorStudents(context);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Students</h1>
        <p className="mt-2 text-xl text-ink-muted">See how students in your courses are getting on.</p>
      </header>
      <StudentProgressTable rows={rows} />
      <p className="text-base text-ink-muted">
        To protect students&apos; privacy you see a first name and initial only, never contact details.
      </p>
    </div>
  );
}
