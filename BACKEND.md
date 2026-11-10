# Connecting the backend

All sample data has been removed. Every screen is still here; each one now
reads through a typed **store** that currently returns `null`, so pages show
their own empty states instead of inventing figures.

To bring the platform to life you implement the stores. Nothing else in the
interface needs to change.

## How it fits together

```
page (server component)  →  service (src/lib/…)  →  store  →  your database
```

- **Pages** never touch a database directly.
- **Services** hold the rules that must not be duplicated (progress sums,
  enrolment status, commission rates). They are covered by 520 unit tests;
  keep them.
- **Stores** are the only place with a query in it. Each file documents what
  its methods must return and the mistakes to avoid.

## The twelve stores

| Store | File | Fills |
|---|---|---|
| Catalogue | `src/lib/catalogue-store.ts` | `/courses`, `/courses/[slug]`, every course card |
| Lessons | `src/lib/lesson-store.ts` | the lesson player, and who may open a course |
| Progress | `src/lib/progress/store.ts` | lesson completion, certificates |
| Student | `src/lib/student-store.ts` | `/dashboard`, `/dashboard/certificates/[id]` |
| Payments | `src/lib/payments/store.ts` | checkout, orders, enrolment on payment |
| Rewards | `src/lib/rewards/store.ts` | affiliates, referrals, commissions |
| Instructor | `src/lib/instructor/store.ts` | saving courses and profiles, file uploads |
| Admin — users | `src/lib/admin/user-store.ts` | `/admin/users` |
| Admin — courses | `src/lib/admin/course-store.ts` | `/admin/courses`, course review |
| Admin — enrolments | `src/lib/admin/enrolment-store.ts` | `/admin/enrolments` |
| Admin — payments | `src/lib/admin/payment-store.ts` | `/admin/payments` |
| Admin — affiliates | `src/lib/admin/affiliate-store.ts` | `/admin/affiliates` |

Each `getXStore()` returns `null` today. Return your implementation instead
and the screen above it starts working.

## Sign-in comes first

`src/lib/auth/session.ts` → `getCurrentStudent()` returns `null`, so every
protected page redirects to `/login`:

- `/dashboard`, `/dashboard/certificates/[id]`
- `/admin/*` (also checks the `admin` role)
- `/instructor/*` (also checks the `instructor` role)
- `/enrolled/[slug]`, `/affiliate/apply`, `/affiliate/dashboard`

`src/lib/auth/index.ts` holds the sign-up, log-in, Google and
password-reset functions, all returning `not-configured`. Wire these to your
provider (Auth.js, Supabase Auth, Clerk, Firebase) before the stores — most
store methods take a student ID, and **that ID must come from the session on
the server, never from the browser**.

## Order worth following

1. **Auth** — sessions and the three roles (`student`, `instructor`, `admin`).
2. **Catalogue** — the public site comes alive; course pages stop 404ing.
3. **Admin users + courses** — so somebody can publish a course.
4. **Payments + enrolments** — checkout and access.
5. **Lessons + progress** — the lesson player and certificates.
6. **Rewards** — affiliates and referrals.
7. **Reports** — build an `AdminReports` (shape in
   `src/lib/admin/report-service.ts`) and render the sections in
   `src/components/admin/reports`, which are all still in place.

## Rules the interface already assumes

- **Filter, search, sort and page in the database.** The admin screens send
  their filters to the server and expect one page of rows plus a total; they
  do not filter in the browser.
- **Only published courses reach students.** Draft, submitted, rejected and
  unpublished courses must be filtered out server-side.
- **Money stays in minor units** with its currency beside it, and is never
  totalled across currencies.
- **A figure must be countable from a list somebody can open**, so a report
  can never disagree with the screen behind it.
- **Every write is a server action** that re-checks permission at the moment
  of the action: `src/app/admin/users/actions.ts`,
  `src/app/admin/courses/actions.ts`, `src/app/instructor/actions.ts` and
  `src/app/learn/actions.ts` are the pattern to copy.

## Still to wire up

The affiliate, payout, referral, enrolment and payment admin screens update
their own state when you act on them but do not yet send anything to a
server — they have no action module. Add one per area, following
`src/app/admin/users/actions.ts`, and call it from the component's handler
in place of the local `setState`.
