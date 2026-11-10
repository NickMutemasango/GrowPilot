"use client";

import { useId } from "react";
import { ArrowDown, ArrowUp, ChevronDown, FileText, PlayCircle, Trash2 } from "lucide-react";
import { formatMinutes } from "@/types/course";
import type { DraftLesson } from "@/types/instructor";
import { IconButton, TextArea, TextField } from "./fields";
import { MaterialUpload } from "./uploads/MaterialUpload";
import { VideoUpload } from "./uploads/VideoUpload";

type LessonEditorProps = {
  lesson: DraftLesson;
  number: number;
  open: boolean;
  onToggle: () => void;
  onChange: (lesson: DraftLesson) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  isFirst: boolean;
  isLast: boolean;
  uploadsAvailable: boolean;
};

/** One lesson: a summary row that opens into its details. */
export function LessonEditor({ lesson, number, open, onToggle, onChange, onMove, onRemove, isFirst, isLast, uploadsAvailable }: LessonEditorProps) {
  const panelId = useId();
  const name = lesson.title.trim() || "Untitled lesson";
  const set = <K extends keyof DraftLesson>(key: K, value: DraftLesson[K]) => onChange({ ...lesson, [key]: value });
  const TypeIcon = lesson.type === "video" ? PlayCircle : FileText;

  return (
    <li className="rounded-2xl border border-line bg-surface">
      <div className="flex flex-wrap items-center gap-2 p-3">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-xl px-2 text-left hover:bg-secondary/60"
        >
          <TypeIcon aria-hidden="true" className="size-5 shrink-0 text-primary" />
          <span className="min-w-0 flex-1">
            <span className="block font-semibold break-words text-ink">
              Lesson {number}: {name}
            </span>
            <span className="block text-base text-ink-muted">
              {lesson.type === "video" ? "Video" : "Reading"}, {formatMinutes(Math.max(0, lesson.minutes || 0))}
              {lesson.live && " · live"}
            </span>
          </span>
          <span className="text-base font-semibold text-primary">{open ? "Done" : "Edit"}</span>
          <ChevronDown aria-hidden="true" className={`size-5 shrink-0 text-primary transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
        <div className="flex gap-1.5">
          <IconButton label={`Move lesson ${number} up`} onClick={() => onMove(-1)} disabled={isFirst}>
            <ArrowUp aria-hidden="true" className="size-5" />
          </IconButton>
          <IconButton label={`Move lesson ${number} down`} onClick={() => onMove(1)} disabled={isLast}>
            <ArrowDown aria-hidden="true" className="size-5" />
          </IconButton>
          <IconButton label={`Remove lesson ${number}: ${name}`} onClick={onRemove} danger>
            <Trash2 aria-hidden="true" className="size-5" />
          </IconButton>
        </div>
      </div>

      <div id={panelId} hidden={!open} className="flex flex-col gap-5 border-t border-line p-4 sm:p-5">
        <TextField label="Lesson title" value={lesson.title} onChange={(value) => set("title", value)} maxLength={120} placeholder="e.g. Using a Mouse" />
        <TextArea label="Lesson description" value={lesson.description} onChange={(value) => set("description", value)} optional rows={2} maxLength={400} hint="One or two sentences shown under the lesson title." />

        <fieldset className="min-w-0">
          <legend className="text-lg font-semibold text-ink">Lesson type</legend>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            {(["video", "reading"] as const).map((type) => (
              <label
                key={type}
                className={`flex min-h-12 flex-1 cursor-pointer items-center gap-3 rounded-xl border-2 px-4 text-base font-semibold has-focus-visible:outline-3 has-focus-visible:outline-primary-strong ${
                  lesson.type === type ? "border-primary bg-secondary text-primary-strong" : "border-line text-ink"
                }`}
              >
                <input type="radio" name={`${panelId}-type`} checked={lesson.type === type} onChange={() => set("type", type)} className="size-5 accent-primary" />
                {type === "video" ? "Video Lesson" : "Reading Lesson"}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="max-w-56">
          <TextField
            label="Estimated length (minutes)"
            type="number"
            inputMode="numeric"
            value={Number.isFinite(lesson.minutes) ? String(lesson.minutes) : ""}
            onChange={(value) => set("minutes", value === "" ? Number.NaN : Math.round(Number(value)))}
          />
        </div>

        {lesson.type === "video" && (
          <VideoUpload value={lesson.video} onChange={(file) => set("video", file)} lessonTitle={name} uploadsAvailable={uploadsAvailable} />
        )}
        <TextArea
          label="Written notes"
          value={lesson.notes}
          onChange={(value) => set("notes", value)}
          optional={lesson.type === "video"}
          rows={6}
          hint="Short paragraphs and simple examples. Students can read these alongside or instead of the video."
        />
        <MaterialUpload value={lesson.materials} onChange={(files) => set("materials", files)} lessonTitle={name} uploadsAvailable={uploadsAvailable} />
      </div>
    </li>
  );
}
