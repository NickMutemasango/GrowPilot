"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActivePath, type NavItem } from "@/config/navigation";

type NavLinkProps = NavItem & {
  /** "bar" for the desktop header, "menu" for the large mobile menu rows. */
  layout?: "bar" | "menu";
  onNavigate?: () => void;
};

/**
 * A main navigation link. The current page is announced to screen readers
 * (aria-current) and shown visually with colour, weight and an underline bar,
 * so it never relies on colour alone.
 */
export function NavLink({ label, href, layout = "bar", onNavigate }: NavLinkProps) {
  const pathname = usePathname();
  const active = isActivePath(pathname, href);

  if (layout === "menu") {
    return (
      <Link
        href={href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={`flex min-h-12 items-center rounded-xl border-l-4 px-4 text-base transition-colors ${
          active
            ? "border-primary bg-secondary font-semibold text-primary-strong"
            : "border-transparent font-medium text-ink hover:bg-secondary"
        }`}
      >
        {label}
        {active && <span className="sr-only"> (current page)</span>}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`relative inline-flex min-h-11 items-center rounded-lg px-3.5 text-base transition-colors ${
        active
          ? "font-semibold text-primary"
          : "font-medium text-ink hover:bg-secondary hover:text-primary-strong"
      }`}
    >
      {label}
      <span
        aria-hidden="true"
        className={`absolute inset-x-4 -bottom-0.5 h-[3px] rounded-full ${
          active ? "bg-primary" : "bg-transparent"
        }`}
      />
    </Link>
  );
}
