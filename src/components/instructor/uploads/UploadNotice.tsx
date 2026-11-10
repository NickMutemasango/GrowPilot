import { CircleAlert, Info } from "lucide-react";
import type { DraftFile } from "@/types/instructor";

/** Says honestly whether a file has been uploaded. */
export function UploadState({ file, uploadsAvailable }: { file: DraftFile; uploadsAvailable: boolean }) {
  if (file.uploaded) return <span className="text-base font-semibold text-primary-strong">Uploaded</span>;
  return (
    <span className="flex items-start gap-1.5 text-base text-[#6b4e00]">
      <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      {uploadsAvailable
        ? "Not uploaded yet."
        : file.url
          ? "Not uploaded. Uploading isn't switched on yet, so this is only shown on this device."
          : "Not uploaded. Please select it again once uploading is switched on."}
    </span>
  );
}

export function UploadError({ message }: { message: string | null }) {
  return (
    <p role="alert" className="empty:hidden">
      {message && (
        <span className="mt-2 flex items-start gap-2 text-base font-medium text-[#b42318]">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          {message}
        </span>
      )}
    </p>
  );
}

/** A file the instructor has chosen, before any upload. The local link only works on this page. */
export function toDraftFile(file: File): DraftFile {
  return { name: file.name, sizeBytes: file.size, mimeType: file.type, uploaded: false, url: URL.createObjectURL(file) };
}
