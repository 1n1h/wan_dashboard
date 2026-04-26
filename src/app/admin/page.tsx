import { getInsforgeServer } from "@/lib/insforge";
import {
  Users as UsersIcon,
  Sparkles,
  Coins,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const REPLICATE_USD_PER_DAY_BUDGET = 10; // soft warning if daily Replicate spend exceeds this

export default async function AdminOverview() {
  const sdk = await getInsforgeServer();
  const stats = await loadStats(sdk);

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-10">
      <div>
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-amber-300 mb-2">
          — Admin · Overview
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          Business at a glance
        </h1>
        <p className="text-sm text-white/55 mt-2">
          Live numbers from your InsForge database. Updated in real time.
        </p>
      </div>

      {/* KPI tiles */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiTile
          label="Total signups"
          value={stats.totalUsers.toLocaleString()}
          delta={`+${stats.signups7d} this week`}
          icon={UsersIcon}
          accent="text-cyan-300"
        />
        <KpiTile
          label="Paid users"
          value={stats.paidUsers.toLocaleString()}
          delta={`${stats.paidPct.toFixed(1)}% conversion`}
          icon={TrendingUp}
          accent="text-emerald-300"
        />
        <KpiTile
          label="Generations (all time)"
          value={stats.totalGenerations.toLocaleString()}
          delta={`${stats.generations7d} this week`}
          icon={Sparkles}
          accent="text-brand-glow"
        />
        <KpiTile
          label="Credits used (all time)"
          value={stats.totalCreditsUsed.toLocaleString()}
          delta={`${stats.credits7d.toLocaleString()} this week`}
          icon={Coins}
          accent="text-amber-300"
        />
      </section>

      {/* Cost row */}
      <section>
        <div className="font-mono text-[10px] uppercase tracking-wider text-white/40 mb-3">
          Cost & profit
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <CostTile
            label="Replicate spend (est.)"
            usd={stats.replicateSpendUsd}
            sub="from completed generations"
            warn={stats.replicateSpend7dUsd > REPLICATE_USD_PER_DAY_BUDGET * 7}
          />
          <CostTile
            label="Credits sold revenue"
            usd={stats.creditRevenueUsd}
            sub="placeholder — wires up with Stripe"
          />
          <CostTile
            label="Net (revenue − cost)"
            usd={stats.creditRevenueUsd - stats.replicateSpendUsd}
            sub={
              stats.creditRevenueUsd - stats.replicateSpendUsd >= 0
                ? "in the green"
                : "burning compute"
            }
          />
        </div>
      </section>

      {/* Health signals */}
      <section>
        <div className="font-mono text-[10px] uppercase tracking-wider text-white/40 mb-3">
          Signals
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SignalCard
            label="Generation failure rate"
            value={`${stats.failurePct.toFixed(1)}%`}
            ok={stats.failurePct < 5}
            note={
              stats.failurePct < 5
                ? "Healthy — most renders complete."
                : "High — investigate which model is failing."
            }
          />
          <SignalCard
            label="Churn proxy"
            value={`${stats.dormantPct.toFixed(1)}%`}
            ok={stats.dormantPct < 40}
            note={
              stats.dormantPct < 40
                ? "Most signups remain active."
                : "Many users haven't generated anything yet."
            }
          />
        </div>
      </section>

      {/* Tier breakdown */}
      <section>
        <div className="font-mono text-[10px] uppercase tracking-wider text-white/40 mb-3">
          Tier distribution
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(["free", "starter", "pro", "enterprise"] as const).map((t) => (
            <div key={t} className="rounded-xl surface p-4">
              <div className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1">
                {t}
              </div>
              <div className="font-display text-2xl text-white">
                {stats.tierCounts[t] ?? 0}
              </div>
              <div className="text-xs text-white/55 mt-1">
                {stats.totalUsers > 0
                  ? (((stats.tierCounts[t] ?? 0) / stats.totalUsers) * 100).toFixed(
                      0
                    ) + "%"
                  : "—"}{" "}
                of total
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="text-center text-xs font-mono text-white/30">
        Stripe integration adds: MRR, ARR, real churn, LTV, cohort retention.
      </p>
    </div>
  );
}

// ─── Tiles ──────────────────────────────────────────────────────────────────

function KpiTile({
  label,
  value,
  delta,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  delta: string;
  icon: LucideIcon;
  accent: string;
}) {
  return (
    <div className="rounded-2xl surface-raised p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] font-mono uppercase tracking-wider text-white/45">
          {label}
        </div>
        <Icon className={`w-4 h-4 ${accent}`} />
      </div>
      <div className="font-display text-3xl font-bold text-white">{value}</div>
      <div className="text-xs text-white/55 mt-1">{delta}</div>
    </div>
  );
}

function CostTile({
  label,
  usd,
  sub,
  warn,
}: {
  label: string;
  usd: number;
  sub: string;
  warn?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 ${
        warn
          ? "bg-amber-500/[0.06] border border-amber-500/30"
          : "surface-raised"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-white/45">
          {label}
        </div>
        {warn && <AlertTriangle className="w-4 h-4 text-amber-300" />}
      </div>
      <div className="font-display text-3xl font-bold text-white">
        ${usd.toFixed(2)}
      </div>
      <div className="text-xs text-white/55 mt-1">{sub}</div>
    </div>
  );
}

function SignalCard({
  label,
  value,
  ok,
  note,
}: {
  label: string;
  value: string;
  ok: boolean;
  note: string;
}) {
  return (
    <div
      className={`rounded-2xl p-5 ${
        ok ? "surface-raised" : "bg-amber-500/[0.06] border border-amber-500/30"
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-white/45">
          {label}
        </div>
        {ok ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-amber-300" />
        )}
      </div>
      <div className="font-display text-2xl text-white">{value}</div>
      <div className="text-xs text-white/55 mt-1">{note}</div>
    </div>
  );
}

// ─── Data ───────────────────────────────────────────────────────────────────

type Stats = {
  totalUsers: number;
  signups7d: number;
  paidUsers: number;
  paidPct: number;
  totalGenerations: number;
  generations7d: number;
  totalCreditsUsed: number;
  credits7d: number;
  replicateSpendUsd: number;
  replicateSpend7dUsd: number;
  creditRevenueUsd: number;
  failurePct: number;
  dormantPct: number;
  tierCounts: Record<string, number>;
};

async function loadStats(
  sdk: Awaited<ReturnType<typeof getInsforgeServer>>
): Promise<Stats> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ data: users }, { data: gens }] = await Promise.all([
    sdk.database.from("users").select("*"),
    sdk.database.from("video_generations").select("*"),
  ]);

  const userRows = (users ?? []) as Array<{
    id: string;
    tier: string;
    created_at: string;
  }>;
  const genRows = (gens ?? []) as Array<{
    user_id: string;
    status: string;
    credits_used: number | null;
    created_at: string;
  }>;

  const totalUsers = userRows.length;
  const signups7d = userRows.filter((u) => u.created_at > sevenDaysAgo).length;
  const paidUsers = userRows.filter((u) => u.tier !== "free").length;
  const paidPct = totalUsers ? (paidUsers / totalUsers) * 100 : 0;

  const totalGenerations = genRows.length;
  const generations7d = genRows.filter((g) => g.created_at > sevenDaysAgo).length;

  const completedGens = genRows.filter((g) => g.status === "completed");
  const totalCreditsUsed = completedGens.reduce(
    (sum, g) => sum + (g.credits_used ?? 0),
    0
  );
  const credits7d = completedGens
    .filter((g) => g.created_at > sevenDaysAgo)
    .reduce((sum, g) => sum + (g.credits_used ?? 0), 0);

  // Crude Replicate cost estimate: 1 credit = $0.01 of compute at our markup
  // (markup factor is 0.5 in credits.ts), so each credit ≈ $0.02 actual cost.
  const replicateSpendUsd = (totalCreditsUsed * 0.02);
  const replicateSpend7dUsd = (credits7d * 0.02);

  // Revenue placeholder — Stripe wires this up.
  const creditRevenueUsd = 0;

  const failed = genRows.filter((g) => g.status === "failed").length;
  const failurePct = totalGenerations ? (failed / totalGenerations) * 100 : 0;

  // Dormant proxy = users with zero completed generations.
  const usersWithGens = new Set(completedGens.map((g) => g.user_id));
  const dormant = userRows.filter((u) => !usersWithGens.has(u.id)).length;
  const dormantPct = totalUsers ? (dormant / totalUsers) * 100 : 0;

  const tierCounts: Record<string, number> = {};
  for (const u of userRows) {
    tierCounts[u.tier] = (tierCounts[u.tier] ?? 0) + 1;
  }

  return {
    totalUsers,
    signups7d,
    paidUsers,
    paidPct,
    totalGenerations,
    generations7d,
    totalCreditsUsed,
    credits7d,
    replicateSpendUsd,
    replicateSpend7dUsd,
    creditRevenueUsd,
    failurePct,
    dormantPct,
    tierCounts,
  };
}
