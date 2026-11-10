import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CourseEditorLoader } from "@/components/instructor/CourseEditorLoader";
import { getOwnedCourse, requireInstructor } from "@/lib/instructor/service";
import { getFileStorage } from "@/lib/instructor/store";

export const metadata: Metadata = { title: "Edit Course" };

type Props = { params: Promise<{ courseId: string }> };

/** Only the course's owner can open it; anyone else gets "not found". */
export default async function EditCoursePage({ params }: Props) {
  const { courseId } = await params;
  const { instructor } = await requireInstructor(`/instructor/courses/${courseId}/edit`);
  const owned = await getOwnedCourse(courseId, instructor.id);
  if (!owned) notFound();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Edit Course</h1>
        <p className="mt-2 text-xl text-ink-muted">Change any details, then save a draft or submit your changes for review.</p>
      </header>
      <CourseEditorLoader
        mode="edit"
        courseId={courseId}
        instructorId={instructor.id}
        serverDraft={owned}
        uploadsAvailable={getFileStorage() !== null}
      />
    </div>
  );
}
