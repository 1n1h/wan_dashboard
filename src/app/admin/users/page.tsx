import { getInsforgeServer } from "@/lib/insforge";
import type { User } from "@/types";
import { Coins } from "lucide-react";

export default async function AdminUsersPage() {
  const sdk = await getInsforgeServer();
  const { data } = await sdk.database
    .from("users")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  const users = (data ?? []) as User[];

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-6">
      <div>
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-amber-300 mb-2">
          — Admin · Users
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {users.length} users
        </h1>
        <p className="text-sm text-white/55 mt-2">
          Showing 500 most recent. Sorted by signup date.
        </p>
      </div>

      <div className="rounded-2xl surface-raised overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-white/[0.02] border-b border-white/[0.06]">
            <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-white/45">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Credits</th>
              <th className="px-4 py-3">Signed up</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-b border-white/[0.04] hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3">
                  <div className="text-white truncate max-w-[280px]">{u.email}</div>
                  <div className="text-[10px] font-mono text-white/35 truncate max-w-[280px]">
                    {u.id}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <TierChip tier={u.tier} />
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center gap-1.5 text-amber-300 font-mono">
                    <Coins className="w-3 h-3" />
                    {u.credits_remaining}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/55 font-mono text-xs">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-white/40">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TierChip({ tier }: { tier: User["tier"] }) {
  const styles: Record<User["tier"], string> = {
    free: "bg-white/[0.04] border-white/10 text-white/65",
    starter: "bg-cyan-500/15 border-cyan-500/30 text-cyan-200",
    pro: "bg-brand/15 border-brand/30 text-brand-glow",
    enterprise: "bg-amber-500/15 border-amber-500/30 text-amber-200",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-mono uppercase tracking-wider ${styles[tier]}`}
    >
      {tier}
    </span>
  );
}
