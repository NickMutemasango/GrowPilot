/*
 * The signed-in student, read on the server.
 *
 * NO AUTHENTICATION PROVIDER IS CONFIGURED YET (see ./index.ts), so nobody
 * is ever signed in and this returns null. Enrolling and buying therefore
 * send students to /login, which keeps where they were going.
 *
 * When a provider is added, read its session cookie here and return the
 * student. Everything that checks access calls this on the server. When a
 * new account is created, also call `recordReferralSignup` (src/lib/rewards/
 * rules.ts) with `getRememberedCode()` so a friend referral is linked.
 *
 * NON-NEGOTIABLE, because every access check in the platform rests on this
 * one function (see SECURITY.md):
 *
 *  - The session cookie is httpOnly, secure and sameSite, signed or
 *    encrypted, short-lived, and revocable on the server.
 *  - `roles` is read from the account in the DATABASE on each request.
 *    Never from a claim in the cookie or token that the browser could
 *    replay after an administrator took the role away.
 *  - A suspended account returns null here, so suspension takes effect on
 *    the next request rather than when the session happens to expire.
 *  - Return null on any doubt. Everything above this fails closed: no
 *    student means no access.
 */
/** What a signed-in person may do. Admins manage roles (Step 12). */
export type Role = "student" | "instructor" | "admin";

export type SignedInStudent = {
  id: string;
  fullName: string;
  email: string;
  /** Read from the server-side account, never from the browser. */
  roles: Role[];
};

export async function getCurrentStudent(): Promise<SignedInStudent | null> {
  return null;
}

/** Where "Sign Out" goes. `null` until a sign-in provider gives us one. */
export const SIGN_OUT_HREF: string | null = null;

/** "/login?next=/checkout/excel" */
export function loginHref(next: string): string {
  return `/login?next=${encodeURIComponent(next)}`;
}
