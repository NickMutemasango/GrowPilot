"use client";

import { useState } from "react";
import { Film, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { checkFile, formatBytes, uploadRules } from "@/lib/instructor/files";
import type { DraftFile } from "@/types/instructor";
import { FilePickButton } from "./FilePickButton";
import { UploadError, UploadState, toDraftFile } from "./UploadNotice";

type VideoUploadProps = {
  value: DraftFile | null;
  onChange: (file: DraftFile | null) => void;
  lessonTitle: string;
  uploadsAvailable: boolean;
};

/**
 * The lesson video: pick, check, preview, replace or remove. With no
 * storage service there is no upload (and no progress bar to fake); the
 * chosen video plays from this device only so the instructor can check it.
 */
export function VideoUpload({ value, onChange, lessonTitle, uploadsAvailable }: VideoUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const pick = (file: File) => {
    const problem = checkFile(file, "video");
    setError(problem);
    if (problem) return;
    if (value && !window.confirm(`Replace "${value.name}" with "${file.name}"?`)) return;
    onChange(toDraftFile(file));
  };

  return (
    <div>
      <p className="text-base font-semibold text-ink">Lesson video</p>
      <p className="text-base text-ink-muted">{uploadRules.video.describe}.</p>

      {value ? (
        <div className="mt-2 rounded-2xl border border-line bg-canvas p-4">
          {value.url && (
            <video controls preload="metadata" src={value.url} className="mb-3 aspect-video w-full rounded-xl bg-ink">
              Your browser can&apos;t play this video.
            </video>
          )}
          <p className="flex items-center gap-2 font-semibold break-all text-ink">
            <Film aria-hidden="true" className="size-5 shrink-0 text-primary" />
            {value.name}
            <span className="font-normal whitespace-nowrap text-ink-muted">({formatBytes(value.sizeBytes)})</span>
          </p>
          <UploadState file={value} uploadsAvailable={uploadsAvailable} />
          <div className="mt-3 flex flex-wrap gap-2">
            <FilePickButton kind="video" label="Replace Video" icon={RefreshCw} onPick={pick} context={lessonTitle} />
            <Button
              variant="secondary"
              onClick={() => {
                if (window.confirm(`Remove the video "${value.name}" from this lesson?`)) onChange(null);
              }}
            >
              <Trash2 aria-hidden="true" className="size-5" />
              Remove Video
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-2 flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-line bg-canvas px-4 py-8 text-center">
          <Film aria-hidden="true" className="size-8 text-primary" />
          <p className="text-base text-ink-muted">No video chosen for this lesson yet.</p>
          <FilePickButton kind="video" label="Select Video" icon={Film} onPick={pick} variant="primary" context={lessonTitle} />
        </div>
      )}
      <UploadError message={error} />
    </div>
  );
}
