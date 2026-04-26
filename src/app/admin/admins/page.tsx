import { getInsforgeServer } from "@/lib/insforge";
import { getSessionUser } from "@/lib/session";
import type { AdminGrant } from "@/types";
import { ManageAdmins } from "@/components/admin/ManageAdmins";

export default async function AdminAdminsPage() {
  const me = await getSessionUser();
  const sdk = await getInsforgeServer();

  const { data } = await sdk.database
    .from("admins")
    .select("*")
    .order("created_at", { ascending: true });

  const admins = (data ?? []) as AdminGrant[];

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-6">
      <div>
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-amber-300 mb-2">
          — Admin · Team
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Admins
        </h1>
        <p className="text-sm text-white/55 mt-2">
          {admins.length} {admins.length === 1 ? "admin" : "admins"}. Roles:
          <span className="text-amber-200"> owner</span> can do everything,
          <span className="text-cyan-200"> editor</span> can change data,
          <span className="text-zinc-200"> viewer</span> reads only.
        </p>
      </div>

      <ManageAdmins admins={admins} myRole={me!.admin_role!} myId={me!.id} />
    </div>
  );
}
