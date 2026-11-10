"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { BookOpen, ChevronDown, LayoutDashboard, PlusCircle, UserRound, Users } from "lucide-react";

const links = [
  { label: "Overview", href: "/instructor/dashboard", icon: LayoutDashboard },
  { label: "My Courses", href: "/instructor/courses", icon: BookOpen },
  { label: "Create Course", href: "/instructor/courses/create", icon: PlusCircle },
  { label: "Students", href: "/instructor/students", icon: Users },
  { label: "Instructor Profile", href: "/instructor/profile", icon: UserRound },
];

function isActive(pathname: string, href: string) {
  if (href === "/instructor/courses") {
    return pathname === href || (pathname.startsWith(`${href}/`) && !pathname.startsWith("/instructor/courses/create"));
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Instructor menu: always shown on large screens, a labelled drop-down on smaller ones. */
export function InstructorSidebar({ instructorName }: { instructorName: string }) {
  const pathname = usePathname();
  const listId = useId();
  const [open, setOpen] = useState(false);
  const current = links.find((link) => isActive(pathname, link.href)) ?? links[0];

  useEffect(() => setOpen(false), [pathname]);

  return (
    <nav aria-label="Instructor" className="rounded-2xl border border-line bg-surface lg:sticky lg:top-[calc(var(--header-height)+1.5rem)]">
      <div className="border-b border-line px-4 py-4">
        <p className="text-sm font-semibold tracking-wide text-primary uppercase">Instructor Area</p>
        <p className="mt-0.5 text-base font-bold text-ink">{instructorName}</p>
      </div>

      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-12 w-full items-center gap-3 px-4 text-left text-base font-semibold text-ink hover:bg-secondary/60 lg:hidden"
      >
        <current.icon aria-hidden="true" className="size-5 text-primary" />
        <span className="flex-1">
          <span className="sr-only">Instructor menu, current page: </span>
          {current.label}
        </span>
        <span className="text-base font-semibold text-primary">{open ? "Close menu" : "Menu"}</span>
        <ChevronDown aria-hidden="true" className={`size-5 text-primary transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <ul id={listId} className={`${open ? "flex" : "hidden"} flex-col gap-1 p-2 lg:flex`}>
        {links.map(({ label, href, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-base transition-colors ${
                  active ? "bg-primary font-semibold text-white" : "font-medium text-ink hover:bg-secondary"
                }`}
              >
                <Icon aria-hidden="true" className="size-5 shrink-0" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
