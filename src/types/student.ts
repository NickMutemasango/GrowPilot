import type { Course } from "./course";

export type Student = {
  /** First name for the greeting; `null` shows a neutral greeting. */
  firstName: string | null;
  /** Full name as it should appear on certificates. */
  fullName: string | null;
};

/** A certificate issuance record, as a database would store it. */
export type CertificateRecord = {
  /** Unique, e.g. "GPA-SAMPLE-7K2M9Q4T". */
  id: string;
  /** ISO date the course was completed. */
  issuedAt: string;
};

/** A raw enrolment record, as a database would store it. */
export type Enrolment = {
  courseSlug: string;
  completedLessons: number;
  /** ISO date of the last visit, or `null` if never opened. */
  lastAccessedAt: string | null;
  /** Only kept when every required lesson is complete. */
  certificate?: CertificateRecord;
};

export type CourseStatus = "not-started" | "in-progress" | "completed";

/** Lessons use the same three states as courses. */
export type LessonStatus = CourseStatus;

/** An enrolment joined with its course, ready to display. */
export type StudentCourse = {
  course: Course;
  status: CourseStatus;
  /** Whole number from 0 to 100. */
  progress: number;
  completedLessons: number;
  totalLessons: number;
  /** The next lesson to study, if the course is not finished. */
  nextLesson: { number: number; title: string; moduleTitle: string } | null;
  /** Opens the next lesson in the lesson player, or `null` if it can't be opened there yet. */
  nextLessonHref: string | null;
  /** The first lesson in the lesson player, for "Review Lessons"; `null` if it can't be opened there yet. */
  firstLessonHref: string | null;
  /** Only set for completed courses. */
  certificate: CertificateRecord | null;
  lastAccessedAt: string | null;
};

export type StudentDashboard = {
  student: Student;
  courses: StudentCourse[];
};

/** A certificate ready to show: always a SAMPLE until real accounts and progress exist. */
export type Certificate = CertificateRecord & {
  studentName: string;
  courseTitle: string;
  courseSlug: string;
  /** True for every certificate in this preview; shows the SAMPLE watermark. */
  isSample: boolean;
};
