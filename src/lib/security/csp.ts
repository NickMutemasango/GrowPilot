/*
 * CONTENT SECURITY POLICY
 *
 * The last line of defence against cross-site scripting: even if something
 * managed to inject a <script> into a page, the browser would refuse to
 * run it.
 *
 * There are two policies, because of how the pages are built.
 *
 *  - PRIVATE pages (sign-in, dashboard, checkout, instructor, admin) are
 *    rendered fresh for every request, so each one carries its own nonce.
 *    Only scripts marked with that nonce run, and the nonce cannot be
 *    guessed. This is the strong policy, and it covers everything that
 *    handles an account, money or administration.
 *
 *  - PUBLIC marketing pages are prerendered at build time, so there is no
 *    per-request nonce to give them. They get the same policy with
 *    `'unsafe-inline'` for scripts instead. Everything else still applies:
 *    scripts may only come from this site, there are no third-party
 *    scripts, no embeds, and the pages show no account data.
 *
 * `'unsafe-inline'` is allowed for STYLES in both: React sets style
 * attributes (progress bars, the hero backdrop) and those count as inline
 * styles. An inline style cannot execute code.
 *
 * Development needs more rope — Fast Refresh evaluates code and opens a
 * websocket — so the policy is relaxed there. Nothing in development is
 * reachable from the internet.
 */

type PolicyOptions = {
  /** The request's nonce; used only by the strict policy. */
  nonce: string;
  /** True for pages rendered per request, which can carry a nonce. */
  strict: boolean;
  isDevelopment: boolean;
};

export function contentSecurityPolicy({ nonce, strict, isDevelopment }: PolicyOptions): string {
  const scriptSrc = isDevelopment
    ? `'self' 'unsafe-eval' 'unsafe-inline'`
    : strict
      ? `'self' 'nonce-${nonce}' 'strict-dynamic'`
      : `'self' 'unsafe-inline'`;

  const connectSrc = isDevelopment ? `'self' ws: wss:` : `'self'`;

  return [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `font-src 'self'`,
    `connect-src ${connectSrc}`,
    // No plugins, no embedded documents, and this site may never be put in
    // a frame — that is what stops clickjacking of the admin screens.
    `object-src 'none'`,
    `frame-src 'none'`,
    `frame-ancestors 'none'`,
    // A <base> tag injected into the page cannot redirect relative URLs,
    // and a form cannot be made to post somewhere else.
    `base-uri 'self'`,
    `form-action 'self'`,
    `upgrade-insecure-requests`,
  ].join("; ");
}

/** A fresh, unguessable nonce for one request. */
export function createNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes));
}
