"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CircleAlert, CircleCheck, Info, Plus, Save, Send, Trash2 } from "lucide-react";
import { saveCourseAction } from "@/app/instructor/actions";
import { Button, ButtonLink } from "@/components/ui/Button";
import {
  canSaveDraft,
  canSubmitForReview,
  statusAfterSave,
  validateCourseInfo,
  validateCurriculum,
  type InfoErrors,
} from "@/lib/instructor/course-draft";
import { COURSE_CATEGORIES, COURSE_LEVELS } from "@/types/course";
import type { CourseDraft, DraftFile } from "@/types/instructor";
import { CourseCurriculumBuilder } from "./CourseCurriculumBuilder";
import { CourseReview } from "./CourseReview";
import { CourseStatusBadge } from "./CourseStatusBadge";
import { IconButton, SelectField, TextArea, TextField } from "./fields";
import { ThumbnailUpload } from "./uploads/ThumbnailUpload";

const STAGES = ["Course Information", "Course Curriculum", "Review Course"] as const;

type CourseCreationFormProps = {
  initial: CourseDraft;
  mode: "create" | "edit";
  uploadsAvailable: boolean;
};

type Notice = { tone: "success" | "info" | "error"; text: string } | null;

/**
 * The guided course editor: information, curriculum, review. "Save as
 * Draft" works at every stage so nothing is lost; only a complete course
 * can be submitted for review, and only an administrator can publish it.
 */
