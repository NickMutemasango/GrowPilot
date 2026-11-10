# Protecting the admin area

This is what guards GrowPilot Academy today, and the rules that must hold
when sign-in is added. The admin area is where the damage would be done —
account suspension, course publishing, refunds, payouts — so it gets the
most layers.

## How access is decided

**Every check runs on the server, from the account's roles in the
database. Nothing in the browser is ever trusted** — not a cookie value, not
a header, not a hidden field, not a URL.

Four independent layers, so no single mistake opens the door:

| Layer | Where | What it does |
|---|---|---|
| 1. Layout | `src/app/admin/layout.tsx` | `requireAdmin()` before any admin page renders |
| 2. Page | every file in `src/app/admin/**/page.tsx` | `requireAdmin()` again, so a page can never be reached on its own |
| 3. Action | `src/app/admin/*/actions.ts` | `requireAdmin()` **inside each write**, re-checked at the moment of the action |
| 4. Rules | `src/lib/admin/*.ts` | refuse the action itself (you cannot suspend your own account, or remove the last administrator) |

Layer 3 is the one that matters most. A server action is a public HTTP
endpoint: anyone can call it directly, without ever loading the page. It
must check permission itself, every time — which is why the check is not
hoisted into the layout and trusted thereafter.

### Why the access check is *not* in middleware

Middleware looks like the obvious place, and it is the wrong one. It runs
before routing, on a request an attacker fully controls, and a single
header-parsing bug turns it off — Next.js had exactly that flaw in
CVE-2025-29927, where a crafted `x-middleware-subrequest` header skipped
middleware entirely and every "protected" route opened.

`src/middleware.ts` therefore never decides who may enter. It sets security
headers and cache rules only. Sites that moved their auth check into
middleware were the ones breached by that CVE; this one would not have
been.

## Headers sent with every response

Set in `next.config.ts` (fixed) and `src/middleware.ts` (per request).

| Header | Value | Stops |
|---|---|---|
| `Content-Security-Policy` | see below | cross-site scripting, injected scripts, data exfiltration |
| `X-Frame-Options` / `frame-ancestors 'none'` | `DENY` | clickjacking: the admin area cannot be put in a frame |
| `Strict-Transport-Security` | 2 years, subdomains, preload | downgrade to HTTP, cookie theft over the wire (production only) |
| `X-Content-Type-Options` | `nosniff` | an uploaded file being treated as a script |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | leaking certificate ids and course paths to other sites |
| `Permissions-Policy` | camera, mic, location, payment, USB all off | a compromised page asking for hardware |
| `Cross-Origin-Opener-Policy` | `same-origin` | another site keeping a handle on your window |
| `Cache-Control` | `no-store` on every private page | admin pages sitting in a browser, proxy or CDN cache |
| `X-Robots-Tag` | `noindex, nofollow, noarchive` | admin pages turning up in search results |
| `X-Powered-By` | removed | advertising the framework and version to scanners |

### The Content Security Policy

Two policies, because of how pages are built (`src/lib/security/csp.ts`):

- **Private pages** — sign-in, dashboard, checkout, instructor, admin — are
  rendered per request and carry a **fresh random nonce**. Only scripts
  bearing that nonce run. An injected `<script>` cannot guess it, so an XSS
  payload is inert even if one is found. These pages are `force-dynamic`
  precisely so they can carry a nonce.
- **Public marketing pages** are prerendered at build time, so there is no
  per-request nonce to give them. They allow inline scripts but still only
  from this site: no third-party scripts, no embeds, no plugins. They show
  no account data.

Both forbid `object-src`, `frame-src`, framing, a foreign `<base>`, and
forms posting anywhere but this site.

**If you add a third-party script** — analytics, a chat widget, a payment
SDK — it will be blocked until you add its origin to the policy. That is the
point: add the one origin you need, never `'unsafe-inline'` to the strict
policy.

## When you add sign-in

The gate itself is still missing: `getCurrentStudent()` in
`src/lib/auth/session.ts` returns `null`, so *nobody* can enter the admin
area right now. When you wire a provider, these are not optional.

**The session cookie**
- `httpOnly` — JavaScript must not be able to read it.
- `secure` — HTTPS only.
- `sameSite: "lax"` at least; `"strict"` for the admin session if you can.
- A short lifetime with rotation on sign-in, and a server-side way to
  revoke it. Suspending an account must end its sessions immediately.
- Signed or encrypted, and **never** carrying the role as a readable claim
  the server then trusts. Read roles from the database on each request.

**Roles**
- Granted only by an authorised process — a command run by the owner, or an
  existing administrator through `/admin/users`. Never by a sign-up form,
  never from an environment variable in the client bundle.
- Re-read on every request. A user suspended a minute ago must be refused
  now, not when their session expires.

**The sign-in form**
- Rate-limit by IP *and* by account, and slow down after repeated failures.
  Without this, the admin password is guessable at leisure.
- Hash passwords with bcrypt, scrypt or argon2 — never SHA, never plain.
- Give the same answer for "no such account" and "wrong password", so the
  form cannot be used to discover who has an account.
- Offer two-factor authentication for administrators.

**Everything else**
- Validate every server action's input on the server. The browser's
  validation is a courtesy to the user, not a check.
- Log every administrative action with who, what and when — the audit
  entries already exist in `src/lib/admin/users.ts` and `courses.ts`; make
  sure the store writes them in the same transaction as the change.
- Keep the payment webhook's signature verification
  (`src/app/api/payments/webhook/route.ts`). It is the only unauthenticated
  endpoint, and it grants course access.

## Already handled

- **Open redirects**: `getSafeRedirect()` (`src/lib/auth/redirect.ts`)
  rejects `//evil.com`, `/\evil.com` and absolute URLs, so
  `?next=` cannot bounce someone off-site after sign-in.
- **Referral codes** from `?ref=` are validated before being stored, and
  the cookie is `httpOnly`.
- **Admin pages are never prerendered** (`force-dynamic`), so no admin HTML
  exists as a file on disk to be served by mistake.
- **No secrets in the client bundle**: nothing is read from
  `NEXT_PUBLIC_*` except the site URL.

## Checking it

```bash
curl -sI https://your-domain/admin | grep -iE "content-security|x-frame|cache-control|x-robots"
```

Then, once sign-in exists, the test that matters: call a server action
directly — `POST` to an admin page's action endpoint with a student's
session — and confirm it is refused.
