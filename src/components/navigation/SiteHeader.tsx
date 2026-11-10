import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { authNav, mainNav } from "@/config/navigation";
import { MobileNav } from "./MobileNav";
import { NavLink } from "./NavLink";

/**
 * Sticky site header. Desktop (≥1024px) shows links inline; smaller screens,
 * including desktop at 200% zoom, switch to the "Menu" button.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 shadow-header backdrop-blur supports-[backdrop-filter]:bg-surface/90">
      <div className="relative mx-auto flex h-[var(--header-height)] max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-2">
            {mainNav.map((item) => (
              <li key={item.href}>
                <NavLink {...item} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ButtonLink href={authNav.login.href} variant="secondary">
            {authNav.login.label}
          </ButtonLink>
          <ButtonLink href={authNav.getStarted.href}>
            {authNav.getStarted.label}
          </ButtonLink>
        </div>

        <MobileNav />
      </div>
    </header>
  );
}
