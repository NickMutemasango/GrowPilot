"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Ban,
  CircleAlert,
  CircleCheck,
  CircleX,
  DollarSign,
  FileText,
  ImageOff,
  Info,
  Lock,
  NotebookPen,
  Paperclip,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatCoursePrice, publishingProblems } from "@/lib/admin/courses";
import { formatCertificateDate } from "@/lib/certificates/format";
import { formatMinutes, getCategoryLabel } from "@/types/course";
import type { AdminCourse, ReviewMaterial } from "@/types/admin-courses";
import { ApproveCourseDialog } from "./ApproveCourseDialog";
import { CourseEnrollmentOverview } from "./CourseEnrollmentOverview";
import { CourseStatusBadge } from "./CourseStatusBadge";
import { EditCoursePriceDialog } from "./EditCoursePriceDialog";
import { RejectCourseDialog } from "./RejectCourseDialog";
import { UnpublishCourseDialog } from "./UnpublishCourseDialog";
import { useCourseDecisions } from "./useCourseDecisions";

type AdminCourseReviewProps = {
  course: AdminCourse;
  actorId: string;
};

type OpenDialog = "approve" | "reject" | "unpublish" | "price" | null;

/**
 * One course, in full, for an administrator to inspect before deciding.
 * Only administrators reach this page (checked on the server in the admin
 * layout and again on the page), so unpublished material is never exposed.
 */
