import Link from "next/link";
import { BookOpen, Calendar, Download, FileText, NotebookPen, type LucideIcon } from "lucide-react";
import type { Resource, ResourceKind } from "@/lib/library";
import { subjectStyle } from "@/lib/subjects";

export const kindStyle:Record<ResourceKind, { icon: LucideIcon; badge: string }> = {
  Book: { icon: BookOpen, badge: "bg-brand-50 text-brand-700" },
  "Study notes": { icon: NotebookPen, badge: "bg-success-50 text-success-600" },
  "Research paper": { icon: FileText, badge: "bg-accent-50 text-accent-700" },
};

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

export default function ResourceCard({ resource }: { resource: Resource }) {
  const s = subjectStyle[resource.subject];
  const SubjectIcon = s.icon;
  const kind = kindStyle[resource.kind];
  const KindIcon = kind.icon;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-soft transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card">
      <div className={`relative grid h-36 place-items-center bg-linear-to-br ${s.tile}`}>
        {/* A slim "cover" so library items read as documents rather than courses. */}
        <div className="grid h-24 w-18 place-items-center rounded-r-md rounded-l-sm border-l-4 border-black/10 bg-white/90 shadow-md transition-transform duration-200 group-hover:-rotate-3">
          <SubjectIcon className={`size-8 ${s.iconColor}`} aria-hidden="true" />
        </div>
        <span
          className={`absolute top-3 left-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ${kind.badge}`}
        >
          <KindIcon className="size-3.5" aria-hidden="true" />
          {resource.kind}
        </span>
        <span className="absolute top-3 right-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-sm">
          {resource.format}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
          {resource.subject}
        </p>
        <h3 className="mt-1.5 font-display text-lg font-bold tracking-tight text-slate-900 group-hover:text-brand-700">
          {/* The ::after overlay stretches this link over the whole card. */}
          <Link
            href={`/library/${resource.slug}`}
            className="rounded-md after:absolute after:inset-0 after:rounded-2xl"
          >
            {resource.title}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-slate-500">{resource.author}</p>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-pretty text-slate-600">
          {resource.description}
        </p>

        <dl className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 pt-4 text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <dt className="sr-only">Length</dt>
            <FileText className="size-4 text-slate-400" aria-hidden="true" />
            <dd>{resource.pages} pages</dd>
          </div>
          <div className="flex items-center gap-1">
            <dt className="sr-only">Published</dt>
            <Calendar className="size-4 text-slate-400" aria-hidden="true" />
            <dd>{resource.year}</dd>
          </div>
          <div className="flex items-center gap-1">
            <dt className="sr-only">Downloads</dt>
            <Download className="size-4 text-slate-400" aria-hidden="true" />
            <dd>{compact.format(resource.downloads)}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
