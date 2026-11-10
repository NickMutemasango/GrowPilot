"use client";

import { useState } from "react";
import { ExternalLink, FileText, Trash2, Upload } from "lucide-react";
import { checkFile, formatBytes, uploadRules } from "@/lib/instructor/files";
import type { DraftFile } from "@/types/instructor";
import { FilePickButton } from "./FilePickButton";
import { UploadError, UploadState, toDraftFile } from "./UploadNotice";

type MaterialUploadProps = {
  value: DraftFile[];
  onChange: (files: DraftFile[]) => void;
  lessonTitle: string;
  uploadsAvailable: boolean;
};

/** Downloadable materials for one lesson: add, view and remove. */
export function MaterialUpload({ value, onChange, lessonTitle, uploadsAvailable }: MaterialUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const pick = (file: File) => {
    const problem = checkFile(file, "material") ?? (value.length >= 10 ? "A lesson can have up to 10 materials." : null);
    setError(problem);
    if (!problem) onChange([...value, toDraftFile(file)]);
  };

  return (
    <div>
      <p className="text-base font-semibold text-ink">Downloadable materials</p>
      <p className="text-base text-ink-muted">Worksheets, notes or reference files: {uploadRules.material.describe}.</p>

      {value.length > 0 && (
        <ul className="mt-2 flex flex-col gap-2">
          {value.map((file, index) => (
            <li key={`${file.name}-${index}`} className="flex flex-col gap-2 rounded-xl border border-line bg-canvas p-3 sm:flex-row sm:items-center">
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-semibold break-all text-ink">
                  <FileText aria-hidden="true" className="size-5 shrink-0 text-primary" />
                  {file.name}
                  <span className="font-normal whitespace-nowrap text-ink-muted">({formatBytes(file.sizeBytes)})</span>
                </p>
                <UploadState file={file} uploadsAvailable={uploadsAvailable} />
              </div>
              <div className="flex gap-2">
                {file.url && (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-base font-semibold text-primary underline underline-offset-4 hover:bg-secondary"
                  >
                    <ExternalLink aria-hidden="true" className="size-4" />
                    View<span className="sr-only"> {file.name}</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Remove "${file.name}" from this lesson?`)) onChange(value.filter((_, i) => i !== index));
                  }}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-base font-semibold text-[#b42318] hover:bg-[#FDECEA]"
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                  Remove<span className="sr-only"> {file.name}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3">
        <FilePickButton kind="material" label="Upload Material" icon={Upload} onPick={pick} context={lessonTitle} />
      </div>
      <UploadError message={error} />
    </div>
  );
}
