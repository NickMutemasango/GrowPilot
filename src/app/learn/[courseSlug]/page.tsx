import { notFound, redirect } from "next/navigation";
import { getFirstLesson } from "@/lib/learning";

type Props = { params: Promise<{ courseSlug: string }> };

/** /learn/[courseSlug] opens the course's first lesson. */
export default async function LearnCoursePage({ params }: Props) {
  const lesson = await getFirstLesson((await params).courseSlug);
  if (!lesson) notFound();
  redirect(lesson.href);
}
