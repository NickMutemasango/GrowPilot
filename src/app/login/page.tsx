import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/components/auth/LoginForm";
import { getSafeRedirect } from "@/lib/auth/redirect";

/*
 * Never prerendered and never cached: this page depends on who is signed
 * in, and it must be built fresh for each request so its Content Security
 * Policy can carry that request's nonce.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Log In" };

type Props = { searchParams: Promise<{ next?: string | string[] }> };

export default async function LoginPage({ searchParams }: Props) {
  const redirectTo = getSafeRedirect((await searchParams).next);

  return (
    <AuthLayout title="Welcome Back!" description="Log in to continue your learning journey.">
      <LoginForm redirectTo={redirectTo} />
    </AuthLayout>
  );
}
