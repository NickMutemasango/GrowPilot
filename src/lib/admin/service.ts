import { redirect } from "next/navigation";
import { checkRole } from "@/lib/auth/roles";
import { getCurrentStudent, loginHref } from "@/lib/auth/session";
import { getAllCourses } from "@/lib/courses";

/*
 * The admin area's access check and data. Server-only.
 *
 * NO SIGN-IN, ROLES OR DATABASE ARE CONFIGURED YET, so the admin area
 * always sends visitors to log in and nobody can get in. That is the right
 * behaviour until roles exist: an admin area that opens without a check is
 * an admin area anyone can use.
 *
 * To make it real: store roles on accounts on the server, give the "admin"
 * role only through an authorised process (for example a command run by
 * the platform owner, never a sign-up form), and read the counts below
 * from the database.
 */

export type AdminContext = { admin: { name: string; firstName: string } };

/** Lets only administrators in. Everyone else goes to log in, or back to their dashboard. */
export async function requireAdmin(next: string): Promise<AdminContext> {
  const user = await getCurrentStudent();
  const decision = checkRole(user, "admin");
  if (decision === "sign-in" || !user) redirect(loginHref(next));
  if (decision === "not-allowed") redirect("/dashboard");
  return { admin: { name: user.fullName, firstName: user.fullName.split(" ")[0] } };
}

/** Where a number came from, so the page can label it honestly. */
export type StatSource = "live" | "catalogue" | "unavailable";

export type AdminStat = {
  id: "students" | "instructors" | "published" | "pending" | "purchases" | "enrolments";
  value: number | null;
  source: StatSource;
};

/** One line of the recent activity list, as the database would record it. */
export type ActivityItem = {
  id: string;
  kind: "enrolment" | "course" | "payment" | "account";
  text: string;
  /** ISO timestamp. */
  at: string;
};

export type PendingCourse = { id: string; title: string; instructorName: string; submittedAt: string };

export type AdminOverviewData = {
  stats: AdminStat[];
  activity: ActivityItem[];
  pending: PendingCourse[];
};

/**
 * Overview figures. Course and instructor counts come from the course
 * catalogue. Everything else needs the database, so it reads as "not
 * available" rather than being invented.
 *
 * To fill this in, count students, pending approvals, confirmed purchases
 * and active enrolments with the user, course, payment and enrolment
 * stores, and build `activity` and `pending` from the same queries.
 */
export async function getAdminOverview(): Promise<AdminOverviewData> {
  const courses = await getAllCourses();
  const instructors = new Set(courses.map((course) => course.instructor.id)).size;
  const needsDatabase = (id: AdminStat["id"]): AdminStat => ({ id, value: null, source: "unavailable" });

  return {
    stats: [
      needsDatabase("students"),
      { id: "instructors", value: instructors, source: "catalogue" },
      { id: "published", value: courses.length, source: "catalogue" },
      needsDatabase("pending"),
      needsDatabase("purchases"),
      needsDatabase("enrolments"),
    ],
    activity: [],
    pending: [],
  };
}
