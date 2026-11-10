import { Info } from "lucide-react";

/** A plain-English message returned by an enrol or payment action. */
export function ActionMessage({ message }: { message: string | null }) {
  return (
    <div role="status" className="empty:hidden">
      {message && (
        <p className="mt-4 flex gap-3 rounded-2xl border-2 border-accent bg-accent/15 p-4 text-base text-ink">
          <Info aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#6b4e00]" />
          {message}
        </p>
      )}
    </div>
  );
}
