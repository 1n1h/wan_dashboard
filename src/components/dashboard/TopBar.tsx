import Link from "next/link";
import { Coins } from "lucide-react";
import type { User, AdminRole } from "@/types";
import { UserMenu } from "@/components/dashboard/UserMenu";

export function TopBar({
  user,
}: {
  user: {
    email: string;
    tier: User["tier"];
    credits_remaining: number;
    avatar_url: string | null;
    admin_role?: AdminRole | null;
  } | null;
}) {
  return (
    <header className="relative z-30 h-16 border-b border-white/[0.06] bg-white/[0.015] backdrop-blur-md flex items-center justify-between pl-16 pr-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-3 text-xs font-mono text-white/35 uppercase tracking-wider min-w-0">
        <span className="hidden sm:inline">workspace</span>
        <span className="hidden sm:inline">/</span>
        <span className="text-white/55 normal-case truncate">{user?.email ?? "guest"}</span>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/billing"
          className="flex items-center gap-2 px-3 py-1.5 rounded-full surface surface-hover transition-all"
          title="View billing & credits"
        >
          <Coins className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-sm font-mono">
            <span className="text-white">
              {(user?.credits_remaining ?? 0).toLocaleString()}
            </span>
            <span className="text-white/40"> credits</span>
          </span>
        </Link>

        <UserMenu user={user} />
      </div>
    </header>
  );
}
