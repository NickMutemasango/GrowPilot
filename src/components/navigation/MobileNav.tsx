"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { authNav, mainNav } from "@/config/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { NavLink } from "./NavLink";

/*
 * The menu icon is 24px with a 44px-tall button around it, so it reads as a
 * normal site menu while staying easy to tap.
 */
/**
 * Mobile / tablet menu. A clearly labelled "Menu" button opens a simple panel
 * under the header. It closes with the "Close" button, the Escape key, a tap
 * outside the panel, or by choosing a link.
 */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    // Move focus into the menu so keyboard users start at the first link.
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };

    // If the screen grows to desktop size, the desktop links take over.
    const desktop = window.matchMedia("(min-width: 64rem)");
    const onResize = () => desktop.matches && setOpen(false);

    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onResize);
    // Hold the page still behind the open menu, as the admin menu does.
    const pageOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onResize);
      document.body.style.overflow = pageOverflow;
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        ref={toggleRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-line bg-surface px-3.5 text-base font-semibold text-ink transition-colors hover:border-primary hover:bg-secondary"
      >
        {open ? (
          <X className="size-6" aria-hidden="true" />
        ) : (
          <Menu className="size-6" aria-hidden="true" />
        )}
        {open ? "Close" : "Menu"}
      </button>

      {open && (
        <>
          {/* Dim the page behind the menu; tapping it closes the menu. */}
          <div
            aria-hidden="true"
            onClick={close}
            className="fixed inset-x-0 top-[var(--header-height)] bottom-0 bg-ink/30"
          />

          <div
            ref={panelRef}
            id={panelId}
            className="absolute inset-x-0 top-full max-h-[calc(100dvh-var(--header-height))] overflow-y-auto border-t border-line bg-surface shadow-menu"
          >
            <nav aria-label="Main menu" className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
              <ul className="flex flex-col gap-2">
                {mainNav.map((item) => (
                  <li key={item.href}>
                    <NavLink {...item} layout="menu" onNavigate={close} />
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex flex-col gap-3 border-t border-line pt-5 sm:flex-row">
                <ButtonLink
                  href={authNav.getStarted.href}
                  onClick={close}
                  size="lg"
                  className="w-full sm:flex-1"
                >
                  {authNav.getStarted.label}
                </ButtonLink>
                <ButtonLink
                  href={authNav.login.href}
                  onClick={close}
                  variant="secondary"
                  size="lg"
                  className="w-full sm:flex-1"
                >
                  {authNav.login.label}
                </ButtonLink>
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
