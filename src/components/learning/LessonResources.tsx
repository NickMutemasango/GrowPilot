import { Download, FileText, FolderOpen } from "lucide-react";
import type { AvailableResource } from "@/types/learning";

/**
 * "Lesson Resources": only files that were checked to exist on the server
 * are listed, so every Download button works.
 */
export function LessonResources({ resources }: { resources: AvailableResource[] }) {
  return (
    <section aria-labelledby="resources-heading">
      <h2 id="resources-heading" className="text-2xl font-bold tracking-tight text-ink">
        Lesson Resources
      </h2>

      {resources.length === 0 ? (
        <p className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-surface p-5 text-lg text-ink-muted">
          <FolderOpen aria-hidden="true" className="size-6 shrink-0 text-primary" />
          No additional materials for this lesson.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {resources.map((resource) => (
            <li
              key={resource.href}
              className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5"
            >
              <div className="flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                  <FileText aria-hidden="true" className="size-7" />
                </span>
                <span className="flex-1">
                  <span className="block text-lg font-bold text-ink">{resource.title}</span>
                  {resource.description && (
                    <span className="block text-base text-ink-muted">{resource.description}</span>
                  )}
                  <span className="block text-base text-ink-muted">
                    {resource.fileType} file, {resource.sizeLabel}
                  </span>
                </span>
              </div>
              <a
                href={resource.href}
                download
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-center text-base font-semibold text-white shadow-button transition-colors hover:bg-primary-hover sm:self-start sm:ml-16"
              >
                <Download aria-hidden="true" className="size-5" />
                Download {resource.title} ({resource.fileType})
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
