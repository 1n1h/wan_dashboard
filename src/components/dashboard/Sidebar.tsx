"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Type,
  Image as ImageIcon,
  Users,
  Activity,
  Wand2,
  Library,
  CreditCard,
  Settings,
  HelpCircle,
  Megaphone,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV: {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  section?: string;
  highlight?: boolean;
}[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Text-to-Video", href: "/dashboard/t2v", icon: Type, section: "Generate" },
  { label: "Image-to-Video", href: "/dashboard/i2v", icon: ImageIcon },
  { label: "Face-Swap", href: "/dashboard/face-swap", icon: Users },
  { label: "Motion Control", href: "/dashboard/motion", icon: Activity },
  { label: "Editing", href: "/dashboard/editing", icon: Wand2 },
  { label: "My videos", href: "/dashboard/library", icon: Library, section: "Library" },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard, section: "Account" },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Help", href: "/dashboard/help", icon: HelpCircle },
  {
    label: "Affiliate program",
    href: "/dashboard/affiliate",
    icon: Megaphone,
    section: "Earn",
    highlight: true,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mobileOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Hamburger — visible only on mobile */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3.5 left-3 z-40 w-9 h-9 rounded-lg bg-white/[0.05] border border-white/10 backdrop-blur-md flex items-center justify-center text-white/85 hover:bg-white/[0.08] hover:text-white"
        aria-label="Open navigation"
      >
        <Menu className="w-4 h-4" />
      </button>

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "flex flex-col w-60 shrink-0 border-r border-white/[0.06] backdrop-blur-md transition-transform",
          // Default desktop
          "hidden lg:flex bg-white/[0.015]",
          // Mobile slide-in
          mobileOpen &&
            "!flex fixed top-0 bottom-0 left-0 z-50 bg-zinc-950/95 backdrop-blur-xl"
        )}
      >
        <div className="p-5 border-b border-white/[0.06] flex items-center justify-between">
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

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <div key={item.href}>
                {item.section && (
                  <div className="px-3 pt-4 pb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-white/30">
                    {item.section}
                  </div>
                )}
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
                    active && !item.highlight &&
                      "bg-white/[0.07] text-white border border-white/10",
                    !active && !item.highlight &&
                      "text-white/60 hover:bg-white/[0.04] hover:text-white border border-transparent",
                    item.highlight && active &&
                      "bg-amber-500/15 text-amber-100 border border-amber-500/40 shadow-[0_0_24px_rgba(245,158,11,0.15)]",
                    item.highlight && !active &&
                      "bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-200 border border-amber-500/25 hover:from-amber-500/20 hover:to-orange-500/20 hover:border-amber-500/40 hover:text-amber-100"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4",
                      item.highlight ? "text-amber-300" : active ? "text-brand-glow" : ""
                    )}
                  />
                  <span>{item.label}</span>
                  {item.highlight && (
                    <span className="ml-auto text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30">
                      25%
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/[0.06]">
          <div className="rounded-lg surface p-3 text-xs">
            <div className="font-mono text-white/40 uppercase tracking-wider mb-1">Status</div>
            <div className="flex items-center gap-2 text-white/70">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
              All models online
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
