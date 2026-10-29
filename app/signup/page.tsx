import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Sign up — GrowPilot",
  description: "Create a free GrowPilot account to enrol in courses and read the digital library.",
};

export default function SignupPage() {
  return (
    <AuthShell title="Create your account" subtitle="It's free — start learning in minutes.">
      <SignupForm />
    </AuthShell>
  );
}