export function CourseCreationForm({ initial, mode, uploadsAvailable }: CourseCreationFormProps) {
  const [draft, setDraft] = useState(initial);
  const [stage, setStage] = useState<0 | 1 | 2>(0);
  const [infoErrors, setInfoErrors] = useState<InfoErrors>({});
  const [curriculumProblems, setCurriculumProblems] = useState<string[]>([]);
  const [notice, setNotice] = useState<Notice>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const noticeRef = useRef<HTMLDivElement>(null);

  // Warn before leaving with unsaved changes: closing the tab, or following a link on the site.
  useEffect(() => {
    if (!dirty) return;
    const warnUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    const warnLink = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!link || link.getAttribute("target") === "_blank") return;
      if (!window.confirm("You have changes that aren't saved. Leave this page and lose them?")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", warnUnload);
    document.addEventListener("click", warnLink, true);
    return () => {
      window.removeEventListener("beforeunload", warnUnload);
      document.removeEventListener("click", warnLink, true);
    };
  }, [dirty]);

  const update = (changes: Partial<CourseDraft>) => {
    setDraft((current) => ({ ...current, ...changes }));
    setDirty(true);
  };

  const goTo = (next: 0 | 1 | 2) => {
    setStage(next);
    setNotice(null);
    requestAnimationFrame(() => {
      headingRef.current?.focus();
      headingRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    });
  };

  const next = () => {
    if (stage === 0) {
      const errors = validateCourseInfo(draft);
      setInfoErrors(errors);
      if (Object.keys(errors).length) return showProblem("Please fix the highlighted details before moving on.");
      goTo(1);
    } else if (stage === 1) {
      const problems = validateCurriculum(draft);
      setCurriculumProblems(problems);
      if (problems.length) return showProblem("Please fix the items listed above before moving on.");
      goTo(2);
    }
  };

  const showProblem = (text: string) => {
    setNotice({ tone: "error", text });
    requestAnimationFrame(() => noticeRef.current?.focus());
  };

  const save = async (intent: "draft" | "review") => {
    if (intent === "draft" && !canSaveDraft(draft)) {
      setStage(0);
      setInfoErrors({ title: "Please give your course a title so you can find it later." });
      return showProblem("Add a course title first, then save your draft.");
    }
    if (intent === "review" && !canSubmitForReview(draft)) {
      setInfoErrors(validateCourseInfo(draft));
      setCurriculumProblems(validateCurriculum(draft));
      return showProblem("Some details are missing. Please check Course Information and Course Curriculum.");
    }

    const saved: CourseDraft = { ...draft, status: statusAfterSave(intent), updatedAt: new Date().toISOString() };
    setSaving(true);
    try {
      const result = await saveCourseAction(withoutLocalLinks(saved), intent);
      if (result.ok) {
        setDraft(saved);
        setDirty(false);
        // Give the new course its edit address without reloading, so this message stays on screen.
        if (mode === "create") window.history.replaceState(null, "", `/instructor/courses/${saved.id}/edit`);
      }
      setNotice({ tone: result.ok ? "success" : "error", text: result.message });
    } catch {
      setNotice({ tone: "error", text: "We couldn't save your course. Please check your internet connection and try again." });
    } finally {
      setSaving(false);
      requestAnimationFrame(() => noticeRef.current?.focus());
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <CourseStatusBadge status={draft.status} />
        {draft.hasLiveVersion && (
          <p className="text-base text-ink-muted">Students keep seeing the approved version until your changes are approved.</p>
        )}
      </div>

      <ol aria-label="Steps" className="grid gap-2 sm:grid-cols-3">
        {STAGES.map((label, index) => {
          const current = index === stage;
          return (
            <li key={label}>
              <button
                type="button"
                aria-current={current ? "step" : undefined}
                onClick={() => (index < stage ? goTo(index as 0 | 1 | 2) : undefined)}
                disabled={index > stage}
                className={`flex min-h-14 w-full items-center gap-3 rounded-xl border-2 px-3 text-left text-base font-semibold ${
                  current ? "border-primary bg-primary text-white" : index < stage ? "border-primary/40 bg-secondary text-primary-strong hover:bg-secondary-hover" : "border-line bg-surface text-ink-muted"
                }`}
              >
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${current ? "bg-white text-primary" : "bg-surface"}`}>
                  {index < stage ? <CircleCheck aria-hidden="true" className="size-5 text-primary" /> : index + 1}
                </span>
                <span>
                  <span className="sr-only">Step {index + 1} of 3: </span>
                  {label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <section aria-labelledby="stage-heading" className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-8">
        <h2 id="stage-heading" ref={headingRef} tabIndex={-1} className="scroll-mt-28 text-2xl font-bold tracking-tight text-ink">
          Stage {stage + 1}: {STAGES[stage]}
        </h2>

        {stage === 1 && curriculumProblems.length > 0 && (
          <ul className="mt-4 flex flex-col gap-1 rounded-2xl border-2 border-[#f3c7c2] bg-[#FDECEA] p-4 text-base text-[#9A3412]">
            {curriculumProblems.map((problem) => (
              <li key={problem} className="flex gap-2">
                <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
                {problem}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6">
          {stage === 0 && <InfoStage draft={draft} errors={infoErrors} update={update} uploadsAvailable={uploadsAvailable} />}
          {stage === 1 && <CourseCurriculumBuilder modules={draft.modules} onChange={(modules) => update({ modules })} uploadsAvailable={uploadsAvailable} />}
          {stage === 2 && <CourseReview draft={draft} onEditStage={goTo} />}
        </div>
      </section>

      <div ref={noticeRef} tabIndex={-1} role="status" className="empty:hidden focus:outline-none">
        {notice && (
          <p
            className={`flex items-start gap-3 rounded-2xl border-2 p-4 text-base ${
              notice.tone === "success"
                ? "border-primary bg-secondary text-primary-strong"
                : notice.tone === "error"
                  ? "border-[#f3c7c2] bg-[#FDECEA] text-[#9A3412]"
                  : "border-accent bg-accent/15 text-ink"
            }`}
          >
            {notice.tone === "success" ? <CircleCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0" /> : <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0" />}
            {notice.text}
          </p>
        )}
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          {stage > 0 ? (
            <Button variant="secondary" size="lg" onClick={() => goTo((stage - 1) as 0 | 1)}>
              <ArrowLeft aria-hidden="true" className="size-5" />
              Back
            </Button>
          ) : (
            <ButtonLink href="/instructor/courses" variant="secondary" size="lg">
              <ArrowLeft aria-hidden="true" className="size-5" />
              My Courses
            </ButtonLink>
          )}
          <Button variant="secondary" size="lg" onClick={() => save("draft")} disabled={saving}>
            <Save aria-hidden="true" className="size-5" />
            Save as Draft
          </Button>
        </div>
        {stage < 2 ? (
          <Button size="lg" onClick={next}>
            Next: {STAGES[stage + 1]}
            <ArrowRight aria-hidden="true" className="size-5" />
          </Button>
        ) : (
          <Button size="lg" onClick={() => save("review")} disabled={saving || draft.status === "pending_review"}>
            <Send aria-hidden="true" className="size-5" />
            {draft.status === "pending_review" ? "Waiting for Review" : "Submit for Review"}
          </Button>
        )}
      </div>
      {stage === 2 && (
        <p className="text-base text-ink-muted">
          Submitting sends your course to the GrowPilot team. They check it before it appears in the catalogue; you
          can&apos;t publish it yourself.
        </p>
      )}
    </div>
  );
}

function InfoStage({
  draft,
  errors,
  update,
  uploadsAvailable,
}: {
  draft: CourseDraft;
  errors: InfoErrors;
  update: (changes: Partial<CourseDraft>) => void;
  uploadsAvailable: boolean;
}) {
  return (
    <div className="flex flex-col gap-6">
      <TextField label="Course title" value={draft.title} onChange={(title) => update({ title })} error={errors.title} placeholder="e.g. Computer Basics for Beginners" maxLength={100} />
      <TextArea label="Short description" value={draft.shortDescription} onChange={(shortDescription) => update({ shortDescription })} error={errors.shortDescription} rows={2} maxLength={200} hint="One sentence shown on course cards." />
      <TextArea label="Full description" value={draft.description} onChange={(description) => update({ description })} error={errors.description} rows={6} hint="What the course covers and who it's for. Use short paragraphs." />
      <div className="grid gap-6 md:grid-cols-2">
        <SelectField
          label="Course category"
          value={draft.category}
          onChange={(category) => update({ category: category as CourseDraft["category"] })}
          options={COURSE_CATEGORIES.map((item) => ({ value: item.id, label: item.label }))}
          error={errors.category}
        />
        <SelectField
          label="Difficulty level"
          value={draft.level}
          onChange={(level) => update({ level: level as CourseDraft["level"] })}
          options={COURSE_LEVELS.map((level) => ({ value: level, label: level }))}
          error={errors.level}
        />
      </div>
      <div className="md:max-w-sm">
        <TextField label="Course duration" value={draft.duration} onChange={(duration) => update({ duration })} error={errors.duration} placeholder="e.g. 4 weeks" maxLength={40} />
      </div>
      <ThumbnailUpload value={draft.thumbnail} onChange={(thumbnail) => update({ thumbnail })} uploadsAvailable={uploadsAvailable} />

      <fieldset className="min-w-0">
        <legend className="text-lg font-semibold text-ink">Course price</legend>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          {[
            { free: true, label: "Free course" },
            { free: false, label: "Paid course" },
          ].map((option) => (
            <label
              key={option.label}
              className={`flex min-h-12 flex-1 cursor-pointer items-center gap-3 rounded-xl border-2 px-4 text-base font-semibold has-focus-visible:outline-3 has-focus-visible:outline-primary-strong ${
                draft.isFree === option.free ? "border-primary bg-secondary text-primary-strong" : "border-line text-ink"
              }`}
            >
              <input type="radio" name="price-type" checked={draft.isFree === option.free} onChange={() => update({ isFree: option.free })} className="size-5 accent-primary" />
              {option.label}
            </label>
          ))}
        </div>
        {!draft.isFree && (
          <div className="mt-4 md:max-w-xs">
            <TextField label="Price in US dollars" inputMode="decimal" value={draft.price} onChange={(price) => update({ price })} error={errors.price} placeholder="e.g. 29" hint="Students pay this once." />
          </div>
        )}
      </fieldset>

      <fieldset className="min-w-0">
        <legend className="text-lg font-semibold text-ink">What students will learn</legend>
        <p className="text-base text-ink-muted">Short, clear points, for example &ldquo;Use a mouse and keyboard.&rdquo;</p>
        <ul className="mt-3 flex flex-col gap-2">
          {draft.outcomes.map((outcome, index) => (
            <li key={index} className="flex items-center gap-2">
              <input
                aria-label={`Learning point ${index + 1}`}
                value={outcome}
                maxLength={150}
                onChange={(event) => update({ outcomes: draft.outcomes.map((item, i) => (i === index ? event.target.value : item)) })}
                className="h-12 min-w-0 flex-1 rounded-xl border-2 border-line bg-surface px-4 text-lg text-ink focus:border-primary"
              />
              <IconButton
                label={`Remove learning point ${index + 1}`}
                danger
                disabled={draft.outcomes.length === 1}
                onClick={() => update({ outcomes: draft.outcomes.filter((_, i) => i !== index) })}
              >
                <Trash2 aria-hidden="true" className="size-5" />
              </IconButton>
            </li>
          ))}
        </ul>
        {errors.outcomes && <p className="mt-2 text-base font-medium text-[#b42318]">{errors.outcomes}</p>}
        <Button variant="secondary" className="mt-3" onClick={() => update({ outcomes: [...draft.outcomes, ""] })} disabled={draft.outcomes.length >= 12}>
          <Plus aria-hidden="true" className="size-5" />
          Add Learning Point
        </Button>
      </fieldset>
    </div>
  );
}

/** Local preview links only work in this browser tab, so they are never sent to the server. */
function withoutLocalLinks(draft: CourseDraft): CourseDraft {
  const clean = (file: DraftFile | null) => file && { ...file, url: file.uploaded ? file.url : null };
  return {
    ...draft,
    thumbnail: clean(draft.thumbnail),
    modules: draft.modules.map((courseModule) => ({
      ...courseModule,
      lessons: courseModule.lessons.map((lesson) => ({
        ...lesson,
        video: clean(lesson.video),
        materials: lesson.materials.map((file) => clean(file)!),
      })),
    })),
  };
}
