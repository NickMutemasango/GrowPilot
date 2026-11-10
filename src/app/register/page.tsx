import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { getSafeRedirect } from "@/lib/auth/redirect";

/*
 * Never prerendered and never cached: this page depends on who is signed
 * in, and it must be built fresh for each request so its Content Security
 * Policy can carry that request's nonce.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Create Your Account" };

type Props = { searchParams: Promise<{ next?: string | string[] }> };

export default async function RegisterPage({ searchParams }: Props) {
  const redirectTo = getSafeRedirect((await searchParams).next);

  return (
    <AuthLayout
      title="Start Your Learning Journey"
      description="Create your free GrowPilot account and take your first step towards learning something new."
    >
      <RegisterForm redirectTo={redirectTo} />
    </AuthLayout>
  );
}
