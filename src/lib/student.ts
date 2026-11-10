import { getCourseBySlug, getCourseDetails } from "@/lib/courses";
import { getLessonHrefByNumber } from "@/lib/learning";
import { calculateProgress, getCourseStatus } from "@/lib/progress/calculate";
import { getStudentStore } from "@/lib/student-store";
import { countLessons } from "@/types/course";
import type { Certificate, Enrolment, StudentCourse, StudentDashboard } from "@/types/student";

/*
 * The signed-in student's dashboard. Server-only.
 *
 * Every page that calls this has already checked the session, and the
 * student ID comes from that session — never from the address bar. With no
 * student store configured the dashboard is empty and the page shows its
 * "no courses yet" state.
 */

export async function getDashboard(studentId: string): Promise<StudentDashboard> {
  const store = getStudentStore();
  if (!store) return { student: { firstName: null, fullName: null }, courses: [] };

  const [student, enrolments] = await Promise.all([
    store.findStudent(studentId),
    store.listEnrolments(studentId),
  ]);
  const courses = await Promise.all(enrolments.map(toStudentCourse));

  return {
    student: student ?? { firstName: null, fullName: null },
    courses: sortByRecent(courses.filter((course): course is StudentCourse => course !== null)),
  };
}

async function toStudentCourse(enrolment: Enrolment): Promise<StudentCourse | null> {
  const [course, details] = await Promise.all([
    getCourseBySlug(enrolment.courseSlug),
    getCourseDetails(enrolment.courseSlug),
  ]);
  if (!course || !details) return null;

  const totalLessons = countLessons(details.modules);
  const completedLessons = Math.min(Math.max(0, enrolment.completedLessons), totalLessons);
  const status = getCourseStatus(completedLessons, totalLessons);

  // The next lesson is the first one not yet completed.
  let nextLesson: StudentCourse["nextLesson"] = null;
  let number = 0;
  for (const courseModule of details.modules) {
    for (const lesson of courseModule.lessons) {
      number += 1;
      if (!nextLesson && number === completedLessons + 1) {
        nextLesson = { number, title: lesson.title, moduleTitle: courseModule.title };
      }
    }
  }

  return {
    course,
    status,
    progress: calculateProgress(completedLessons, totalLessons),
    completedLessons,
    totalLessons,
    nextLesson,
    nextLessonHref: nextLesson ? await getLessonHrefByNumber(course.slug, nextLesson.number) : null,
    firstLessonHref: await getLessonHrefByNumber(course.slug, 1),
    // Certificates only exist for courses whose every lesson is complete.
    certificate: status === "completed" ? (enrolment.certificate ?? null) : null,
    lastAccessedAt: enrolment.lastAccessedAt,
  };
}

/** Certificates earned in a dashboard, ready to display. */
export function getCertificates(dashboard: StudentDashboard): Certificate[] {
  const studentName = dashboard.student.fullName;
  if (!studentName) return [];
  return dashboard.courses.flatMap((item) =>
    item.certificate
      ? [
          {
            ...item.certificate,
            studentName,
            courseTitle: item.course.title,
            courseSlug: item.course.slug,
            isSample: false,
          },
        ]
      : [],
  );
}

/** Most recently opened first; courses never opened go last. */
function sortByRecent(courses: StudentCourse[]): StudentCourse[] {
  return [...courses].sort((a, b) => {
    if (a.lastAccessedAt === b.lastAccessedAt) return 0;
    if (!a.lastAccessedAt) return 1;
    if (!b.lastAccessedAt) return -1;
    return b.lastAccessedAt.localeCompare(a.lastAccessedAt);
  });
}
