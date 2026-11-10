/** Where students go after logging in when no other page was requested. */
export const DEFAULT_AFTER_LOGIN = "/dashboard";

/**
 * Returns `next` only if it is a path on this site, so a crafted link like
 * `/login?next=https://evil.example` can never send someone elsewhere
 * (prevents open redirects). Anything else falls back to the default.
 */
export function getSafeRedirect(next: string | string[] | undefined | null): string {
  const value = Array.isArray(next) ? next[0] : next;
  if (!value) return DEFAULT_AFTER_LOGIN;

  // Must be a single-slash relative path: rejects "//host", "/\host" and "http:".
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return DEFAULT_AFTER_LOGIN;
  }

  try {
    const url = new URL(value, "https://growpilot.local");
    if (url.origin !== "https://growpilot.local") return DEFAULT_AFTER_LOGIN;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return DEFAULT_AFTER_LOGIN;
  }
}
