import type { Role } from "./session";

/*
 * Who may enter a protected area. Decided on the server from the account's
 * roles, never from anything in the browser. Roles are only ever given by
 * an authorised administrator; nobody can sign themselves up as one.
 */

export type AccessDecision = "allowed" | "sign-in" | "not-allowed";

export function checkRole(user: { roles: readonly Role[] } | null, role: Role): AccessDecision {
  if (!user) return "sign-in";
  return user.roles.includes(role) ? "allowed" : "not-allowed";
}
