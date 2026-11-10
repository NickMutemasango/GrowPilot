import type { Certificate, Enrolment, Student } from "@/types/student";

/*
 * Where a student's own record is read: who they are, what they are
 * enrolled in, and what they have earned.
 *
 * NO DATABASE IS CONFIGURED YET, so `getStudentStore` returns null and the
 * dashboard has nothing to show. Pages that need it send visitors to log
 * in first, so nothing here is ever reached without a session.
 *
 * When students live in a database, implement this against it:
 *
 *  - The student ID always comes from the session on the server. Never
 *    accept it from the browser, or one student could read another's
 *    record.
 *  - `listEnrolments` returns only enrolments that are still active: a
 *    revoked one keeps its progress in the database for the audit trail
 *    but must not appear on the student's dashboard.
 *  - `findCertificate` is used by the certificate page, which anyone with
 *    the address may open. Return only what belongs on a certificate —
 *    the name, the course, the date and the ID — and nothing else about
 *    the student.
 */
export type StudentStore = {
  findStudent(studentId: string): Promise<Student | null>;
  listEnrolments(studentId: string): Promise<Enrolment[]>;
  findCertificate(certificateId: string): Promise<Certificate | null>;
};

export function getStudentStore(): StudentStore | null {
  return null;
}
