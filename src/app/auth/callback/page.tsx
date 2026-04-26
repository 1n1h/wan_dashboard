"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
      if (!code) {
        if (!cancelled) {
          setError(
            "No `insforge_code` in the callback URL. The OAuth provider didn't return one — check the redirect URI is registered in your InsForge dashboard."
          );
        }
        return;
      }

      const codeVerifier =
        sessionStorage.getItem("insforge_code_verifier") ?? undefined;

      // Hand the code + codeVerifier to our own server, which exchanges
      // server-to-server with InsForge and sets a same-origin session cookie.
      // (Doing the exchange client-side fails on cross-domain deploys because
      // InsForge sets refresh cookies on insforge.app, not insforge.site.)
      try {
        const res = await fetch("/api/auth/oauth-exchange", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ code, codeVerifier }),
        });

        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          if (!cancelled) {
            setError(
              `OAuth exchange failed: ${
                j.error ?? `HTTP ${res.status}`
              }\n\n` +
                "If this keeps happening, double-check the OAuth provider's " +
                "redirect URI in your InsForge dashboard includes " +
                "https://u7xccims.insforge.site/auth/callback."
            );
          }
          return;
        }

        sessionStorage.removeItem("insforge_code_verifier");

        if (!cancelled) {
          router.replace("/dashboard");
          router.refresh();
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            `Network error during OAuth exchange: ${
              e instanceof Error ? e.message : String(e)
            }`
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params, router]);

  return (
    <div className="dark-shell min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-4 max-w-md">
        {error ? (
          <>
            <div className="font-mono text-xs uppercase tracking-wider text-red-300">
              OAuth failed
            </div>
            <div className="text-sm text-ink-dim whitespace-pre-line text-left">
              {error}
            </div>
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
