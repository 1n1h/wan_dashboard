"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check, Lock, Zap, Crown, Film, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ModelDef, ModelTier } from "@/lib/models";
import type { Tier } from "@/types";

const TIER_ICON: Record<ModelTier, typeof Zap> = {
  fast: Zap,
  balanced: Gauge,
  pro: Crown,
  cinematic: Film,
};
const TIER_COLOR: Record<ModelTier, string> = {
  fast: "text-emerald-300",
  balanced: "text-cyan-300",
  pro: "text-brand-glow",
  cinematic: "text-amber-300",
};

const USER_TIER_RANK: Record<Tier, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  enterprise: 3,
};

export function ModelPicker({
  models,
  selectedId,
  onSelect,
  userTier,
}: {
  models: ModelDef[];
  selectedId: string;
  onSelect: (id: string) => void;
  userTier: Tier;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = models.find((m) => m.id === selectedId) ?? models[0];
  const SelectedIcon = TIER_ICON[selected.tier];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg text-left transition-colors",
          "bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05] hover:border-white/15",
          open && "bg-white/[0.05] border-brand/40"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <SelectedIcon className={cn("w-4 h-4 shrink-0", TIER_COLOR[selected.tier])} />
          <div className="min-w-0">
            <div className="text-sm text-white truncate">{selected.name}</div>
            <div className="text-[10px] font-mono text-white/40 truncate">
              {selected.tagline}
            </div>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-white/40 transition-transform shrink-0",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 rounded-xl surface-menu shadow-[0_24px_64px_-16px_rgba(0,0,0,0.6)] py-1 max-h-96 overflow-y-auto animate-fade-in">
          {models.map((m) => {
            const Icon = TIER_ICON[m.tier];
            const locked = USER_TIER_RANK[userTier] < USER_TIER_RANK[m.minUserTier];
            const isSelected = m.id === selected.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  if (locked) return;
                  onSelect(m.id);
                  setOpen(false);
                }}
                disabled={locked}
                className={cn(
                  "w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors",
                  isSelected && "bg-white/[0.06]",
                  !isSelected && !locked && "hover:bg-white/[0.04]",
                  locked && "opacity-40 cursor-not-allowed"
                )}
              >
                <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", TIER_COLOR[m.tier])} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white truncate">{m.name}</span>
                    {!m.verified && (
                      <span className="text-[9px] font-mono uppercase tracking-wider text-amber-300/70">
                        beta
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-white/55 mt-0.5">{m.tagline}</div>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono">
                    <span className="text-white/40">
                      ~${m.usdPer5s720p.toFixed(2)} / 5s
                    </span>
                    <span className="text-white/20">·</span>
                    <span className="text-white/40">{m.maxResolution}</span>
                    <span className="text-white/20">·</span>
                    <span className="text-white/40">{m.maxDuration}s max</span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center">
                  {locked ? (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-[9px] font-mono uppercase tracking-wider text-white/55">
                      <Lock className="w-2.5 h-2.5" />
                      {m.minUserTier}
                    </span>
                  ) : isSelected ? (
                    <Check className="w-4 h-4 text-brand-glow" />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
