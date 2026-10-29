import {
  Atom,
  Calculator,
  Code2,
  Dna,
  FlaskConical,
  Landmark,
  LineChart,
  Palette,
  type LucideIcon,
} from "lucide-react";

export type Subject =
  | "Computer Science"
  | "Mathematics"
  | "Biology"
  | "Physics"
  | "Chemistry"
  | "Business"
  | "History"
  | "Design";

export const subjectStyle: Record<Subject, { icon: LucideIcon; tile: string; iconColor: string }> = {
  "Computer Science": { icon: Code2, tile: "from-brand-50 to-brand-100", iconColor: "text-brand-600" },
  Mathematics: { icon: Calculator, tile: "from-sky-50 to-sky-100", iconColor: "text-sky-600" },
  Biology: { icon: Dna, tile: "from-emerald-50 to-emerald-100", iconColor: "text-emerald-600" },
  Physics: { icon: Atom, tile: "from-indigo-50 to-indigo-100", iconColor: "text-indigo-600" },
  Chemistry: { icon: FlaskConical, tile: "from-teal-50 to-teal-100", iconColor: "text-teal-600" },
  Business: { icon: LineChart, tile: "from-accent-50 to-accent-100", iconColor: "text-accent-600" },
  History: { icon: Landmark, tile: "from-orange-50 to-orange-100", iconColor: "text-orange-600" },
  Design: { icon: Palette, tile: "from-rose-50 to-rose-100", iconColor: "text-rose-600" },
};

export const subjects = Object.keys(subjectStyle) as Subject[];
