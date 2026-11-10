import { MyCertificates } from "@/components/certificates/MyCertificates";
import { MyPurchases } from "@/components/checkout/MyPurchases";
import { getCourseToContinue } from "@/lib/progress/calculate";
import type { Purchase } from "@/types/payments";
import type { Certificate, Student, StudentCourse } from "@/types/student";
import { ContinueLearningCard } from "./ContinueLearningCard";
import { DashboardWelcome } from "./DashboardWelcome";
import { EmptyDashboardState, ExploreMoreCourses } from "./EmptyDashboardState";
import { LearningProgressOverview } from "./LearningProgressCard";
import { MyCoursesGrid } from "./MyCoursesGrid";

type DashboardContentProps = {
  student: Student;
  /** The student's courses, with progress already applied on the server. */
  courses: StudentCourse[];
  certificates: Certificate[];
  purchases: Purchase[];
};

/**
 * The student's dashboard. Everything shown here is read on the server for
 * the signed-in student, so nothing has to be worked out, or trusted, in
 * the browser.
 */
export function DashboardContent({ student, courses, certificates, purchases }: DashboardContentProps) {
  const hasCourses = courses.length > 0;

  return (
    <>
      <DashboardWelcome student={student} hasCourses={hasCourses} />

      {hasCourses ? (
        <>
          <ContinueLearningCard item={getCourseToContinue(courses)} />
          <MyCoursesGrid courses={courses} />
          <LearningProgressOverview courses={courses} />
          <MyCertificates certificates={certificates} />
          <MyPurchases purchases={purchases} />
          <ExploreMoreCourses />
        </>
      ) : (
        <>
          <EmptyDashboardState />
          <MyCertificates certificates={certificates} />
          <MyPurchases purchases={purchases} />
        </>
      )}
    </>
  );
}
