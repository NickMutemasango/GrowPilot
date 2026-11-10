import { CourseSection } from "./CourseSection";

/** "About This Course": a few short, plain-English paragraphs. */
export function CourseOverview({ paragraphs }: { paragraphs: string[] }) {
  return (
    <CourseSection id="about" title="About This Course">
      <div className="flex max-w-3xl flex-col gap-4 text-lg leading-relaxed text-ink sm:text-xl sm:leading-relaxed">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </CourseSection>
  );
}
