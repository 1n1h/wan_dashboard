"use client";

import { useState } from "react";
import { Loader2, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Body =
  | { kind: "subscription"; plan: "starter" | "pro" }
  | { kind: "credit_pack"; pack: "pack-100" | "pack-500" | "pack-1000" | "pack-2500" };

export function CheckoutButton({
  body,
  children,
  className,
  disabled,
}: {
  body: Body;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Missing checkout URL");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={go}
        disabled={disabled || busy}
        className={cn(className, busy && "opacity-70 cursor-not-allowed")}
      >
        {busy ? (
          <span className="inline-flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
      {error && (
        <div className="mt-1 text-[10px] font-mono text-red-300">{error}</div>
      )}
    </>
  );
}

// Convenience wrapper for plan upgrade buttons
export function UpgradeButton({
  plan,
  isCurrent,
  isPro,
}: {
  plan: "starter" | "pro" | "free" | "enterprise";
  isCurrent: boolean;
  isPro: boolean;
}) {
  if (plan === "free" || plan === "enterprise" || isCurrent) {
    return (
      <button
        disabled
        className={cn(
          "btn text-sm w-full",
          "border border-white/[0.08] text-white/40 cursor-default"
        )}
      >
        {isCurrent
          ? "Active"
          : plan === "free"
          ? "Free forever"
          : "Contact sales"}
      </button>
    );
  }

  return (
    <CheckoutButton
      body={{ kind: "subscription", plan }}
      className={cn(
        "btn text-sm w-full inline-flex items-center justify-center gap-2",
        isPro ? "btn-primary" : "btn-ghost"
      )}
    >
      <span>Upgrade</span>
      <ArrowUpRight className="w-3.5 h-3.5" />
    </CheckoutButton>
  );
}
