"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createLesson, moveItem, removalWarning } from "@/lib/instructor/course-draft";
import type { DraftLesson, DraftModule } from "@/types/instructor";
import { IconButton, TextArea, TextField } from "./fields";
import { LessonEditor } from "./LessonEditor";

type ModuleEditorProps = {
  module: DraftModule;
  number: number;
  /** Lesson numbers run across the whole course. */
  firstLessonNumber: number;
  openLessonId: string | null;
  onOpenLesson: (id: string | null) => void;
  onChange: (module: DraftModule) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  isFirst: boolean;
  isLast: boolean;
  uploadsAvailable: boolean;
};

/** One module: its title, description and lessons. */
export function ModuleEditor(props: ModuleEditorProps) {
  const { module, number, firstLessonNumber, openLessonId, onOpenLesson, onChange, onMove, onRemove, isFirst, isLast, uploadsAvailable } = props;
  const setLessons = (lessons: DraftLesson[]) => onChange({ ...module, lessons });

  return (
    <li className="rounded-3xl border-2 border-line bg-canvas p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-bold text-ink">
          Module {number}
          {module.title.trim() && <span className="font-semibold text-ink-muted">: {module.title}</span>}
        </h3>
        <div className="flex gap-1.5">
          <IconButton label={`Move module ${number} up`} onClick={() => onMove(-1)} disabled={isFirst}>
            <ArrowUp aria-hidden="true" className="size-5" />
          </IconButton>
          <IconButton label={`Move module ${number} down`} onClick={() => onMove(1)} disabled={isLast}>
            <ArrowDown aria-hidden="true" className="size-5" />
          </IconButton>
          <IconButton label={`Remove module ${number}`} onClick={onRemove} danger>
            <Trash2 aria-hidden="true" className="size-5" />
          </IconButton>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        <TextField label="Module title" value={module.title} onChange={(title) => onChange({ ...module, title })} placeholder="e.g. Getting Started" maxLength={100} />
        <TextArea label="Module description" value={module.description} onChange={(description) => onChange({ ...module, description })} optional rows={2} maxLength={300} />
      </div>

      <h4 className="mt-6 text-lg font-bold text-ink">Lessons</h4>
      {module.lessons.length === 0 && <p className="mt-1 text-base text-ink-muted">No lessons in this module yet.</p>}
      <ol className="mt-3 flex flex-col gap-3">
        {module.lessons.map((lesson, index) => (
          <LessonEditor
            key={lesson.id}
            lesson={lesson}
            number={firstLessonNumber + index}
            open={openLessonId === lesson.id}
            onToggle={() => onOpenLesson(openLessonId === lesson.id ? null : lesson.id)}
            onChange={(updated) => setLessons(module.lessons.map((item) => (item.id === lesson.id ? updated : item)))}
            onMove={(direction) => setLessons(moveItem(module.lessons, index, direction))}
            onRemove={() => {
              if (window.confirm(removalWarning(lesson, "lesson"))) setLessons(module.lessons.filter((item) => item.id !== lesson.id));
            }}
            isFirst={index === 0}
            isLast={index === module.lessons.length - 1}
            uploadsAvailable={uploadsAvailable}
          />
        ))}
      </ol>
      <Button
        variant="secondary"
        className="mt-4 w-full sm:w-auto"
        onClick={() => {
          const lesson = createLesson();
          setLessons([...module.lessons, lesson]);
          onOpenLesson(lesson.id);
        }}
      >
        <Plus aria-hidden="true" className="size-5" />
        Add Lesson<span className="sr-only"> to module {number}</span>
      </Button>
    </li>
  );
}
