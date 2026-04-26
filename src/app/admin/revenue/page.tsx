import { Coins, TrendingUp, AlertCircle } from "lucide-react";

export default function AdminRevenuePage() {
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-6">
      <div>
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-amber-300 mb-2">
          — Admin · Revenue
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Revenue
        </h1>
      </div>

      <div className="rounded-2xl surface-raised p-8 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-amber-300" />
        </div>
        <h2 className="font-display text-xl text-white mb-2">
          Stripe not connected yet
        </h2>
        <p className="text-sm text-white/55 max-w-md mx-auto leading-relaxed">
          Once Stripe is wired up (subscriptions + credit packs), this page
          shows MRR, ARR, churn, LTV, refunds, and per-tier revenue cohorts.
          The DB schema is ready — `credit_purchases` table is live.
        </p>
      </div>

      {/* Placeholder layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 opacity-40 pointer-events-none">
        <div className="rounded-2xl surface-raised p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-white/45">
              MRR
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-300" />
          </div>
          <div className="font-display text-3xl font-bold text-white">$0</div>
          <div className="text-xs text-white/55 mt-1">Stripe pending</div>
        </div>
        <div className="rounded-2xl surface-raised p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-white/45">
              Credit pack revenue
            </div>
            <Coins className="w-4 h-4 text-amber-300" />
          </div>
          <div className="font-display text-3xl font-bold text-white">$0</div>
          <div className="text-xs text-white/55 mt-1">Stripe pending</div>
        </div>
        <div className="rounded-2xl surface-raised p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] font-mono uppercase tracking-wider text-white/45">
              Churn
            </div>
          </div>
          <div className="font-display text-3xl font-bold text-white">—</div>
          <div className="text-xs text-white/55 mt-1">Stripe pending</div>
        </div>
      </div>
    </div>
  );
}
