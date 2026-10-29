import Link from "next/link";
import { GraduationCap } from "lucide-react";

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 rounded-lg"
      aria-label="GrowPilot home"
    >
      <span className="grid size-9 place-items-center rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-600/30">
        <GraduationCap className="size-5" aria-hidden="true" />
      </span>
      <span className="font-display text-xl font-bold tracking-tight text-slate-900">
        GrowPilot
      </span>
    </Link>
  );
}
