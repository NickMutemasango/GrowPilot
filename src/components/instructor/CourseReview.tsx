import { FileText, ImageOff, PlayCircle } from "lucide-react";
import { parsePrice, summariseCurriculum } from "@/lib/instructor/course-draft";
import { formatMinutes, getCategoryLabel } from "@/types/course";
import type { CourseDraft } from "@/types/instructor";

/** Stage 3: everything about the course on one page, as students would understand it. */
export function CourseReview({ draft, onEditStage }: { draft: CourseDraft; onEditStage: (stage: 0 | 1) => void }) {
  const summary = summariseCurriculum(draft);
  const price = draft.isFree ? "Free" : (() => {
    const value = parsePrice(draft.price);
    return value === null ? "Price not set" : `$${value.toFixed(2)} USD`;
  })();
  const details = [
    { label: "Category", value: draft.category ? getCategoryLabel(draft.category) : "Not chosen" },
    { label: "Difficulty", value: draft.level || "Not chosen" },
    { label: "Duration", value: draft.duration || "Not set" },
    { label: "Price", value: price },
  ];

  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="review-info" className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 id="review-info" className="text-xl font-bold text-ink">Course details</h3>
          <EditLink onClick={() => onEditStage(0)} label="Edit course details" />
        </div>
        <div className="mt-4 flex flex-col gap-5 sm:flex-row">
          <div className="flex aspect-[16/9] w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary sm:w-56">
            {draft.thumbnail?.url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={draft.thumbnail.url} alt="Course picture" className="size-full object-cover" />
            ) : (
              <span className="flex flex-col items-center gap-1 text-base text-ink-muted">
                <ImageOff aria-hidden="true" className="size-7" />
                No picture
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold break-words text-ink">{draft.title || "Untitled course"}</p>
            <p className="mt-1 text-lg text-ink-muted">{draft.shortDescription || "No short description yet."}</p>
          </div>
        </div>
        <dl className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {details.map(({ label, value }) => (
            <div key={label} className="flex justify-between gap-4 border-b border-line pb-2 text-lg">
              <dt className="text-ink-muted">{label}</dt>
              <dd className="text-right font-semibold text-ink">{value}</dd>
            </div>
          ))}
        </dl>
        {draft.description && <p className="mt-5 text-lg whitespace-pre-line text-ink">{draft.description}</p>}
        <h4 className="mt-5 text-lg font-bold text-ink">What students will learn</h4>
        <ul className="mt-2 list-disc pl-6 text-lg text-ink marker:text-primary">
          {draft.outcomes.filter((item) => item.trim()).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="review-curriculum" className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 id="review-curriculum" className="text-xl font-bold text-ink">Curriculum</h3>
          <EditLink onClick={() => onEditStage(1)} label="Edit curriculum" />
        </div>
        <p className="mt-1 text-lg text-ink-muted">
          {plural(summary.modules, "module")} · {plural(summary.lessons, "lesson")} · {formatMinutes(summary.minutes)} in total
        </p>
        <ol className="mt-4 flex flex-col gap-4">
          {draft.modules.map((courseModule, index) => (
            <li key={courseModule.id}>
              <p className="text-lg font-bold text-ink">
                Module {index + 1}: {courseModule.title || "Untitled module"}
              </p>
              <ul className="mt-1 flex flex-col gap-1">
                {courseModule.lessons.map((lesson) => {
                  const Icon = lesson.type === "video" ? PlayCircle : FileText;
                  const extras = [lesson.video && "video chosen", lesson.materials.length && `${lesson.materials.length} material(s)`].filter(Boolean);
                  return (
                    <li key={lesson.id} className="flex items-start gap-2 text-base text-ink">
                      <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
                      <span>
                        {lesson.title || "Untitled lesson"}
                        <span className="text-ink-muted">
                          {" "}
                          · {formatMinutes(Math.max(0, lesson.minutes || 0))}
                          {extras.length > 0 && ` · ${extras.join(", ")}`}
                        </span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function EditLink({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className="min-h-11 rounded-xl px-3 text-base font-semibold text-primary underline underline-offset-4 hover:bg-secondary">
      {label}
    </button>
  );
}

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;
