import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";

export default function SignupPage() {
  return (
    <AuthShell
      title="Create your studio."
      subtitle="50 free credits. No card required."
      footer={
        <>
          Already have one?{" "}
          <Link href="/login" className="text-brand-glow hover:text-brand">
            Sign in
          </Link>
        </>
      }
    >
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
