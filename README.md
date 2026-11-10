# GrowPilot Academy

A simple, accessible online learning platform by GrowPilot.
Built with Next.js (App Router), TypeScript, Tailwind CSS v4 and Lucide icons.

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

## Where things live

| Path | Purpose |
| --- | --- |
| `src/app/globals.css` | Brand colours, fonts and shadows (the `@theme` block) |
| `src/config/navigation.ts` | Header and mobile-menu links |
| `src/components/brand/Logo.tsx` | Logo and brand mark |
| `src/components/ui/Button.tsx` | Primary / secondary buttons |
| `src/components/navigation/` | Header, nav links, mobile menu |
| `src/components/home/HeroSection.tsx` | Homepage hero |
| `src/data/courses.ts` | **Sample** course data (replace before launch) |
| `src/data/course-details.ts` | **Sample** lessons, outcomes and requirements per course |
| `src/data/instructors.ts` | **Sample** instructor profiles |
| `src/lib/courses.ts` | Course data access (swap for a database here) |
| `src/lib/course-filters.ts` | Search and filter logic |
| `src/components/courses/` | Catalogue, search, filters, cards, level badge |
| `src/components/course-details/` | Course page sections, curriculum accordion, enrolment card |
| `src/components/auth/` | Register, log-in and forgot-password forms and layout |
| `src/lib/auth/` | Auth service (not connected yet), validation, safe redirects |
| `src/data/sample-students.ts` | **Sample** students and enrolments for the dashboard preview |
| `src/lib/student.ts` | Dashboard data (progress, status, next lesson) |
| `src/components/dashboard/` | Student dashboard sections and progress bar |

## Accounts and sign-in (not connected yet)

The `/register`, `/login` and `/forgot-password` pages are fully built, but **no authentication
provider is configured**. Every action shows a "not available yet" message; nothing is sent
or stored, and no email is sent.

To switch them on:

1. Choose a provider (for example Auth.js, Supabase Auth, Clerk or Firebase Auth).
2. Add its configuration and secrets as environment variables (never in source code).
3. Replace the function bodies in `src/lib/auth/index.ts` and set `authStatus` to `true`.
4. For "Continue with Google", create a Google OAuth client and register it with the provider.
5. Password reset must always show the same message whether or not the email is registered.

After login, students go to the `next` page if it is a safe path on this site
(`src/lib/auth/redirect.ts`), otherwise to `/dashboard`.

## Student dashboard (preview)

`/dashboard` shows **sample** students only, with a banner saying so: `/dashboard` (a student
with courses) and `/dashboard?preview=new` (a brand-new student). It is not protected, because
there are no accounts yet. Once sign-in and enrolment exist, load the signed-in student's
records on the server in `src/app/dashboard/page.tsx`, send visitors who are not signed in to
`/login?next=/dashboard`, and remove the preview banner.

## Image credits

- Homepage hero: photo by Vitaly Gariev on [Unsplash](https://unsplash.com/photos/cMsdRjEApeo), free under the Unsplash License.
- Course thumbnails: free Unsplash photos; each photo ID is listed in `src/data/courses.ts`.
