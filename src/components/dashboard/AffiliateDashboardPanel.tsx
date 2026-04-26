"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Coins,
  Copy,
  Check,
  TrendingUp,
  MousePointerClick,
  UserCheck,
  ExternalLink,
  Megaphone,
} from "lucide-react";
import type { Affiliate } from "@/types";
import { cn } from "@/lib/utils";

type Conversion = {
  id: string;
  conversion_type: string;
  amount_cents: number;
  commission_cents: number;
  status: string;
  created_at: string;
};

export function AffiliateDashboardPanel({
  affiliate,
  clicks,
  conversions,
}: {
  affiliate: Affiliate;
  clicks: number;
  conversions: Conversion[];
}) {
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const link = origin ? `${origin}/?ref=${affiliate.code}` : "";
  const signups = conversions.filter((c) => c.conversion_type === "signup").length;
  const purchases = conversions.filter(
    (c) => c.conversion_type === "first_purchase" || c.conversion_type === "subscription"
  ).length;
  const earnedCents = affiliate.total_earned_cents;
  const owedCents = earnedCents - affiliate.total_paid_cents;

  function copyLink() {
    if (!link) return;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-amber-300 mb-2">
            — Affiliate
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
            Your dashboard
          </h1>
          <p className="text-sm text-white/55 mt-2">
            {affiliate.commission_rate}% recurring · 30-day cookie · paying out monthly
          </p>
        </div>
        <Link
          href="/dashboard/affiliate/marketing"
          className="btn-glass text-sm"
        >
          <Megaphone className="w-3.5 h-3.5" />
          Marketing materials
        </Link>
      </div>

      {/* Referral link */}
      <section className="rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.06] to-transparent p-6">
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-amber-300 mb-3">
          Your link
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-1 min-w-[260px] rounded-lg bg-black/40 border border-white/10 px-4 py-3 font-mono text-sm text-white truncate">
            {link || "Loading..."}
          </div>
          <button
            onClick={copyLink}
            disabled={!link}
            className={cn(
              "btn text-sm",
              copied ? "btn-ghost" : "btn-primary"
            )}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy link
              </>
            )}
          </button>
          <a
            href={link || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-glass text-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Preview
          </a>
        </div>
        <div className="mt-3 text-xs text-white/45">
          Code: <span className="text-white/85 font-mono">{affiliate.code}</span> ·
          Anyone who lands on Wan via this link gets attributed to you for 30 days.
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat
          label="Clicks"
          value={clicks.toLocaleString()}
          icon={MousePointerClick}
        />
        <Stat
          label="Signups"
          value={signups.toLocaleString()}
          icon={UserCheck}
          sub={
            clicks > 0
              ? `${((signups / clicks) * 100).toFixed(1)}% conv`
              : ""
          }
        />
        <Stat
          label="Paying users"
          value={purchases.toLocaleString()}
          icon={TrendingUp}
        />
        <Stat
          label="Earned"
          value={`$${(earnedCents / 100).toFixed(2)}`}
          icon={Coins}
          sub={`$${(owedCents / 100).toFixed(2)} pending payout`}
          accent="text-amber-300"
        />
      </section>

      {/* Recent conversions */}
      <section>
        <div className="font-mono text-[10px] uppercase tracking-wider text-white/40 mb-3">
          Recent activity
        </div>
        <div className="rounded-2xl surface-raised overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-white/[0.02] border-b border-white/[0.06]">
              <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-white/45">
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3 text-right">Sale</th>
                <th className="px-4 py-3 text-right">Your cut</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {conversions.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-white/40">
                    No referrals yet. Share your link to get started.
                  </td>
                </tr>
              )}
              {conversions.map((c) => (
                <tr key={c.id} className="border-b border-white/[0.04]">
                  <td className="px-4 py-3 text-white/55 font-mono text-xs">
                    {new Date(c.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-white/85">
                    {c.conversion_type.replace(/_/g, " ")}
                  </td>
                  <td className="px-4 py-3 text-right text-white/85 font-mono">
                    ${(c.amount_cents / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right text-amber-300 font-mono">
                    ${(c.commission_cents / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <StatusChip status={c.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Payout */}
      <section className="rounded-2xl surface-raised p-6">
        <div className="font-display text-lg text-white mb-2">Get paid</div>
        <div className="text-sm text-white/55 mb-4">
          Payouts run on the 1st of each month for any balance over $50. Stripe
          Connect onboarding launches alongside billing — for now, your earnings
          accrue and we&apos;ll port them to your account when payouts go live.
        </div>
        <div className="text-xs font-mono text-white/35">
          Owed: <span className="text-amber-300">${(owedCents / 100).toFixed(2)}</span>
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  sub,
  accent,
}: {
  label: string;
  value: string;
  icon: typeof Coins;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl surface-raised p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-white/45">
          {label}
        </div>
        <Icon className={cn("w-4 h-4", accent ?? "text-white/55")} />
      </div>
      <div
        className={cn(
          "font-display text-2xl font-bold",
          accent ?? "text-white"
        )}
      >
        {value}
      </div>
      {sub && <div className="text-xs text-white/55 mt-1">{sub}</div>}
    </div>
  );
}

function StatusChip({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-500/15 border-amber-500/30 text-amber-200",
    approved: "bg-cyan-500/15 border-cyan-500/30 text-cyan-200",
    paid: "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
    reversed: "bg-red-500/15 border-red-500/30 text-red-200",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-mono uppercase tracking-wider",
        styles[status] ?? styles.pending
      )}
    >
      {status}
    </span>
  );
}
