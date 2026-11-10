import { NextResponse, type NextRequest } from "next/server";
import { rewardsPolicy } from "@/config/rewards";
import { REFERRAL_COOKIE } from "@/lib/rewards/cookie";
import { isValidCode } from "@/lib/rewards/rules";
import { contentSecurityPolicy, createNonce } from "@/lib/security/csp";

/*
 * Runs before every page.
 *
 * It does three things:
 *
 *  1. Gives each request a Content Security Policy with its own nonce.
 *  2. Marks the private areas as never-store, never-index, so an admin
 *     page can't sit in a shared cache or turn up in a search engine.
 *  3. Remembers an affiliate or friend code from a link (?ref=CODE). Only
 *     the code is remembered; whether it counts, and for whom, is decided
 *     on the server when an account is created or a payment is confirmed.
 *
 * WHAT IT DELIBERATELY DOES NOT DO: decide who may enter the admin area.
 * Middleware is the wrong place for that — it is one header-parsing bug
 * away from being bypassed, and Next.js has had exactly that bug before
 * (CVE-2025-29927). Access is decided on the server, in the page itself:
 * `requireAdmin` runs in the admin layout, in every admin page, and again
 * inside every server action that changes anything. See
 * src/lib/admin/service.ts.
 */

/**
 * Everything that handles an account, money or administration. These pages
 * are rendered per request (`force-dynamic`), so they can carry a nonce,
 * and they must never be cached by a browser, proxy or CDN, or indexed.
 */
const PRIVATE_PREFIXES = [
  "/admin",
  "/instructor",
  "/dashboard",
  "/affiliate",
  "/enrolled",
  "/checkout",
  "/login",
  "/register",
  "/forgot-password",
];

/** Pages that are never cached and never indexed. Sign-in pages may be indexed. */
const NEVER_CACHE_PREFIXES = ["/admin", "/instructor", "/dashboard", "/affiliate", "/enrolled", "/checkout"];

const startsWithAny = (pathname: string, prefixes: string[]) =>
  prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const nonce = createNonce();
  const csp = contentSecurityPolicy({
    nonce,
    strict: startsWithAny(pathname, PRIVATE_PREFIXES),
    isDevelopment: process.env.NODE_ENV === "development",
  });

  // Next.js reads the nonce back out of the request's own CSP header and
  // puts it on the scripts it renders, so its hydration scripts are allowed
  // and anything injected later is not.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("content-security-policy", csp);

  if (startsWithAny(pathname, NEVER_CACHE_PREFIXES)) {
    response.headers.set("cache-control", "no-store, no-cache, must-revalidate, private");
    response.headers.set("x-robots-tag", "noindex, nofollow, noarchive");
  }

  const code = request.nextUrl.searchParams.get("ref");
  if (isValidCode(code)) {
    response.cookies.set(REFERRAL_COOKIE, code, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: rewardsPolicy.referralCookieDays * 24 * 60 * 60,
      path: "/",
    });
  }

  return response;
}

export const config = {
  // Pages only; skip Next.js files, images and API routes. The API gets its
  // headers from next.config.ts instead.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.[a-z0-9]+$).*)"],
};
