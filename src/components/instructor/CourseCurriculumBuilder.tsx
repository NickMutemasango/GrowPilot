"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createModule, moveItem, removalWarning } from "@/lib/instructor/course-draft";
import type { DraftModule } from "@/types/instructor";
import { ModuleEditor } from "./ModuleEditor";

type CourseCurriculumBuilderProps = {
  modules: DraftModule[];
  onChange: (modules: DraftModule[]) => void;
  uploadsAvailable: boolean;
};

/** Stage 2: modules and lessons, in order. Only one lesson is open at a time, to keep it calm. */
export function CourseCurriculumBuilder({ modules, onChange, uploadsAvailable }: CourseCurriculumBuilderProps) {
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);
  let lessonNumber = 1;

  return (
    <div>
      <p className="text-lg text-ink-muted">
        Group your lessons into modules. Use the arrow buttons to change the order, and select a lesson to add its video,
        notes and materials.
      </p>
      <ol className="mt-5 flex flex-col gap-5">
        {modules.map((courseModule, index) => {
          const first = lessonNumber;
          lessonNumber += courseModule.lessons.length;
          return (
            <ModuleEditor
              key={courseModule.id}
              module={courseModule}
              number={index + 1}
              firstLessonNumber={first}
              openLessonId={openLessonId}
              onOpenLesson={setOpenLessonId}
              onChange={(updated) => onChange(modules.map((item) => (item.id === courseModule.id ? updated : item)))}
              onMove={(direction) => onChange(moveItem(modules, index, direction))}
              onRemove={() => {
                if (window.confirm(removalWarning(courseModule, "module"))) onChange(modules.filter((item) => item.id !== courseModule.id));
              }}
              isFirst={index === 0}
              isLast={index === modules.length - 1}
              uploadsAvailable={uploadsAvailable}
            />
          );
        })}
      </ol>
      <Button size="lg" className="mt-5 w-full sm:w-auto" onClick={() => onChange([...modules, createModule()])}>
        <Plus aria-hidden="true" className="size-5" />
        Add Module
      </Button>
    </div>
  );
}
