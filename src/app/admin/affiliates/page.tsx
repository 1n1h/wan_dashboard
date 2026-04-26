import { getInsforgeServer } from "@/lib/insforge";
import type { Affiliate } from "@/types";
import { Coins, MousePointerClick, UserCheck } from "lucide-react";

export default async function AdminAffiliatesPage() {
  const sdk = await getInsforgeServer();

  const [{ data: affs }, { data: clicks }, { data: convs }] = await Promise.all([
    sdk.database.from("affiliates").select("*").order("created_at", { ascending: false }),
    sdk.database.from("affiliate_clicks").select("affiliate_id"),
    sdk.database.from("affiliate_conversions").select("affiliate_id, status, commission_cents"),
  ]);

  const affiliates = (affs ?? []) as Affiliate[];
  const clickCount = new Map<string, number>();
  for (const c of (clicks ?? []) as Array<{ affiliate_id: string }>) {
    clickCount.set(c.affiliate_id, (clickCount.get(c.affiliate_id) ?? 0) + 1);
  }
  const convCount = new Map<string, number>();
  const earningsCents = new Map<string, number>();
  for (const c of (convs ?? []) as Array<{
    affiliate_id: string;
    status: string;
    commission_cents: number;
  }>) {
    convCount.set(c.affiliate_id, (convCount.get(c.affiliate_id) ?? 0) + 1);
    if (c.status === "approved" || c.status === "paid") {
      earningsCents.set(
        c.affiliate_id,
        (earningsCents.get(c.affiliate_id) ?? 0) + c.commission_cents
      );
    }
  }

  const totalClicks = (clicks ?? []).length;
  const totalConversions = (convs ?? []).length;
  const totalPayoutCents = affiliates.reduce(
    (s, a) => s + a.total_paid_cents,
    0
  );
  const totalOwedCents = affiliates.reduce(
    (s, a) => s + (a.total_earned_cents - a.total_paid_cents),
    0
  );

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
      <div>
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-amber-300 mb-2">
          — Admin · Affiliates
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Affiliate program
        </h1>
        <p className="text-sm text-white/55 mt-2">
          {affiliates.length} {affiliates.length === 1 ? "affiliate" : "affiliates"} ·
          {" "}{totalClicks} clicks · {totalConversions} conversions
        </p>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiTile
          label="Affiliates"
          value={affiliates.length.toString()}
          icon={UserCheck}
        />
        <KpiTile
          label="Clicks (all time)"
          value={totalClicks.toLocaleString()}
          icon={MousePointerClick}
        />
        <KpiTile
          label="Owed to affiliates"
          value={`$${(totalOwedCents / 100).toFixed(2)}`}
          icon={Coins}
        />
        <KpiTile
          label="Paid out"
          value={`$${(totalPayoutCents / 100).toFixed(2)}`}
          icon={Coins}
        />
      </section>

      <div className="rounded-2xl surface-raised overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[680px]">
          <thead className="bg-white/[0.02] border-b border-white/[0.06]">
            <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-white/45">
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Rate</th>
              <th className="px-4 py-3 text-right">Clicks</th>
              <th className="px-4 py-3 text-right">Conversions</th>
              <th className="px-4 py-3 text-right">Earned</th>
            </tr>
          </thead>
          <tbody>
            {affiliates.map((a) => (
              <tr key={a.id} className="border-b border-white/[0.04]">
                <td className="px-4 py-3 font-mono text-xs text-white">{a.code}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-mono uppercase tracking-wider bg-emerald-500/15 border-emerald-500/30 text-emerald-200">
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-white/85 font-mono">
                  {a.commission_rate}%
                </td>
                <td className="px-4 py-3 text-right text-white/85 font-mono">
                  {clickCount.get(a.id) ?? 0}
                </td>
                <td className="px-4 py-3 text-right text-white/85 font-mono">
                  {convCount.get(a.id) ?? 0}
                </td>
                <td className="px-4 py-3 text-right text-amber-300 font-mono">
                  ${((earningsCents.get(a.id) ?? 0) / 100).toFixed(2)}
                </td>
              </tr>
            ))}
            {affiliates.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-white/40">
                  No affiliates yet. Share /affiliate to recruit.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KpiTile({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Coins;
}) {
  return (
    <div className="rounded-2xl surface-raised p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] font-mono uppercase tracking-wider text-white/45">
          {label}
        </div>
        <Icon className="w-4 h-4 text-amber-300" />
      </div>
      <div className="font-display text-2xl font-bold text-white">{value}</div>
    </div>
  );
}
