export type NavItem = {
  label: string;
  href: string;
};

/** Main links shown in the centre of the header and in the mobile menu. */
export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Explore Courses", href: "/courses" },
  { label: "Earn Rewards", href: "/earn" },
];

/** Account actions shown on the right of the header. */
export const authNav = {
  login: { label: "Log In", href: "/login" },
  getStarted: { label: "Get Started", href: "/register" },
} satisfies Record<string, NavItem>;

/** True when `href` matches the current page (or a page inside that section). */
export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
