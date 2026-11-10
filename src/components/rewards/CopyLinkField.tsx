"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

type CopyLinkFieldProps = {
  link: string;
  /** Visible label above the link. */
  label: string;
  copyLabel: string;
  /** Used by the device's share sheet. */
  shareText: string;
};

/** A link in a box, a big Copy button, and a Share button on devices that can share. */
export function CopyLinkField({ link, label, copyLabel, shareText }: CopyLinkFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [canShare, setCanShare] = useState(false);

  useEffect(() => setCanShare(typeof navigator.share === "function"), []);
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 6000);
    return () => clearTimeout(timer);
  }, [message]);

  const copy = async () => {
    let copied = false;
    try {
      await navigator.clipboard.writeText(link);
      copied = true;
    } catch {
      // Some browsers block the modern clipboard; the older copy command often still works.
      inputRef.current?.select();
      copied = document.execCommand?.("copy") ?? false;
    }
    if (copied) {
      setMessage("Link copied! You can now paste it into a message or email.");
    } else {
      // Leave the text selected so the student can copy it themselves.
      inputRef.current?.select();
      setMessage("Your link is selected. Press Ctrl and C (or Cmd and C on a Mac) to copy it.");
    }
  };

  const share = async () => {
    try {
      await navigator.share({ title: "GrowPilot Academy", text: shareText, url: link });
    } catch {
      // The student closed the share sheet; nothing to do.
    }
  };

  return (
    <div>
      <label htmlFor={inputId} className="text-base font-semibold text-ink">
        {label}
      </label>
      <input
        id={inputId}
        ref={inputRef}
        readOnly
        value={link}
        onFocus={(event) => event.currentTarget.select()}
        className="mt-2 block min-h-12 w-full rounded-xl border-2 border-line bg-canvas px-4 font-mono text-base text-ink"
      />
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <Button size="lg" onClick={copy} className="w-full sm:w-auto">
          {message.startsWith("Link copied") ? (
            <Check aria-hidden="true" className="size-5" />
          ) : (
            <Copy aria-hidden="true" className="size-5" />
          )}
          {copyLabel}
        </Button>
        {canShare && (
          <Button size="lg" variant="secondary" onClick={share} className="w-full sm:w-auto">
            <Share2 aria-hidden="true" className="size-5" />
            Share Link
          </Button>
        )}
      </div>
      <p role="status" className="mt-2 min-h-6 text-base font-semibold text-primary-strong">
        {message}
      </p>
    </div>
  );
}
