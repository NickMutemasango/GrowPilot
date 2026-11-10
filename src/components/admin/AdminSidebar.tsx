"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { adminHref, adminSections, sectionForPath } from "./sections";

type AdminSidebarProps = {
  /** Icons only (desktop). */
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
};

/** The admin menu: the same list on desktop and in the phone menu. */
export function AdminSidebar({ collapsed = false, onToggleCollapse, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();
  const current = sectionForPath(pathname);

  return (
    <div className="flex h-full flex-col">
      <Link
        href="/admin"
        onClick={onNavigate}
        aria-label="GrowPilot Admin, overview"
        className={`flex min-h-16 items-center gap-3 border-b border-line ${collapsed ? "justify-center px-2" : "px-5"}`}
      >
        {collapsed ? (
          <span aria-hidden="true" className="text-lg font-bold tracking-tight text-ink">
            GP
          </span>
        ) : (
          <span aria-hidden="true" className="leading-tight">
            <span className="block text-lg font-bold text-ink">GrowPilot</span>
            <span className="block text-sm font-semibold tracking-[0.14em] text-primary uppercase">Admin</span>
          </span>
        )}
      </Link>

      <nav aria-label="Admin" className="flex-1 overflow-y-auto p-3">
        {/* Built sections first; the rest sit quietly under one "Coming soon" heading. */}
        {[
          { heading: null, items: adminSections.filter((section) => section.ready) },
          { heading: "Coming soon", items: adminSections.filter((section) => !section.ready) },
        ].map(({ heading, items }) =>
          items.length === 0 ? null : (
            <div key={heading ?? "ready"} className={heading ? "mt-5" : undefined}>
              {heading &&
                (collapsed ? (
                  <hr className="mx-3 mb-3 border-line" />
                ) : (
                  <p className="mb-1 px-3 text-sm font-semibold tracking-wide text-ink-muted uppercase">{heading}</p>
                ))}
              <ul className="flex flex-col gap-1">
                {items.map((section) => {
                  const active = section === current;
                  const Icon = section.icon;
                  return (
                    <li key={section.label}>
                      <Link
                        href={adminHref(section)}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        title={collapsed ? section.label : undefined}
                        className={`flex min-h-12 items-center gap-3 rounded-xl text-base whitespace-nowrap transition-colors ${
                          collapsed ? "justify-center px-0" : "px-3"
                        } ${
                          active
                            ? "bg-primary font-semibold text-white"
                            : section.ready
                              ? "font-medium text-ink hover:bg-secondary"
                              : "font-medium text-ink-muted hover:bg-secondary hover:text-ink"
                        }`}
                      >
                        <Icon aria-hidden="true" className="size-5 shrink-0" />
                        <span className={collapsed ? "sr-only" : "truncate"}>
                          {section.label}
                          {!section.ready && <span className="sr-only">, coming soon</span>}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ),
        )}
      </nav>

      <div className="flex flex-col gap-1 border-t border-line p-3">
        <Link
          href="/"
          onClick={onNavigate}
          title={collapsed ? "Back to the website" : undefined}
          className={`flex min-h-11 items-center gap-3 rounded-xl text-base font-medium text-ink-muted hover:bg-secondary hover:text-ink ${collapsed ? "justify-center" : "px-3"}`}
        >
          <ArrowLeft aria-hidden="true" className="size-5 shrink-0" />
          <span className={collapsed ? "sr-only" : undefined}>Back to the website</span>
        </Link>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand the menu" : "Collapse the menu"}
            title={collapsed ? "Expand the menu" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-xl text-base font-medium text-ink-muted hover:bg-secondary hover:text-ink ${collapsed ? "justify-center" : "px-3"}`}
          >
            {collapsed ? <PanelLeftOpen aria-hidden="true" className="size-5" /> : <PanelLeftClose aria-hidden="true" className="size-5" />}
            {!collapsed && <span aria-hidden="true">Collapse menu</span>}
          </button>
        )}
      </div>
    </div>
  );
}
