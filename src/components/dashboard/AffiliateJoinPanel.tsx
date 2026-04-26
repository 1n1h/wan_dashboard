"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, Coins, TrendingUp, Users, Shield } from "lucide-react";

const PERKS = [
  {
    icon: Coins,
    title: "25% recurring commission",
    text: "On every paid month from users you refer, for the first 12 months. No cap on referrals.",
  },
  {
    icon: TrendingUp,
    title: "30-day attribution window",
    text: "Cookie sticks for a month. If your reader signs up two weeks later, you still get credit.",
  },
  {
    icon: Users,
    title: "Real-time dashboard",
    text: "Track clicks, signups, paying users, and earnings — updated live.",
  },
  {
    icon: Shield,
    title: "Marketing materials included",
    text: "Pre-written copy, banner assets, prompt suggestions, demo videos. Plug-and-play.",
  },
];

export function AffiliateJoinPanel() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function join() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/affiliate/join", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-10">
      <div className="text-center">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-amber-300 mb-3">
          — Affiliate program
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Earn 25% recurring.
          <br />
          <span className="text-amber-300">Forever.</span>
        </h1>
        <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
          Share Wan with creators, agencies, and indie hackers. We pay you a
          quarter of every paid month they stay subscribed for the first year.
          One link, lifetime credit.
        </p>
      </div>

      {/* Earnings preview */}
      <div className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.07] to-transparent p-8">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-300 mb-3">
          Quick math
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <Calc users="10" tier="Pro ($59)" earn="$148" />
          <Calc users="50" tier="Pro ($59)" earn="$738" />
          <Calc users="200" tier="Pro ($59)" earn="$2,950" />
        </div>
        <div className="mt-4 text-xs font-mono text-white/40 text-center">
          monthly · at 25% recurring · refers stay 12 months on avg
        </div>
      </div>

      {/* Perks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {PERKS.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.title}
              className="rounded-2xl surface-raised p-5 hover:border-amber-500/30 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-4">
                <Icon className="w-4 h-4 text-amber-300" />
              </div>
              <div className="font-medium text-white mb-1">{p.title}</div>
              <div className="text-xs text-white/60 leading-relaxed">{p.text}</div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="text-center pt-6">
        <button
          onClick={join}
          disabled={busy}
          className="btn btn-primary px-8 py-3"
        >
          {busy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Provisioning...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Join the program
            </>
          )}
        </button>
        {error && (
          <div className="mt-3 text-sm text-red-300 font-mono">{error}</div>
        )}
        <div className="mt-4 text-xs font-mono text-white/35">
          You&apos;ll get a unique referral link the moment you join.
        </div>
      </div>
    </div>
  );
}

function Calc({
  users,
  tier,
  earn,
}: {
  users: string;
  tier: string;
  earn: string;
}) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-wider text-white/45 mb-1">
        {users} referred users on {tier}
      </div>
      <div className="font-display text-3xl font-bold text-amber-300">
        {earn}/mo
      </div>
    </div>
  );
}
