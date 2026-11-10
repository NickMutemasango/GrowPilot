import type { CourseDraft, InstructorProfile } from "@/types/instructor";

/*
 * Where instructors' courses, drafts and profiles are kept, and where their
 * files go. NO DATABASE OR FILE STORAGE IS CONFIGURED YET, so both return
 * null and the editor says nothing can be saved or uploaded.
 *
 * Courses need an owner (instructor ID) column, and only the server actions
 * in src/app/instructor/actions.ts may write them. Videos and materials go
 * to a storage service (with upload links created on the server); only
 * their URLs are stored with the course.
 */
export type CourseStore = {
  saveCourse(course: CourseDraft): Promise<void>;
  saveProfile(instructorId: string, profile: InstructorProfile): Promise<void>;
};

export function getCourseStore(): CourseStore | null {
  return null;
}

export type FileStorage = {
  /** A short-lived upload link for one file, created on the server. */
  createUploadUrl(input: { instructorId: string; courseId: string; fileName: string; mimeType: string; sizeBytes: number }): Promise<{ uploadUrl: string; fileUrl: string }>;
};

export function getFileStorage(): FileStorage | null {
  return null;
}
