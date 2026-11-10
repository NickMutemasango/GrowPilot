/*
 * What instructors can upload. Change the limits here. Files go to a
 * storage service, never into the app's code or into database records.
 */

export type FileKind = "video" | "material" | "image";

export const uploadRules: Record<FileKind, { types: Record<string, string>; maxBytes: number; describe: string }> = {
  video: {
    types: { "video/mp4": "MP4", "video/webm": "WebM", "video/quicktime": "MOV" },
    maxBytes: 2 * 1024 ** 3,
    describe: "MP4, WebM or MOV, up to 2 GB",
  },
  material: {
    types: {
      "application/pdf": "PDF",
      "application/msword": "Word",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
      "application/vnd.ms-excel": "Excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
      "application/vnd.ms-powerpoint": "PowerPoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PowerPoint",
      "text/plain": "Text",
    },
    maxBytes: 25 * 1024 ** 2,
    describe: "PDF, Word, Excel, PowerPoint or text, up to 25 MB",
  },
  image: {
    types: { "image/jpeg": "JPEG", "image/png": "PNG", "image/webp": "WebP" },
    maxBytes: 5 * 1024 ** 2,
    describe: "JPEG, PNG or WebP, up to 5 MB",
  },
};

/** Returns a plain-English problem with the file, or null if it's fine. */
export function checkFile(file: { name: string; type: string; size: number }, kind: FileKind): string | null {
  const rules = uploadRules[kind];
  if (!rules.types[file.type]) return `"${file.name}" isn't a file type we accept here. Please choose ${rules.describe}.`;
  if (file.size === 0) return `"${file.name}" is empty. Please choose another file.`;
  if (file.size > rules.maxBytes) return `"${file.name}" is too large (${formatBytes(file.size)}). The limit is ${formatBytes(rules.maxBytes)}.`;
  return null;
}

/** 1536 → "1.5 KB" */
export function formatBytes(bytes: number): string {
  const units = ["bytes", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${unit === 0 ? value : value.toFixed(value < 10 ? 1 : 0)} ${units[unit]}`;
}

/** The accept="" attribute for a file input. */
export function acceptFor(kind: FileKind): string {
  return Object.keys(uploadRules[kind].types).join(",");
}
