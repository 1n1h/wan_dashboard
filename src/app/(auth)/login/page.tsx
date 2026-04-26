import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back."
      subtitle="Pick up where you left off."
      footer={
        <>
          New here?{" "}
          <Link href="/signup" className="text-brand-glow hover:text-brand">
            Create an account
          </Link>
        </>
      }
    >
      <AuthForm mode="login" />
    </AuthShell>
  );
}
