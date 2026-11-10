"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown, ExternalLink, LogOut, Menu } from "lucide-react";
import { sectionForPath } from "./sections";

type AdminHeaderProps = {
  adminName: string;
  firstName: string;
  onOpenMenu: () => void;
  /** Sign Out is only offered once real sign-in exists. */
  signOutHref: string | null;
};

/** Page title, a short welcome, and the account menu. */
export function AdminHeader({ adminName, firstName, onOpenMenu, signOutHref }: AdminHeaderProps) {
  const pathname = usePathname();
  const section = sectionForPath(pathname);
  const initials = adminName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/90">
      <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border-2 border-line px-3 text-base font-semibold text-ink hover:border-primary/50 lg:hidden"
        >
          <Menu aria-hidden="true" className="size-5" />
          Menu
        </button>
        <div className="min-w-0 flex-1">
          {/* Phones wrap the title over two lines; wider screens keep it on one. */}
          <p className="text-lg leading-snug font-bold text-ink sm:truncate sm:text-xl">{section.label}</p>
          <p className="hidden truncate text-base text-ink-muted sm:block">Welcome back, {firstName}!</p>
        </div>
        <AccountMenu adminName={adminName} initials={initials} signOutHref={signOutHref} />
      </div>
    </header>
  );
}

function AccountMenu({ adminName, initials, signOutHref }: { adminName: string; initials: string; signOutHref: string | null }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on Escape or a click outside, and give focus back to the button.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    const onClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-11 items-center gap-2 rounded-full py-1 pr-2 pl-1 hover:bg-secondary"
      >
        <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
          {initials}
        </span>
        <span className="hidden text-base font-semibold text-ink md:inline">{adminName}</span>
        <span className="sr-only md:hidden">{adminName}</span>
        <span className="sr-only">, account menu</span>
        <ChevronDown aria-hidden="true" className={`size-4 text-ink-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div id={panelId} className="absolute right-0 mt-2 w-72 rounded-2xl border border-line bg-surface p-2 shadow-menu">
          <div className="border-b border-line px-3 pt-2 pb-3">
            <p className="font-semibold text-ink">{adminName}</p>
            <p className="text-base text-ink-muted">Administrator</p>
          </div>
          <ul className="mt-2 flex flex-col gap-1">
            <li>
              <Link href="/" className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-base font-medium text-ink hover:bg-secondary">
                <ExternalLink aria-hidden="true" className="size-5 text-primary" />
                View the website
              </Link>
            </li>
            <li>
              {signOutHref ? (
                <Link href={signOutHref} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-base font-medium text-ink hover:bg-secondary">
                  <LogOut aria-hidden="true" className="size-5 text-primary" />
                  Sign Out
                </Link>
              ) : (
                <p className="flex items-start gap-3 rounded-xl px-3 py-2 text-base text-ink-muted">
                  <LogOut aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
                  Sign Out will appear here once sign-in is set up.
                </p>
              )}
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
