import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CourseCurriculum } from "@/components/course-details/CourseCurriculum";
import { CourseEnrollmentCard } from "@/components/course-details/CourseEnrollmentCard";
import { CourseHeader } from "@/components/course-details/CourseHeader";
import { CourseLearningOutcomes } from "@/components/course-details/CourseLearningOutcomes";
import { CourseOverview } from "@/components/course-details/CourseOverview";
import { CourseAudience, CourseRequirements } from "@/components/course-details/CourseRequirements";
import { InstructorCard } from "@/components/course-details/InstructorCard";
import { ButtonLink } from "@/components/ui/Button";
import { getAllCourses, getCourseBySlug, getCourseDetails } from "@/lib/courses";
import { getCourseAccess } from "@/lib/payments/service";
import { countLessons } from "@/types/course";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const courses = await getAllCourses();
  return courses.map((course) => ({ slug: course.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = await getCourseBySlug((await params).slug);
  if (!course) return { title: "Course not found" };
  return { title: course.title, description: course.description };
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const [course, details] = await Promise.all([getCourseBySlug(slug), getCourseDetails(slug)]);
  if (!course || !details) notFound();
  const access = await getCourseAccess(course);

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-20 sm:px-6 sm:pt-10 lg:px-8">
      {/*
        Phones and tablets: header, then the enrolment card, then the details.
        Desktop: details on the left, enrolment card on the right.
      */}
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-x-14 lg:gap-y-14">
        <div className="lg:col-start-1 lg:row-start-1">
          <CourseHeader course={course} />
        </div>

        <div className="mx-auto w-full max-w-xl lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:max-w-none lg:pt-16">
          {/* Stays in view while scrolling, but only when the screen is tall enough to show all of it. */}
          <div className="lg:[@media(min-height:60rem)]:sticky lg:[@media(min-height:60rem)]:top-[calc(var(--header-height)+1.5rem)]">
            <CourseEnrollmentCard course={course} lessonCount={countLessons(details.modules)} access={access} />
          </div>
        </div>

        <div className="flex flex-col gap-14 lg:col-start-1 lg:row-start-2">
          <CourseOverview paragraphs={details.overview} />
          <CourseLearningOutcomes outcomes={details.outcomes} />
          <CourseCurriculum modules={details.modules} />
          <CourseRequirements requirements={details.requirements} />
          <CourseAudience audience={details.audience} />
          <InstructorCard instructor={course.instructor} />

          <div className="border-t border-line pt-8">
            <ButtonLink href="/courses" variant="secondary" size="lg">
              <ArrowLeft aria-hidden="true" className="size-5" />
              Back to all courses
            </ButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
}
