"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@insforge/sdk";
import { Loader2 } from "lucide-react";

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<CallbackLoading />}>
      <CallbackInner />
    </Suspense>
  );
}

function CallbackLoading() {
  return (
    <div className="dark-shell min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-brand-glow animate-spin" />
    </div>
  );
}

function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const code = params.get("insforge_code") ?? params.get("code");

    (async () => {
      const codeVerifier = sessionStorage.getItem("insforge_code_verifier") ?? undefined;

      const sdk = createClient({ baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL! });

      let accessToken: string | undefined;
      let userId: string | undefined;
      let userEmail: string | undefined;

      // Path A: code present in URL → manual exchange (the happy first-load path).
      if (code) {
        const { data, error: exErr } = await sdk.auth.exchangeOAuthCode(
          code,
          codeVerifier
        );
        if (data?.accessToken && data.user) {
          accessToken = data.accessToken;
          userId = data.user.id;
          userEmail = data.user.email;
        } else if (exErr) {
          // Most common cause: SDK already auto-exchanged this code on init,
          // so a second exchange returns "already used". Fall through to the
          // refreshSession path which works against the SDK's existing
          // httpOnly cookie.
          console.debug("Direct exchange failed, falling back:", exErr.message);
        }
      }

      // Path B: SDK already has a session cookie → refresh to grab a fresh
      // access token without burning the (already-spent) OAuth code.
      if (!accessToken) {
        const { data: rs } = await sdk.auth.refreshSession();
        if (rs?.accessToken && rs.user) {
          accessToken = rs.accessToken;
          userId = rs.user.id;
          userEmail = rs.user.email;
        }
      }

      // Path C: still nothing → show the real error.
      if (!accessToken || !userId || !userEmail) {
        if (!cancelled) setError("Could not finalize OAuth session. Try signing in again.");
        return;
      }

      // Bridge SDK session → our httpOnly `wan_session` cookie + mirror to public.users.
      sessionStorage.removeItem("insforge_code_verifier");

      const res = await fetch("/api/auth/oauth-complete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          accessToken,
          user: { id: userId, email: userEmail },
        }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        if (!cancelled) setError(j.error ?? "Failed to finalize login");
        return;
      }

      if (!cancelled) {
        router.replace("/dashboard");
        router.refresh();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params, router]);

  return (
    <div className="dark-shell min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-4 max-w-sm">
        {error ? (
          <>
            <div className="font-mono text-xs uppercase tracking-wider text-red-300">
              OAuth failed
            </div>
            <div className="text-sm text-ink-dim">{error}</div>
            <a href="/login" className="btn btn-ghost text-sm">
              Back to sign in
            </a>
          </>
        ) : (
          <>
            <Loader2 className="w-8 h-8 text-brand-glow animate-spin mx-auto" />
            <div className="font-mono text-xs uppercase tracking-wider text-ink-dim">
              Finalizing sign in...
            </div>
          </>
        )}
      </div>
    </div>
  );
}
