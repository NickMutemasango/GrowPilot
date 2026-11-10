"use client";

import { useState } from "react";
import { SearchX } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { createEmptyDraft } from "@/lib/instructor/course-draft";
import type { CourseDraft } from "@/types/instructor";
import { CourseCreationForm } from "./CourseCreationForm";

type CourseEditorLoaderProps = {
  mode: "create" | "edit";
  courseId?: string;
  instructorId: string;
  /** The server's copy of an owned course, if any. */
  serverDraft: CourseDraft | null;
  uploadsAvailable: boolean;
};

/** Picks the right starting point for the editor: a new course, or the server's copy of an owned one. */
export function CourseEditorLoader({ mode, courseId, instructorId, serverDraft, uploadsAvailable }: CourseEditorLoaderProps) {
  const [newDraft] = useState(() => createEmptyDraft(instructorId));

  if (mode === "create") {
    return <CourseCreationForm initial={newDraft} mode="create" uploadsAvailable={uploadsAvailable} />;
  }

  void courseId;
  const draft = serverDraft;
  if (!draft || draft.instructorId !== instructorId) {
    return (
      <div className="flex flex-col items-center rounded-3xl border border-line bg-surface px-6 py-14 text-center">
        <SearchX aria-hidden="true" className="size-10 text-primary" />
        <h2 className="mt-4 text-2xl font-bold text-ink">Course not found</h2>
        <p className="mt-2 text-lg text-ink-muted">We couldn&apos;t find this course among your courses.</p>
        <ButtonLink href="/instructor/courses" size="lg" className="mt-6">
          Back to My Courses
        </ButtonLink>
      </div>
    );
  }
  return <CourseCreationForm key={draft.id} initial={draft} mode="edit" uploadsAvailable={uploadsAvailable} />;
}
