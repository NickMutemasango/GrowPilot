"use client";

import { useId, useRef } from "react";
import type { LucideIcon } from "lucide-react";
import { acceptFor, type FileKind } from "@/lib/instructor/files";

type FilePickButtonProps = {
  kind: FileKind;
  label: string;
  icon: LucideIcon;
  onPick: (file: File) => void;
  variant?: "primary" | "secondary";
  /** Read by screen readers after the label, e.g. the lesson name. */
  context?: string;
};

/** A real file input, styled as a button, that works with the keyboard. */
export function FilePickButton({ kind, label, icon: Icon, onPick, variant = "secondary", context }: FilePickButtonProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <span className="inline-flex">
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={acceptFor(kind)}
        className="peer sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onPick(file);
          // Allow picking the same file again later.
          if (inputRef.current) inputRef.current.value = "";
        }}
      />
      <label
        htmlFor={id}
        className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-base font-semibold whitespace-nowrap transition-colors peer-focus-visible:outline-3 peer-focus-visible:outline-offset-3 peer-focus-visible:outline-primary-strong ${
          variant === "primary"
            ? "bg-primary text-white shadow-button hover:bg-primary-hover"
            : "border-2 border-primary bg-surface text-primary hover:bg-secondary"
        }`}
      >
        <Icon aria-hidden="true" className="size-5" />
        {label}
        {context && <span className="sr-only"> for {context}</span>}
      </label>
    </span>
  );
}
