import { ChevronDown, Lightbulb } from "lucide-react";
import type { NoteSection } from "@/types/learning";

type LessonNotesProps = {
  notes: NoteSection[];
  /** Only passed when the video has a genuine transcript. */
  transcript?: string[];
};

/** "Lesson Notes": the lesson in short, plain-English sections. */
export function LessonNotes({ notes, transcript }: LessonNotesProps) {
  return (
    <section aria-labelledby="notes-heading">
      <h2 id="notes-heading" className="text-2xl font-bold tracking-tight text-ink">
        Lesson Notes
      </h2>

      {notes.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-line bg-surface p-5 text-lg text-ink-muted">
          Written notes for this lesson are not available yet.
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-7 rounded-2xl border border-line bg-surface p-5 sm:p-7">
          {notes.map((section) => (
            <div key={section.heading}>
              <h3 className="text-xl font-bold text-ink">{section.heading}</h3>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="mt-2 max-w-prose text-lg leading-relaxed text-ink">
                  {paragraph}
                </p>
              ))}
              {section.bullets && (
                <ul className="mt-3 flex max-w-prose list-disc flex-col gap-2 pl-6 text-lg leading-relaxed text-ink marker:text-primary">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              )}
              {section.example && (
                <p className="mt-4 flex max-w-prose gap-3 rounded-xl border-l-4 border-accent bg-accent/15 p-4 text-lg leading-relaxed text-ink">
                  <Lightbulb aria-hidden="true" className="mt-1 size-6 shrink-0 text-[#6b4e00]" />
                  <span>
                    <strong className="font-semibold">Example: </strong>
                    {section.example}
                  </span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {transcript && transcript.length > 0 && (
        <details className="group mt-5 rounded-2xl border border-line bg-surface">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 rounded-2xl px-5 text-lg font-bold text-ink hover:bg-secondary/60 [&::-webkit-details-marker]:hidden">
            Video Transcript
            <ChevronDown aria-hidden="true" className="size-6 text-primary transition-transform group-open:rotate-180" />
          </summary>
          <div className="flex flex-col gap-3 border-t border-line px-5 py-4">
            {transcript.map((line, index) => (
              <p key={index} className="max-w-prose text-lg leading-relaxed text-ink">
                {line}
              </p>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}
