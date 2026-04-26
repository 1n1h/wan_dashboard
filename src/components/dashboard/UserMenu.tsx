"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  Sparkles,
  User as UserIcon,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { User, AdminRole } from "@/types";

const TIER_LABEL: Record<User["tier"], string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  enterprise: "Enterprise",
};

export function UserMenu({
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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {}
    router.push("/login");
    router.refresh();
  }

  const initial = user?.email?.[0]?.toUpperCase() ?? "?";
  const tier = user?.tier ?? "free";
  const isUpgradable = tier === "free" || tier === "starter";
  const avatarUrl = user?.avatar_url ?? null;
  const isAdmin = !!user?.admin_role;

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 px-2 py-1 rounded-lg transition-colors",
          open ? "bg-white/[0.07]" : "hover:bg-white/[0.05]"
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar url={avatarUrl} initial={initial} size={28} />
        <div className="hidden sm:block text-left">
          <div className="text-xs text-white leading-tight max-w-[140px] truncate">
            {user?.email ?? "Sign in"}
          </div>
          <div className="text-[10px] font-mono uppercase text-white/40">
            {TIER_LABEL[tier]}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-white/40 transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] w-72 rounded-xl surface-menu shadow-[0_24px_64px_-16px_rgba(0,0,0,0.6)] py-2 z-50 animate-fade-in"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/[0.06]">
            <div className="flex items-center gap-3">
              <Avatar url={avatarUrl} initial={initial} size={40} />
              <div className="min-w-0 flex-1">
                <div className="text-sm text-white truncate">
                  {user?.email ?? "Guest"}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/10 text-white/70">
                    {TIER_LABEL[tier]}
                  </span>
                  <span className="text-[10px] font-mono text-white/45">
                    {user?.credits_remaining?.toLocaleString() ?? 0} credits
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Upgrade CTA (only when relevant) */}
          {isUpgradable && (
            <div className="px-2 pt-2">
              <Link
                href="/dashboard/billing"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gradient-to-r from-brand/20 to-accent/15 border border-brand/30 hover:border-brand/50 hover:from-brand/30 hover:to-accent/25 transition-all"
              >
                <Sparkles className="w-4 h-4 text-brand-glow" />
                <div className="flex-1">
                  <div className="text-xs font-medium text-white">
                    Upgrade to {tier === "free" ? "Starter" : "Pro"}
                  </div>
                  <div className="text-[10px] text-white/55">
                    More credits, higher resolution, all features
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Admin shortcut (only for admins) */}
          {isAdmin && (
            <div className="px-2 pt-2">
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 hover:border-amber-500/50 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <div className="flex-1">
                  <div className="text-xs font-medium text-amber-200">
                    Admin dashboard
                  </div>
                  <div className="text-[10px] text-amber-300/55 capitalize">
                    {user?.admin_role} access
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Items */}
          <nav className="px-2 py-2 space-y-0.5">
            <MenuItem
              href="/dashboard/billing"
              icon={CreditCard}
              label="Billing & credits"
              hint="Add credits"
              onClick={() => setOpen(false)}
            />
            <MenuItem
              href="/dashboard/settings"
              icon={UserIcon}
              label="Account settings"
              onClick={() => setOpen(false)}
            />
            <MenuItem
              href="/dashboard/settings#preferences"
              icon={Settings}
              label="Preferences"
              onClick={() => setOpen(false)}
            />
            <MenuItem
              href="/dashboard/help"
              icon={HelpCircle}
              label="Help & docs"
              onClick={() => setOpen(false)}
            />
          </nav>

          <div className="border-t border-white/[0.06] mt-1 pt-1 px-2">
            <button
              onClick={signOut}
              disabled={signingOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/85 hover:bg-white/[0.05] hover:text-white transition-colors disabled:opacity-60"
              role="menuitem"
            >
              <LogOut className="w-4 h-4 text-white/55" />
              <span className="flex-1 text-left">
                {signingOut ? "Signing out..." : "Sign out"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Avatar({
  url,
  initial,
  size,
}: {
  url: string | null;
  initial: string;
  size: number;
}) {
  const [errored, setErrored] = useState(false);
  const showImage = !!url && !errored;

  return (
    <div
      className="rounded-full bg-brand-gradient flex items-center justify-center font-bold text-white shrink-0 overflow-hidden ring-1 ring-white/10"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, size * 0.42),
      }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt="Avatar"
          className="w-full h-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        initial
      )}
    </div>
  );
}

function MenuItem({
  href,
  icon: Icon,
  label,
  hint,
  onClick,
}: {
  href: string;
  icon: typeof CreditCard;
  label: string;
  hint?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/85 hover:bg-white/[0.05] hover:text-white transition-colors"
      role="menuitem"
    >
      <Icon className="w-4 h-4 text-white/55" />
      <span className="flex-1">{label}</span>
      {hint && (
        <span className="text-[10px] font-mono uppercase tracking-wider text-white/40">
          {hint}
        </span>
      )}
    </Link>
  );
}
