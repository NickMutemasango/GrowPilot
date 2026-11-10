import type { Course, LessonType } from "./course";

/*
 * Types for the lesson player (/learn/[courseSlug]/[lessonSlug]).
 * Lesson titles, types and lengths come from the course curriculum
 * (`CourseDetails.modules`); everything else lives in `LessonContent`.
 */

export type VideoSource = {
  src: string;
  /** MIME type, e.g. "video/mp4". */
  type: string;
};

export type CaptionTrack = {
  /** A WebVTT file. */
  src: string;
  /** Shown in the player's captions menu, e.g. "English". */
  label: string;
  srcLang: string;
  default?: boolean;
};

export type LessonVideo = {
  sources: VideoSource[];
  captions?: CaptionTrack[];
  /**
   * When set, this is a stand-in clip, not the real lesson video, and the
   * page says so using this credit line.
   */
  sampleCredit?: string;
};

export type LessonResource = {
  /** Button text after "Download", e.g. "Keyboard Basics Notes". */
  title: string;
  description?: string;
  /** Path to a file in /public, e.g. "/resources/course/notes.pdf". */
  href: string;
  /** Shown in brackets, e.g. "PDF". */
  fileType: string;
};

/** A downloadable file that was confirmed to exist. */
export type AvailableResource = LessonResource & { sizeLabel: string };

export type NoteSection = {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  /** A short, everyday example shown in a highlighted box. */
  example?: string;
};

/** The written and media content of one lesson. */
export type LessonContent = {
  /** One or two short sentences shown under the lesson title. */
  description: string;
  /** Omitted for reading lessons. */
  video?: LessonVideo;
  notes: NoteSection[];
  resources?: LessonResource[];
  /** Only for videos with a genuine transcript. Never write one for a video that has none. */
  transcript?: string[];
};

/** A lesson's place in the course, used for the sidebar and Next / Previous. */
export type LessonSummary = {
  slug: string;
  /** Numbered across the whole course, starting at 1. */
  number: number;
  title: string;
  type: LessonType;
  minutes: number;
  href: string;
};

export type CourseLesson = LessonSummary & { moduleTitle: string };

export type LearningModule = {
  title: string;
  lessons: LessonSummary[];
};

export type LessonPageData = {
  course: Course;
  modules: LearningModule[];
  totalLessons: number;
  lesson: LessonSummary & {
    moduleNumber: number;
    moduleTitle: string;
    content: LessonContent | null;
    resources: AvailableResource[];
  };
  previous: LessonSummary | null;
  next: LessonSummary | null;
};
