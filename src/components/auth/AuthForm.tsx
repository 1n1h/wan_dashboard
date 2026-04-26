"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Loader2,
  ArrowLeft,
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
} from "lucide-react";
import { createClient } from "@insforge/sdk";
import { cn } from "@/lib/utils";

export function AuthForm({ mode }: { mode: "signup" | "login" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyEmailFor, setVerifyEmailFor] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          ...(mode === "signup" ? { name } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");

      if (data.requireEmailVerification) {
        setVerifyEmailFor(data.email ?? email);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed";
      if (mode === "signup" && /already exists/i.test(message)) {
        setError(
          "Account already exists. Try signing in — we'll send a fresh code if it's unverified."
        );
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  if (verifyEmailFor) {
    return (
      <VerifyCode
        email={verifyEmailFor}
        onBack={() => setVerifyEmailFor(null)}
        onVerified={() => {
          router.push("/dashboard");
          router.refresh();
        }}
      />
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {mode === "signup" && (
        <FormInput
          icon={<UserIcon className="text-white/60" size={18} />}
          type="text"
          placeholder="Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
      )}

      <FormInput
        icon={<Mail className="text-white/60" size={18} />}
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        required
      />

      <div className="relative">
        <FormInput
          icon={<Lock className="text-white/60" size={18} />}
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          required
          minLength={6}
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          aria-label={showPassword ? "Hide password" : "Show password"}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors focus:outline-none"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setRemember((v) => !v)}
          className="flex items-center gap-2 group"
        >
          <ToggleSwitch checked={remember} />
          <span className="text-sm text-white/80 group-hover:text-white transition-colors">
            Remember me
          </span>
        </button>
        {mode === "login" && (
          <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">
            Forgot password?
          </a>
        )}
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/15 border border-red-400/30 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={cn(
          "w-full py-3 rounded-lg font-medium text-white transition-all duration-200",
          "bg-brand hover:bg-brand-glow",
          "shadow-lg shadow-brand/20 hover:shadow-brand/40",
          "focus:outline-none focus:ring-2 focus:ring-brand-glow/60",
          "disabled:opacity-70 disabled:cursor-not-allowed",
          "hover:-translate-y-0.5 disabled:transform-none"
        )}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
            {mode === "signup" ? "Creating account..." : "Signing in..."}
          </span>
        ) : mode === "signup" ? (
          "Create account"
        ) : (
          "Enter Wan"
        )}
      </button>

      {/* Divider */}
      <div className="relative flex items-center justify-center pt-2">
        <div className="border-t border-white/10 absolute w-full"></div>
        <div className="bg-transparent px-3 relative text-white/50 text-xs font-mono uppercase tracking-wider">
          quick access via
        </div>
      </div>

      {/* Social row */}
      <div className="grid grid-cols-2 gap-3">
        <OAuthButton provider="google" label="Google" />
        <OAuthButton provider="github" label="GitHub" />
      </div>
    </form>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function FormInput({
  icon,
  type,
  placeholder,
  value,
  onChange,
  required,
  autoComplete,
  minLength,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  autoComplete?: string;
  minLength?: number;
}) {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
        {icon}
      </div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        autoComplete={autoComplete}
        minLength={minLength}
        className="auth-input w-full pl-10 pr-3 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:border-brand-glow/60 focus:bg-white/10 transition-colors"
      />
    </div>
  );
}

function ToggleSwitch({ checked }: { checked: boolean }) {
  return (
    <span
      className={cn(
        "relative inline-block w-10 h-5 rounded-full transition-colors duration-200 ease-in-out",
        checked ? "bg-brand" : "bg-white/20"
      )}
    >
      <span
        className={cn(
          "absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out",
          checked && "translate-x-5"
        )}
      />
    </span>
  );
}

function OAuthButton({
  provider,
  label,
}: {
  provider: "google" | "github";
  label: string;
}) {
  const [busy, setBusy] = useState(false);

  async function go() {
    setBusy(true);
    const sdk = createClient({ baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL! });
    const callback = `${window.location.origin}/auth/callback`;
    const { data, error } = await sdk.auth.signInWithOAuth({
      provider,
      redirectTo: callback,
      skipBrowserRedirect: true,
    });
    if (error || !data?.url) {
      setBusy(false);
      alert(error?.message ?? "OAuth init failed");
      return;
    }
    if (data.codeVerifier) {
      sessionStorage.setItem("insforge_code_verifier", data.codeVerifier);
    }
    window.location.href = data.url;
  }

  return (
    <button
      type="button"
      onClick={go}
      disabled={busy}
      className="flex items-center justify-center gap-2 p-2.5 bg-white/5 border border-white/10 rounded-lg text-white/85 hover:bg-white/10 hover:text-white hover:border-white/20 transition-colors disabled:opacity-60"
    >
      {busy ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <ProviderGlyph provider={provider} />
          <span className="text-sm">{label}</span>
        </>
      )}
    </button>
  );
}

function ProviderGlyph({ provider }: { provider: "google" | "github" }) {
  if (provider === "google") {
    return (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09 0-.73.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12c0 1.78.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
    );
  }
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.55v-2.04c-3.2.69-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.73-1.53-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.17.91-.25 1.89-.38 2.86-.38.97 0 1.95.13 2.86.38 2.18-1.48 3.14-1.17 3.14-1.17.62 1.59.23 2.76.11 3.05.73.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.37-5.25 5.65.41.36.78 1.05.78 2.13v3.16c0 .31.21.66.79.55 4.57-1.52 7.86-5.83 7.86-10.91C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

// ─── Verify-code screen ──────────────────────────────────────────────────────

function VerifyCode({
  email,
  onBack,
  onVerified,
}: {
  email: string;
  onBack: () => void;
  onVerified: () => void;
}) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [resentMsg, setResentMsg] = useState<string | null>(null);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  function setAt(i: number, raw: string) {
    const v = raw.replace(/\D/g, "").slice(0, 1);
    setDigits((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
    if (v && i < 5) refs.current[i + 1]?.focus();
  }

  function onPaste(e: React.ClipboardEvent) {
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!text) return;
    e.preventDefault();
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setDigits(next);
    refs.current[Math.min(text.length, 5)]?.focus();
    if (text.length === 6) submit(text);
  }

  function onKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  async function submit(otp?: string) {
    const code = (otp ?? digits.join("")).trim();
    if (code.length !== 6) return;
    setError(null);
    setVerifying(true);
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, otp: code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Verification failed");
      onVerified();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setDigits(["", "", "", "", "", ""]);
      refs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  }

  async function resend() {
    setResending(true);
    setResentMsg(null);
    setError(null);
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Resend failed");
      setResentMsg("New code sent. Check your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Resend failed");
    } finally {
      setResending(false);
    }
  }

  const filled = digits.every((d) => d !== "");

  return (
    <div className="space-y-5">
      <button
        onClick={onBack}
        className="text-xs font-mono uppercase tracking-wider text-white/50 hover:text-white/80 flex items-center gap-1.5"
      >
        <ArrowLeft className="w-3 h-3" />
        Use a different email
      </button>

      <div className="rounded-lg bg-accent/10 border border-accent/30 px-4 py-3">
        <div className="text-xs font-mono uppercase tracking-wider text-accent-glow mb-1">
          Verify your email
        </div>
        <div className="text-sm text-white/90">
          We sent a 6-digit code to <span className="font-mono">{email}</span>.
        </div>
      </div>

      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-white/60 mb-3">
          Enter code
        </label>
        <div className="flex gap-2 justify-between">
          {digits.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={d}
              onChange={(e) => setAt(i, e.target.value)}
              onKeyDown={(e) => onKeyDown(i, e)}
              onPaste={i === 0 ? onPaste : undefined}
              inputMode="numeric"
              pattern="\d*"
              maxLength={1}
              className="auth-input w-full aspect-square text-center text-2xl font-mono font-semibold rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-brand-glow/60 focus:bg-white/10 transition-colors"
              autoComplete="one-time-code"
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-red-500/15 border border-red-400/30 px-4 py-3 text-sm text-red-100">
          {error}
        </div>
      )}
      {resentMsg && (
        <div className="rounded-lg bg-accent/10 border border-accent/30 px-4 py-2 text-xs text-accent-glow">
          {resentMsg}
        </div>
      )}

      <button
        onClick={() => submit()}
        disabled={!filled || verifying}
        className={cn(
          "w-full py-3 rounded-lg font-medium text-white transition-all duration-200",
          "bg-brand hover:bg-brand-glow shadow-lg shadow-brand/20 hover:shadow-brand/40",
          "focus:outline-none focus:ring-2 focus:ring-brand-glow/60",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          "hover:-translate-y-0.5 disabled:transform-none"
        )}
      >
        {verifying ? (
          <span className="inline-flex items-center gap-2 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
            Verifying...
          </span>
        ) : (
          "Verify & continue"
        )}
      </button>

      <div className="text-center text-sm">
        <span className="text-white/50">Didn&apos;t get it? </span>
        <button
          onClick={resend}
          disabled={resending}
          className="text-brand-glow hover:text-white disabled:opacity-50"
        >
          {resending ? "Sending..." : "Resend code"}
        </button>
      </div>
    </div>
  );
}
