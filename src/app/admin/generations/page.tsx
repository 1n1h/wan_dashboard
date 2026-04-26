import { getInsforgeServer } from "@/lib/insforge";
import type { VideoGeneration } from "@/types";

export default async function AdminGenerationsPage() {
  const sdk = await getInsforgeServer();
  const { data } = await sdk.database
    .from("video_generations")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const gens = (data ?? []) as VideoGeneration[];
  const completed = gens.filter((g) => g.status === "completed").length;
  const failed = gens.filter((g) => g.status === "failed").length;
  const inflight = gens.filter(
    (g) => g.status === "pending" || g.status === "processing"
  ).length;

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-6">
      <div>
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-amber-300 mb-2">
          — Admin · Generations
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          {gens.length} recent generations
        </h1>
        <p className="text-sm text-white/55 mt-2">
          {completed} completed · {failed} failed · {inflight} in flight
        </p>
      </div>

      <div className="rounded-2xl surface-raised overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead className="bg-white/[0.02] border-b border-white/[0.06]">
            <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-white/45">
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3">Feature</th>
              <th className="px-4 py-3">Model</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Credits</th>
              <th className="px-4 py-3 text-right">Time</th>
            </tr>
          </thead>
          <tbody>
            {gens.map((g) => (
              <tr key={g.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-white/65 font-mono text-xs">
                  {new Date(g.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-white/85">
                  {g.feature_type}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-white/65 truncate max-w-[200px]">
                  {g.model_used}
                </td>
                <td className="px-4 py-3">
                  <StatusChip status={g.status} />
                </td>
                <td className="px-4 py-3 text-right text-amber-300 font-mono">
                  {g.credits_used ?? "—"}
                </td>
                <td className="px-4 py-3 text-right text-white/55 font-mono text-xs">
                  {g.processing_time_seconds ? `${g.processing_time_seconds}s` : "—"}
                </td>
              </tr>
            ))}
            {gens.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-white/40">
                  No generations yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusChip({ status }: { status: VideoGeneration["status"] }) {
  const styles = {
    completed: "bg-emerald-500/15 border-emerald-500/30 text-emerald-200",
    failed: "bg-red-500/15 border-red-500/30 text-red-200",
    pending: "bg-amber-500/15 border-amber-500/30 text-amber-200",
    processing: "bg-amber-500/15 border-amber-500/30 text-amber-200",
  } as const;
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10px] font-mono uppercase tracking-wider ${styles[status]}`}
    >
      {status}
    </span>
  );
}
