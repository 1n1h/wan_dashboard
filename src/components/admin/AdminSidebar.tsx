"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  LayoutDashboard,
  Users as UsersIcon,
  Sparkles,
  ShieldCheck,
  Coins,
  Megaphone,
  Menu,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AdminRole } from "@/types";

const NAV: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: UsersIcon },
  { label: "Generations", href: "/admin/generations", icon: Sparkles },
  { label: "Revenue", href: "/admin/revenue", icon: Coins },
  { label: "Affiliates", href: "/admin/affiliates", icon: Megaphone },
  { label: "Admins", href: "/admin/admins", icon: ShieldCheck },
];

const ROLE_LABEL: Record<AdminRole, string> = {
  owner: "Owner",
  edit: "Editor",
  view: "Viewer",
};

const ROLE_TINT: Record<AdminRole, string> = {
  owner: "bg-amber-500/15 border-amber-500/30 text-amber-200",
  edit: "bg-cyan-500/15 border-cyan-500/30 text-cyan-200",
  view: "bg-zinc-500/15 border-zinc-500/30 text-zinc-200",
};

export function AdminSidebar({ role }: { role: AdminRole }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);
  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3.5 left-3 z-40 w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 backdrop-blur-md flex items-center justify-center text-amber-200 hover:bg-amber-500/25"
        aria-label="Open admin navigation"
      >
        <Menu className="w-4 h-4" />
      </button>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "flex flex-col w-60 shrink-0 border-r border-amber-500/20 backdrop-blur-md",
          "hidden lg:flex bg-amber-500/[0.02]",
          mobileOpen &&
            "!flex fixed top-0 bottom-0 left-0 z-50 bg-zinc-950/95 backdrop-blur-xl"
        )}
      >
        <div className="p-5 border-b border-amber-500/20">
          <div className="flex items-center justify-between mb-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
                <span className="font-display font-bold text-white text-sm">W</span>
              </div>
              <span className="font-display font-semibold tracking-tight text-lg text-white">
                wan<span className="text-brand-glow">.</span>
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="lg:hidden w-8 h-8 rounded-lg hover:bg-white/[0.05] flex items-center justify-center text-white/55 hover:text-white"
              aria-label="Close navigation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div
            className={cn(
              "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-mono uppercase tracking-wider",
              ROLE_TINT[role]
            )}
          >
            <span>Admin</span>
            <span className="opacity-60">·</span>
            <span>{ROLE_LABEL[role]}</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                  active
                    ? "bg-amber-500/15 text-white border border-amber-500/30"
                    : "text-white/60 hover:bg-white/[0.04] hover:text-white border border-transparent"
                )}
              >
                <Icon
                  className={cn("w-4 h-4", active ? "text-amber-300" : "")}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-amber-500/20">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono uppercase tracking-wider text-white/55 hover:text-white hover:bg-white/[0.04] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to app
          </Link>
        </div>
      </aside>
    </>
  );
}
