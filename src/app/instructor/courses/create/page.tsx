import type { Metadata } from "next";
import { CourseEditorLoader } from "@/components/instructor/CourseEditorLoader";
import { requireInstructor } from "@/lib/instructor/service";
import { getFileStorage } from "@/lib/instructor/store";

export const metadata: Metadata = { title: "Create Course" };

export default async function CreateCoursePage() {
  const { instructor } = await requireInstructor("/instructor/courses/create");

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Create a New Course</h1>
        <p className="mt-2 text-xl text-ink-muted">Three simple stages. You can save a draft at any time and come back later.</p>
      </header>
      <CourseEditorLoader mode="create" instructorId={instructor.id} serverDraft={null} uploadsAvailable={getFileStorage() !== null} />
    </div>
  );
}
