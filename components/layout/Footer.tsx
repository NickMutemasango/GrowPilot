import Link from "next/link";
import { cacheLife } from "next/cache";
import Logo from "@/components/layout/Logo";
import type { Subject } from "@/lib/subjects";

const popularSubjects: Subject[] = ["Computer Science", "Mathematics", "Physics", "Design"];

const columns = [
  {
    title: "Learn",
    links: [
      { label: "All courses", href: "/courses" },
      { label: "Digital library", href: "/library" },
      { label: "Study notes", href: "/library?type=Study+notes" },
      { label: "Research papers", href: "/library?type=Research+paper" },
    ],
  },
  {
    title: "Popular subjects",
    links: popularSubjects.map((subject) => ({
      label: subject,
      href: `/courses?subject=${encodeURIComponent(subject)}`,
    })),
  },
  {
    title: "GrowPilot",
    links: [
      { label: "About us", href: "/about" },
      { label: "Log in", href: "/login" },
      { label: "Sign up", href: "/signup" },
    ],
  },
];

// The shell is prerendered, so reading the clock has to happen inside a cache scope.
async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-pretty text-slate-600">
              Expert-led courses and a growing digital library, so you can keep learning at
              your own pace.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-3">
            {columns.map((column) => (
              <nav key={column.title} aria-label={column.title}>
                <h2 className="text-sm font-semibold text-slate-900">{column.title}</h2>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="rounded-md text-sm text-slate-600 transition-colors hover:text-brand-700"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-slate-100 pt-6 text-sm text-slate-500">
          <p>
            © <CurrentYear /> GrowPilot. Learn without limits.
          </p>
        </div>
      </div>
    </footer>
  );
}
