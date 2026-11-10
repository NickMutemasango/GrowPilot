"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Areas with their own, simpler header: the lesson player and the admin area. */
const FOCUSED_AREAS = ["/learn/", "/admin"];

/** Hides its children (the main website header) in areas that have their own header. */
export function HideOnFocusedPages({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const hidden = FOCUSED_AREAS.some((area) => pathname === area || pathname.startsWith(area.endsWith("/") ? area : `${area}/`));
  return hidden ? null : children;
}
