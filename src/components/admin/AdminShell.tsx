"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";

const COLLAPSE_KEY = "growpilot-admin-menu-collapsed";

type AdminShellProps = {
  adminName: string;
  firstName: string;
  signOutHref: string | null;
  children: ReactNode;
};

/**
 * AdminLayout's frame: sidebar (collapsible on desktop, a slide-in menu on
 * smaller screens), header and content.
 */
export function AdminShell({ adminName, firstName, signOutHref, children }: AdminShellProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Remember the collapsed choice on this device only.
  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      // Storage blocked: start expanded.
    }
  }, []);
  const toggleCollapse = () =>
    setCollapsed((value) => {
      try {
        window.localStorage.setItem(COLLAPSE_KEY, value ? "0" : "1");
      } catch {
        // Not remembered; that's fine.
      }
      return !value;
    });

  useEffect(() => setMenuOpen(false), [pathname]);

  // Phone menu: Escape closes it, focus moves into it, and the page behind doesn't scroll.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    drawerRef.current?.querySelector<HTMLElement>("a, button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <div className="flex min-h-dvh bg-canvas">
      <aside
        className={`sticky top-0 hidden h-dvh shrink-0 border-r border-line bg-surface transition-[width] duration-200 motion-reduce:transition-none lg:block ${
          collapsed ? "w-20" : "w-72"
        }`}
      >
        <AdminSidebar collapsed={collapsed} onToggleCollapse={toggleCollapse} />
      </aside>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div aria-hidden="true" className="absolute inset-0 bg-ink/40" onClick={() => setMenuOpen(false)} />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Admin menu"
            className="absolute inset-y-0 left-0 flex w-[min(20rem,85vw)] flex-col bg-surface shadow-menu"
          >
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="absolute top-3 right-3 z-10 inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-base font-semibold text-ink hover:bg-secondary"
            >
              <X aria-hidden="true" className="size-5" />
              Close
            </button>
            <AdminSidebar onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader adminName={adminName} firstName={firstName} onOpenMenu={() => setMenuOpen(true)} signOutHref={signOutHref} />
        <div className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {/*
            Admin screens are tables and lists, not reading columns, so they
            use most of a wide monitor. The cap only stops rows stretching to
            an unusable width on very wide screens.
          */}
          <div className="mx-auto max-w-[110rem]">{children}</div>
        </div>
      </div>
    </div>
  );
}
