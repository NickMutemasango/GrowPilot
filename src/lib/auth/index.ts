/*
 * Authentication service: the only place the forms talk to for sign-up,
 * log-in, Google sign-in and password resets.
 *
 * NO AUTHENTICATION PROVIDER IS CONFIGURED YET. Every function below returns
 * a "not-configured" result. Nothing is sent anywhere and nothing is stored;
 * passwords never leave the form.
 *
 * To make these work, choose a provider (for example Auth.js, Supabase Auth,
 * Clerk or Firebase Auth), add its server-side configuration and secrets in
 * environment variables (never in this file), then replace the bodies below
 * with calls to that provider. Google sign-in additionally needs a Google
 * OAuth client (client ID + secret) registered with the provider.
 */

export type AuthFailureReason =
  | "not-configured"
  | "invalid-credentials"
  | "email-in-use"
  | "network";

export type AuthResult =
  | { ok: true; redirectTo: string }
  | { ok: false; reason: AuthFailureReason };

export type PasswordResetResult = { ok: true } | { ok: false; reason: AuthFailureReason };

export const authStatus = {
  emailPasswordConfigured: false,
  googleConfigured: false,
} as const;

const notConfigured = { ok: false, reason: "not-configured" } as const;

export async function registerWithEmail(_input: {
  fullName: string;
  email: string;
  password: string;
  redirectTo: string;
}): Promise<AuthResult> {
  return notConfigured;
}

export async function signInWithEmail(_input: {
  email: string;
  password: string;
  redirectTo: string;
}): Promise<AuthResult> {
  return notConfigured;
}

export async function signInWithGoogle(_input: { redirectTo: string }): Promise<AuthResult> {
  return notConfigured;
}

/**
 * When implemented, always report success to the user whether or not the
 * email is registered, so the response never reveals who has an account.
 */
export async function requestPasswordReset(_input: {
  email: string;
}): Promise<PasswordResetResult> {
  return notConfigured;
}
