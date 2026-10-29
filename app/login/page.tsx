import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in — GrowPilot",
  description: "Log in to GrowPilot to continue your courses and reading.",
};

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Log in to pick up where you left off.">
      <LoginForm />
    </AuthShell>
  );
}
