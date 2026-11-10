"use client";

import { useState } from "react";
import { ImagePlus, RefreshCw, Trash2 } from "lucide-react";
import { checkFile, uploadRules } from "@/lib/instructor/files";
import type { DraftFile } from "@/types/instructor";
import { FilePickButton } from "./FilePickButton";
import { UploadError, UploadState, toDraftFile } from "./UploadNotice";

type ThumbnailUploadProps = {
  value: DraftFile | null;
  onChange: (file: DraftFile | null) => void;
  uploadsAvailable: boolean;
  label?: string;
  hint?: string;
  /** "round" for profile pictures. */
  shape?: "wide" | "round";
};

/** A picture: the course picture on course cards, or an instructor's profile picture. */
export function ThumbnailUpload({
  value,
  onChange,
  uploadsAvailable,
  label = "Course picture",
  hint = "A clear, friendly photo works best.",
  shape = "wide",
}: ThumbnailUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const pick = (file: File) => {
    const problem = checkFile(file, "image");
    setError(problem);
    if (!problem) onChange(toDraftFile(file));
  };

  return (
    <div>
      <p className="text-lg font-semibold text-ink">{label}</p>
      <p className="text-base text-ink-muted">
        {hint} {uploadRules.image.describe}.
      </p>
      <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start">
        <div
          className={`flex shrink-0 items-center justify-center overflow-hidden border border-line bg-secondary ${
            shape === "round" ? "size-32 rounded-full" : "aspect-[16/9] w-full rounded-xl sm:w-56"
          }`}
        >
          {value?.url ? (
            // A local or stored picture; next/image can't show local previews.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.url} alt={`${label} preview`} className="size-full object-cover" />
          ) : (
            <ImagePlus aria-hidden="true" className="size-8 text-primary" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          {value && <p className="font-semibold break-all text-ink">{value.name}</p>}
          {value && <UploadState file={value} uploadsAvailable={uploadsAvailable} />}
          <div className="flex flex-wrap gap-2">
            <FilePickButton
              kind="image"
              label={value ? "Change Picture" : "Select Picture"}
              icon={value ? RefreshCw : ImagePlus}
              onPick={pick}
              variant={value ? "secondary" : "primary"}
            />
            {value && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Remove the ${label.toLowerCase()}?`)) onChange(null);
                }}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-base font-semibold text-[#b42318] hover:bg-[#FDECEA]"
              >
                <Trash2 aria-hidden="true" className="size-4" />
                Remove
              </button>
            )}
          </div>
        </div>
      </div>
      <UploadError message={error} />
    </div>
  );
}
