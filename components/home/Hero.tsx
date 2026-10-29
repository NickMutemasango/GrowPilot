import { ArrowRight, GraduationCap, Library, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import FadeIn from "@/components/ui/FadeIn";
import SearchBar from "@/components/ui/SearchBar";
import DepartmentCard, { type Department } from "./DepartmentCard";
import HeroFloatingCards from "./HeroFloatingCards";

// Placeholder content — replace with real data once the platform has it.
const popularSearches = ["Web Development", "Data Science", "UI Design", "Calculus", "Python"];

const departments: Department[] = [
  {
    title: "Courses",
    description:
      "Learn new skills step by step through structured, expert-led courses with lessons, projects and progress tracking.",
    href: "/courses",
    actionLabel: "Explore Courses",
    icon: GraduationCap,
    tone: "brand",
    stat: { value: "500+", label: "courses" },
    tags: ["Development", "Design", "Business", "Science"],
  },
  {
    title: "Digital Library",
    description:
      "Access books, PDFs, study materials and educational resources whenever you need them, all in one place.",
    href: "/library",
    actionLabel: "Browse Library",
    icon: Library,
    tone: "accent",
    stat: { value: "2K+", label: "resources" },
    tags: ["eBooks", "PDFs", "Study Notes", "Research"],
  },
];

function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
      {/* Faint grid that fades out from the top centre. */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(226_232_240/0.7)_1px,transparent_1px),linear-gradient(to_bottom,rgb(226_232_240/0.7)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,black,transparent_75%)]" />
      <div className="absolute -top-48 left-1/2 h-[480px] w-[min(900px,140vw)] -translate-x-1/2 rounded-full bg-brand-100/80 blur-3xl" />
      <div className="absolute top-[55%] -right-40 size-96 rounded-full bg-accent-100/60 blur-3xl" />
      <div className="absolute top-[60%] -left-40 size-96 rounded-full bg-brand-50 blur-3xl" />
    </div>
  );
}

export default function Hero() {
  return (
    <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden">
      <HeroBackdrop />

      <div className="relative mx-auto max-w-7xl px-4 pt-14 pb-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24 lg:pb-24">
        <HeroFloatingCards />

        <div className="mx-auto max-w-3xl text-center">
          <FadeIn>
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-3.5 py-1.5 text-sm font-semibold text-brand-700 shadow-sm backdrop-blur-sm">
              <Sparkles className="size-4" aria-hidden="true" />
              Courses + Digital Library, all in one place
            </p>
          </FadeIn>

          <FadeIn delay={0.08}>
            <h1
              id="hero-heading"
              className="mt-6 font-display text-5xl leading-[1.05] font-extrabold tracking-tight text-balance text-slate-900 sm:text-6xl lg:text-7xl"
            >
              Learn.{" "}
              <span className="bg-linear-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">
                Explore.
              </span>{" "}
              <span className="relative inline-block">
                Grow
                <svg
                  aria-hidden="true"
                  viewBox="0 0 120 12"
                  preserveAspectRatio="none"
                  className="absolute -bottom-1.5 left-0 h-3 w-full text-accent-400 sm:-bottom-2"
                >
                  <path
                    d="M3 9C33 3 83 1.5 117 6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              .
            </h1>
          </FadeIn>

          <FadeIn delay={0.16}>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-pretty text-slate-600 sm:text-xl">
              Build new skills through expert-led courses and discover books, study
              materials, and educational resources from our digital library.
            </p>
          </FadeIn>

          <FadeIn delay={0.24}>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <ButtonLink href="/courses" size="lg" className="group w-full sm:w-auto">
                Explore Courses
                <ArrowRight
                  className="size-5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </ButtonLink>
              <ButtonLink
                href="/library"
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                <Library className="size-5 text-accent-600" aria-hidden="true" />
                Visit Library
              </ButtonLink>
            </div>
          </FadeIn>

          <FadeIn delay={0.32}>
            <SearchBar
              className="mx-auto mt-10 max-w-2xl"
              label="Search courses and library"
              placeholder="Search courses, books, topics..."
              suggestions={popularSearches}
            />
          </FadeIn>
        </div>

        <div className="mx-auto mt-14 grid max-w-5xl gap-5 sm:mt-16 md:grid-cols-2 md:gap-6 lg:mt-20">
          {departments.map((dept, i) => (
            <FadeIn key={dept.href} delay={0.4 + i * 0.1} y={24} className="h-full">
              <DepartmentCard {...dept} />
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
