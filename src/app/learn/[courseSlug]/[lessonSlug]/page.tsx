import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookOpenText, Clock, Eye, FileText, PlayCircle } from "lucide-react";
import { CourseCurriculumSidebar } from "@/components/learning/CourseCurriculumSidebar";
import { LearningLayout } from "@/components/learning/LearningLayout";
import { LessonHeader } from "@/components/learning/LessonHeader";
import { LessonNavigation } from "@/components/learning/LessonNavigation";
import { LessonNotes } from "@/components/learning/LessonNotes";
import { LessonResources } from "@/components/learning/LessonResources";
import { LessonVideoPlayer } from "@/components/learning/LessonVideoPlayer";
import { MarkLessonCompleteButton } from "@/components/learning/MarkLessonCompleteButton";
import { getAllLessonParams, getLessonPage } from "@/lib/learning";
import { formatMinutes } from "@/types/course";

type Props = { params: Promise<{ courseSlug: string; lessonSlug: string }> };

export async function generateStaticParams() {
  return getAllLessonParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseSlug, lessonSlug } = await params;
  const data = await getLessonPage(courseSlug, lessonSlug);
  if (!data) return { title: "Lesson not found" };
  return {
    title: `Lesson ${data.lesson.number}: ${data.lesson.title} | ${data.course.title}`,
    robots: { index: false },
  };
}

export default async function LessonPage({ params }: Props) {
  const { courseSlug, lessonSlug } = await params;
  const data = await getLessonPage(courseSlug, lessonSlug);
  if (!data) notFound();

  const { course, lesson, modules, totalLessons, previous, next } = data;
  const isVideo = lesson.type === "video";
  const lessonLabel = `Lesson ${lesson.number}: ${lesson.title}`;
  const lessonSlugs = modules.flatMap((courseModule) => courseModule.lessons.map((item) => item.slug));

  return (
    <LearningLayout
      header={
        <LessonHeader
          courseTitle={course.title}
          lessonLabel={lessonLabel}
          lessonShortLabel={`Lesson ${lesson.number} of ${totalLessons}`}
        />
      }
      lesson={
        <div className="flex flex-col gap-6">
          {isVideo && lesson.content?.video ? (
            <LessonVideoPlayer video={lesson.content.video} title={lesson.title} />
          ) : isVideo ? (
            <p className="flex aspect-video items-center justify-center rounded-2xl bg-secondary p-6 text-center text-xl font-semibold text-ink">
              The video for this lesson is not available yet. Please read the Lesson Notes below.
            </p>
          ) : (
            <div className="flex items-start gap-4 rounded-2xl border-2 border-primary/30 bg-secondary p-5 sm:p-6">
              <BookOpenText aria-hidden="true" className="size-9 shrink-0 text-primary" />
              <p className="text-lg text-ink">
                <strong className="block text-xl">This is a reading lesson.</strong>
                There is no video. Read the Lesson Notes below at your own pace.
              </p>
            </div>
          )}

          <div>
            <p className="text-base font-semibold text-primary">
              Module {lesson.moduleNumber}: {lesson.moduleTitle} · Lesson {lesson.number} of {totalLessons}
            </p>
            <h1 className="mt-1 text-3xl leading-tight font-bold tracking-tight text-ink sm:text-4xl">
              {lesson.title}
            </h1>
            <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-lg text-ink-muted">
              <span className="inline-flex items-center gap-2">
                {isVideo ? (
                  <PlayCircle aria-hidden="true" className="size-5 text-primary" />
                ) : (
                  <FileText aria-hidden="true" className="size-5 text-primary" />
                )}
                {isVideo ? "Video lesson" : "Reading lesson"}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock aria-hidden="true" className="size-5 text-primary" />
                About {formatMinutes(lesson.minutes)}
              </span>
            </p>
            {lesson.content && (
              <p className="mt-3 max-w-prose text-xl leading-relaxed text-ink">
                {lesson.content.description}
              </p>
            )}
          </div>

          {/* key: start fresh on every lesson. */}
          <MarkLessonCompleteButton
            key={lesson.slug}
            courseSlug={course.slug}
            courseTitle={course.title}
            lessonSlug={lesson.slug}
            lessonTitle={lesson.title}
            lessonSlugs={lessonSlugs}
            next={next}
          />
          <LessonNavigation previous={previous} next={next} />
        </div>
      }
      sidebar={
        <CourseCurriculumSidebar
          key={lesson.slug}
          courseSlug={course.slug}
          courseTitle={course.title}
          modules={modules}
          currentSlug={lesson.slug}
          currentNumber={lesson.number}
          totalLessons={totalLessons}
        />
      }
      extras={
        <div className="flex flex-col gap-12">
          <LessonResources resources={lesson.resources} />
          <LessonNotes notes={lesson.content?.notes ?? []} transcript={lesson.content?.transcript} />
          <p className="flex items-start gap-3 rounded-2xl border-2 border-accent bg-accent/15 p-4 text-base text-ink sm:text-lg">
            <Eye aria-hidden="true" className="mt-0.5 size-6 shrink-0 text-[#6b4e00]" />
            <span>
              <strong className="font-semibold">Preview.</strong> This free course is open to everyone
              as a demonstration. Sign-in and enrolment are not available yet, and your progress is kept in
              this web browser only.
            </span>
          </p>
        </div>
      }
    />
  );
}
