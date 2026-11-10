import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { HeroIllustration } from "@/components/illustrations/HeroIllustration";

type AuthLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

const reassurances = [
  "Simple, step-by-step lessons",
  "Learn at your own pace",
  "Friendly courses for beginners",
];

/**
 * Two columns on desktop: a welcoming brand panel and the form. On smaller
 * screens only the form is shown, so it is never pushed down the page.
 */
export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <div className="mx-auto grid max-w-7xl items-start gap-12 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] lg:px-8 lg:py-16">
      <aside className="relative hidden overflow-hidden rounded-3xl bg-primary p-10 text-white shadow-photo lg:sticky lg:top-[calc(var(--header-height)+2rem)] lg:flex lg:flex-col">
        <div aria-hidden="true" className="absolute -top-24 -right-24 size-72 rounded-full bg-white/5" />
        <div className="relative flex items-center">
          <p className="text-xl font-bold">GrowPilot Academy</p>
        </div>

        <p className="relative mt-10 text-4xl leading-tight font-bold tracking-tight text-balance">
          It&apos;s never too late to learn something new.
        </p>
        <ul className="relative mt-8 flex flex-col gap-3.5">
          {reassurances.map((item) => (
            <li key={item} className="flex items-center gap-3 text-lg text-white/95">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-ink">
                <Check aria-hidden="true" className="size-4" strokeWidth={3} />
              </span>
              {item}
            </li>
          ))}
        </ul>

        <HeroIllustration
          sizes="(min-width: 1024px) 40vw, 0px"
          className="mt-10 aspect-[16/10] rounded-2xl ring-1 ring-white/20"
        />
      </aside>

      <section
        aria-labelledby="auth-heading"
        className="mx-auto w-full max-w-xl rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-10 lg:max-w-none"
      >
        <h1 id="auth-heading" className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-ink-muted">{description}</p>
        <div className="mt-8">{children}</div>
      </section>
    </div>
  );
}
