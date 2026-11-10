import { ArrowLeft, SearchX } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";

export default function CourseNotFound() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 sm:py-28">
      <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
        <SearchX aria-hidden="true" className="size-10" />
      </span>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-ink">Course not found</h1>
      <p className="mt-4 text-xl leading-relaxed text-ink-muted">
        We couldn&apos;t find that course. The link may be wrong, or the course may
        have moved. You can find all of our courses in the catalogue.
      </p>
      <ButtonLink href="/courses" size="lg" className="mt-8">
        <ArrowLeft aria-hidden="true" className="size-5" />
        Back to all courses
      </ButtonLink>
    </section>
  );
}
