/*
 * Plain-English form checks shared by the sign-up, log-in and
 * password-reset forms. Each returns an error message, or undefined if OK.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const MIN_PASSWORD_LENGTH = 8;

export function validateFullName(value: string): string | undefined {
  return value.trim() ? undefined : "Please enter your full name.";
}

export function validateEmail(value: string): string | undefined {
  if (!value.trim()) return "Please enter your email address.";
  return EMAIL_PATTERN.test(value.trim())
    ? undefined
    : "Please enter a valid email address, like name@example.com.";
}

export function validateNewPassword(value: string): string | undefined {
  if (!value) return "Please create a password.";
  return value.length >= MIN_PASSWORD_LENGTH
    ? undefined
    : `Your password must contain at least ${MIN_PASSWORD_LENGTH} characters.`;
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string,
): string | undefined {
  if (!confirmation) return "Please type your password again.";
  return password === confirmation ? undefined : "Your passwords do not match.";
}

export function validateCurrentPassword(value: string): string | undefined {
  return value ? undefined : "Please enter your password.";
}