export function AdminCourseReview({ course, actorId }: AdminCourseReviewProps) {
  const [open, setOpen] = useState<OpenDialog>(null);
  const { busy, notice, noticeRef, run } = useCourseDecisions({ actorId });

  const problems = publishingProblems(course);
  const lessons = course.modules.flatMap((courseModule) => courseModule.lessons);
  const totalMinutes = lessons.reduce((sum, lesson) => sum + lesson.minutes, 0);

  const act = async (input: Parameters<typeof run>[0]) => {
    const ok = await run(input);
    if (ok) setOpen(null);
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/admin/courses" className="inline-flex min-h-11 items-center gap-2 text-base font-semibold text-primary hover:underline">
          <ArrowLeft aria-hidden="true" className="size-5" />
          Back to Course Management
        </Link>
      </div>

      <header className="flex flex-col gap-5 md:flex-row">
        <span className="relative block aspect-[16/9] w-full shrink-0 overflow-hidden rounded-2xl bg-secondary md:w-72">
          {course.thumbnailUrl ? (
            <Image src={course.thumbnailUrl} alt={course.thumbnailAlt} fill sizes="(min-width: 768px) 288px, 100vw" className="object-cover" />
          ) : (
            <span className="flex size-full flex-col items-center justify-center gap-1 text-ink-muted">
              <ImageOff aria-hidden="true" className="size-7" />
              <span className="text-base">No picture yet</span>
            </span>
          )}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <CourseStatusBadge status={course.status} />
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">{course.title}</h1>
          <p className="mt-2 text-lg text-ink-muted">
            By {course.instructorName}
            {course.instructorTitle ? ` · ${course.instructorTitle}` : ""}
          </p>
          {course.submittedAt && (
            <p className="mt-1 text-base text-ink-muted">Submitted {formatCertificateDate(course.submittedAt)}</p>
          )}
        </div>
      </header>

      <div ref={noticeRef} tabIndex={-1} role="status" className="empty:hidden focus:outline-none">
        {notice && (
          <p
            className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-base ${
              notice.ok ? "border-primary bg-secondary text-primary-strong" : "border-[#f3c7c2] bg-[#FDECEA] text-[#9A3412]"
            }`}
          >
            {notice.ok ? <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0" /> : <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0" />}
            {notice.text}
          </p>
        )}
      </div>

      {course.reviewFeedback && (
        <p className="rounded-2xl border-2 border-[#f3c7c2] bg-[#FDECEA] p-4 text-base text-[#9A3412]">
          <strong className="font-semibold">Returned for improvements{course.reviewedAt ? ` on ${formatCertificateDate(course.reviewedAt)}` : ""}:</strong>{" "}
          {course.reviewFeedback}
        </p>
      )}
      {course.unpublishReason && course.status === "unpublished" && (
        <p className="rounded-2xl border border-line bg-surface p-4 text-base text-ink">
          <strong className="font-semibold">Unpublished{course.unpublishedAt ? ` on ${formatCertificateDate(course.unpublishedAt)}` : ""}:</strong>{" "}
          {course.unpublishReason} Students already enrolled keep their access.
        </p>
      )}

      {/* Actions first: this is why an administrator opened the page. */}
      <section aria-labelledby="decision-heading" className="rounded-2xl border border-line bg-surface p-5 shadow-header">
        <h2 id="decision-heading" className="text-xl font-bold text-ink">
          Decision
        </h2>
        <p className="mt-1 text-base text-ink-muted">{decisionHelp(course)}</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {(course.status === "pending_review" || course.status === "unpublished") && (
            <Button size="lg" onClick={() => setOpen("approve")}>
              <CircleCheck aria-hidden="true" className="size-5" />
              {course.status === "unpublished" ? "Publish Again" : "Approve & Publish"}
            </Button>
          )}
          {course.status === "pending_review" && (
            <Button size="lg" variant="secondary" onClick={() => setOpen("reject")} className="border-[#b42318]! text-[#b42318]! hover:bg-[#FDECEA]!">
              <CircleX aria-hidden="true" className="size-5" />
              Reject Course
            </Button>
          )}
          {course.status === "published" && (
            <Button size="lg" variant="secondary" onClick={() => setOpen("unpublish")} className="border-[#b42318]! text-[#b42318]! hover:bg-[#FDECEA]!">
              <Ban aria-hidden="true" className="size-5" />
              Unpublish Course
            </Button>
          )}
          <Button size="lg" variant="secondary" onClick={() => setOpen("price")}>
            <DollarSign aria-hidden="true" className="size-5" />
            Edit Price
          </Button>
        </div>
      </section>

      <section aria-labelledby="info-heading" className="rounded-2xl border border-line bg-surface p-5 shadow-header">
        <h2 id="info-heading" className="text-xl font-bold text-ink">
          Course Information
        </h2>
        <dl className="mt-4 grid gap-x-6 gap-y-3 text-base sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Category">{course.category ? getCategoryLabel(course.category) : "Not chosen"}</Detail>
          <Detail label="Difficulty">{course.level || "Not chosen"}</Detail>
          <Detail label="Duration">{course.duration || "Not given"}</Detail>
          <Detail label="Price">
            {formatCoursePrice(course.priceUsd, course.currency)}{" "}
            <span className="font-normal text-ink-muted">({course.currency})</span>
          </Detail>
          <Detail label="Modules">{course.modules.length}</Detail>
          <Detail label="Lessons">
            {lessons.length} · {formatMinutes(totalMinutes)} in total
          </Detail>
        </dl>
        <div className="mt-5">
          <h3 className="text-lg font-bold text-ink">Short description</h3>
          <p className="mt-1 text-base text-ink">{course.shortDescription || "None given."}</p>
          <h3 className="mt-4 text-lg font-bold text-ink">Full description</h3>
          {course.description ? (
            course.description.split("\n\n").map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="mt-1 text-base text-ink">
                {paragraph}
              </p>
            ))
          ) : (
            <p className="mt-1 text-base text-ink-muted">None given.</p>
          )}
        </div>
        <div className="mt-5 border-t border-line pt-4">
          <h3 className="text-lg font-bold text-ink">Instructor</h3>
          <p className="mt-1 text-base text-ink">
            {course.instructorName}
            {course.instructorTitle ? ` — ${course.instructorTitle}` : ""}
          </p>
        </div>
      </section>

      <section aria-labelledby="requirements-heading" className="rounded-2xl border border-line bg-surface p-5 shadow-header">
        <h2 id="requirements-heading" className="text-xl font-bold text-ink">
          Publishing Requirements
        </h2>
        {problems.length === 0 ? (
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-secondary p-3 text-base text-primary-strong">
            <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
            This course meets every requirement: a title and descriptions, a category, a valid price, at least one
            module and at least one complete lesson.
          </p>
        ) : (
          <div className="mt-3 rounded-xl border-2 border-[#f3c7c2] bg-[#FDECEA] p-3 text-base text-[#9A3412]">
            <p className="flex items-start gap-2 font-semibold">
              <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
              Not ready to publish:
            </p>
            <ul className="mt-2 list-disc pl-9">
              {problems.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section aria-labelledby="curriculum-heading" className="rounded-2xl border border-line bg-surface p-5 shadow-header">
        <h2 id="curriculum-heading" className="text-xl font-bold text-ink">
          Course Curriculum
        </h2>
        <p className="mt-1 flex items-start gap-2 text-base text-ink-muted">
          <Lock aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
          Submitted lessons and materials are shown to administrators only. They are never served to students until the
          course is published.
        </p>
        {course.modules.length === 0 ? (
          <p className="mt-4 text-base text-ink-muted">No modules have been added yet.</p>
        ) : (
          <ol className="mt-4 flex flex-col gap-4">
            {course.modules.map((courseModule, index) => (
              <li key={courseModule.id} className="rounded-xl border border-line p-4">
                <h3 className="text-lg font-bold text-ink">
                  Module {index + 1}: {courseModule.title || "Untitled module"}
                </h3>
                {courseModule.description && <p className="mt-1 text-base text-ink-muted">{courseModule.description}</p>}
                {courseModule.lessons.length === 0 ? (
                  <p className="mt-2 text-base text-[#9A3412]">This module has no lessons.</p>
                ) : (
                  <ol className="mt-3 flex flex-col gap-3">
                    {courseModule.lessons.map((lesson, lessonIndex) => (
                      <li key={lesson.id} className="rounded-lg bg-canvas p-3">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <p className="font-semibold text-ink">
                            {index + 1}.{lessonIndex + 1} {lesson.title || "Untitled lesson"}
                          </p>
                          <p className="text-base text-ink-muted">
                            {lesson.type === "video" ? "Video" : "Reading"} · {formatMinutes(lesson.minutes)}
                          </p>
                        </div>
                        {lesson.description && <p className="mt-1 text-base text-ink-muted">{lesson.description}</p>}
                        {lesson.notes && (
                          <p className="mt-2 flex items-start gap-2 text-base text-ink">
                            <NotebookPen aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary" />
                            <span>
                              <span className="font-semibold">Written notes: </span>
                              {lesson.notes}
                            </span>
                          </p>
                        )}
                        <ul className="mt-2 flex flex-wrap gap-2">
                          {lesson.materials.map((material) => (
                            <li key={material.name}>
                              <MaterialChip material={material} />
                            </li>
                          ))}
                        </ul>
                        {lesson.materials.length === 0 && !lesson.notes && (
                          <p className="mt-2 text-base text-[#9A3412]">No notes or materials have been added to this lesson.</p>
                        )}
                      </li>
                    ))}
                  </ol>
                )}
              </li>
            ))}
          </ol>
        )}
        <p className="mt-4 text-sm text-ink-muted">
          File storage isn&apos;t configured yet, so uploaded videos and documents are listed by name. Once storage is
          set up, each one opens here through a short-lived, administrator-only link.
        </p>
      </section>

      <CourseEnrollmentOverview stats={course.enrolment} sample={false} />

      <ApproveCourseDialog
        course={open === "approve" ? course : null}
        busy={busy}
        onCancel={() => setOpen(null)}
        onConfirm={() => act({ kind: "approve", course })}
      />
      <RejectCourseDialog
        course={open === "reject" ? course : null}
        busy={busy}
        onCancel={() => setOpen(null)}
        onConfirm={(reason) => act({ kind: "reject", course, reason })}
      />
      <UnpublishCourseDialog
        course={open === "unpublish" ? course : null}
        busy={busy}
        onCancel={() => setOpen(null)}
        onConfirm={(reason) => act({ kind: "unpublish", course, reason })}
      />
      <EditCoursePriceDialog
        course={open === "price" ? course : null}
        busy={busy}
        onCancel={() => setOpen(null)}
        onConfirm={(price) => act({ kind: "price", course, price })}
      />
    </div>
  );
}

function decisionHelp(course: AdminCourse): string {
  switch (course.status) {
    case "pending_review":
      return "Approve this course to put it in the catalogue, or return it to the instructor with feedback.";
    case "published":
      return "This course is live in the catalogue. You can change its price, or take it out of the catalogue.";
    case "unpublished":
      return "This course is out of the catalogue. Students already enrolled still have access.";
    case "rejected":
      return "This course is with its instructor for improvements. It will come back here when they submit it again.";
    case "draft":
      return "The instructor is still preparing this course. It can't be reviewed until they submit it.";
  }
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-line pb-2">
      <dt className="text-sm font-semibold text-ink-muted">{label}</dt>
      <dd className="font-semibold text-ink">{children}</dd>
    </div>
  );
}

function MaterialChip({ material }: { material: ReviewMaterial }) {
  const Icon = material.kind === "video" ? Video : material.kind === "pdf" ? FileText : material.kind === "notes" ? NotebookPen : Paperclip;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-base text-ink ring-1 ring-line">
      <Icon aria-hidden="true" className="size-4 text-primary" />
      {material.name}
    </span>
  );
}
