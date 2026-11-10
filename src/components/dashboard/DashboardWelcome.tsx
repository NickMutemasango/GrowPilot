import Link from "next/link";
import type { Student } from "@/types/student";

const dashboardLinks = [
  { label: "Dashboard", href: "/dashboard", current: true },
  { label: "My Courses", href: "#my-courses", current: false },
  { label: "My Certificates", href: "#my-certificates", current: false },
  { label: "My Purchases", href: "#my-purchases", current: false },
  { label: "Explore Courses", href: "/courses", current: false },
];

type DashboardWelcomeProps = {
  student: Student;
  hasCourses: boolean;
};

/** Greeting plus the few dashboard links a student needs. */
export function DashboardWelcome({ student, hasCourses }: DashboardWelcomeProps) {
  const greeting = student.firstName
    ? `Welcome back, ${student.firstName}!`
    : "Welcome to GrowPilot Academy!";

  const links = hasCourses ? dashboardLinks : dashboardLinks.filter((l) => l.href !== "#my-courses");

  return (
    <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-5xl">
          {greeting} <span aria-hidden="true">👋</span>
        </h1>
        <p className="mt-2 max-w-2xl text-lg leading-relaxed text-ink-muted sm:mt-3 sm:text-xl">
          {hasCourses
            ? "Ready to learn something new today? Let's continue where you left off."
            : "We're glad you're here. Let's find your first course together."}
        </p>
      </div>

      <nav aria-label="Dashboard">
        <ul className="flex flex-wrap gap-2">
          {links.map((link) => (
            <li key={link.href} className={link.current ? "hidden sm:block" : undefined}>
              <Link
                href={link.href}
                aria-current={link.current ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-full border-2 px-4 text-base font-semibold transition-colors ${
                  link.current
                    ? "border-primary bg-primary text-white"
                    : "border-line bg-surface text-ink hover:border-primary/50 hover:bg-secondary"
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
