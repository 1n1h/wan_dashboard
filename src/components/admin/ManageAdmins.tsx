"use client";

import { useState } from "react";
import { Plus, Trash2, ShieldCheck, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { AdminGrant, AdminRole } from "@/types";
import { cn } from "@/lib/utils";

const ROLE_TINT: Record<AdminRole, string> = {
  owner: "bg-amber-500/15 border-amber-500/30 text-amber-200",
  edit: "bg-cyan-500/15 border-cyan-500/30 text-cyan-200",
  view: "bg-zinc-500/15 border-zinc-500/30 text-zinc-200",
};

export function ManageAdmins({
  admins,
  myRole,
  myId,
}: {
  admins: AdminGrant[];
  myRole: AdminRole;
  myId: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("view");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Owners can do everything; editors can grant view/edit but not owner.
  const canManage = myRole === "owner" || myRole === "edit";
  const allowedRoles: AdminRole[] =
    myRole === "owner" ? ["owner", "edit", "view"] : ["edit", "view"];

  async function add() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setEmail("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function remove(adminId: string) {
    if (!confirm("Revoke admin access for this user?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/admins/${adminId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {canManage && (
        <div className="rounded-2xl surface-raised p-5">
          <div className="font-display text-lg text-white mb-1 flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-300" />
            Grant admin access
          </div>
          <div className="text-xs text-white/45 mb-4">
            User must already have an account on Wan with this email.
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px_120px] gap-2">
            <input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-amber-500/50 focus:bg-white/[0.05] transition-colors"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as AdminRole)}
              className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-sm text-white focus:outline-none focus:border-amber-500/50"
            >
              {allowedRoles.map((r) => (
                <option key={r} value={r} className="bg-zinc-900">
                  {r}
                </option>
              ))}
            </select>
            <button
              onClick={add}
              disabled={busy || !email.trim()}
              className="btn btn-primary text-sm"
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Grant"}
            </button>
          </div>
          {error && (
            <div className="mt-3 text-xs text-red-300 font-mono">{error}</div>
          )}
        </div>
      )}

      <div className="rounded-2xl surface-raised overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[560px]">
          <thead className="bg-white/[0.02] border-b border-white/[0.06]">
            <tr className="text-left text-[10px] font-mono uppercase tracking-wider text-white/45">
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Granted</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => {
              const isMe = a.user_id === myId;
              return (
                <tr key={a.id} className="border-b border-white/[0.04]">
                  <td className="px-4 py-3 text-white">
                    {a.email}
                    {isMe && (
                      <span className="ml-2 text-[10px] font-mono text-white/35 uppercase tracking-wider">
                        (you)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-mono uppercase tracking-wider",
                        ROLE_TINT[a.role]
                      )}
                    >
                      <ShieldCheck className="w-2.5 h-2.5" />
                      {a.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/55 font-mono text-xs">
                    {new Date(a.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {canManage && !isMe && a.role !== "owner" && (
                      <button
                        onClick={() => remove(a.id)}
                        disabled={busy}
                        className="text-white/55 hover:text-red-300 transition-colors disabled:opacity-50"
                        aria-label="Revoke"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
