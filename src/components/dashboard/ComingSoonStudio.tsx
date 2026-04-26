"use client";

import Link from "next/link";
import { Sparkles, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type Field =
  | { kind: "upload"; label: string; hint?: string }
  | { kind: "url"; label: string; hint?: string }
  | { kind: "slider"; label: string; min: number; max: number; default: number; suffix?: string }
  | { kind: "select"; label: string; options: string[]; default: string }
  | { kind: "toggle"; label: string; default: boolean };

export function ComingSoonStudio({
  title,
  modelHandle,
  description,
  cost,
  tier,
  fields,
  windowCode,
  explainerSrc = "/auth-bg.mp4",
}: {
  title: string;
  modelHandle: string;
  description: string;
  cost: string;
  tier: "Starter+" | "Pro+" | "Enterprise";
  fields: Field[];
  windowCode: string;
  explainerSrc?: string;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] h-full">
      {/* Form (controls visible but disabled) */}
      <div className="border-r border-white/[0.06] overflow-y-auto p-6 space-y-6 relative">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-white/35">
              — {title}
            </div>
            <span className="px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-mono uppercase tracking-wider">
              Coming soon
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold mb-1 text-white">{title}</h1>
          <p className="text-xs text-white/50">
            {modelHandle} · {cost} · {tier}
          </p>
          <p className="text-sm text-white/65 mt-3 leading-relaxed">{description}</p>
        </div>

        <fieldset disabled className="space-y-6 opacity-50 pointer-events-none">
          {fields.map((f, i) => (
            <FieldShell key={i} label={f.label} hint={"hint" in f ? f.hint : undefined}>
              {renderField(f)}
            </FieldShell>
          ))}
        </fieldset>

        <div className="pt-4 border-t border-white/[0.06] space-y-2">
          <button disabled className="btn btn-primary w-full opacity-60 cursor-not-allowed">
            <Lock className="w-4 h-4" />
            Generate (locked)
          </button>
          <Link href="/dashboard/billing" className="btn btn-ghost w-full text-sm">
            <Sparkles className="w-3.5 h-3.5" />
            Unlock with {tier === "Enterprise" ? "Enterprise" : "Pro"}
          </Link>
        </div>
      </div>

      {/* Preview (looping explainer + announcement card) */}
      <div className="p-6 md:p-10 flex flex-col">
        <div className="flex-1 rounded-2xl bg-black/40 border border-white/[0.08] overflow-hidden grain aspect-[16/9] relative">
          <div className="absolute top-0 left-0 right-0 h-9 bg-black/50 backdrop-blur-md border-b border-white/[0.06] flex items-center px-4 gap-2 z-10">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            </div>
            <div className="flex-1 text-center font-mono text-[10px] text-white/40 uppercase tracking-wider">
              {windowCode}
            </div>
            <div className="font-mono text-[10px] px-2 py-0.5 rounded border bg-amber-500/15 text-amber-300 border-amber-500/30">
              preview
            </div>
          </div>

          <div className="absolute inset-0 pt-9 overflow-hidden">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              src={explainerSrc}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/40 pointer-events-none" />

            {/* Center card */}
            <div className="absolute inset-0 flex items-center justify-center px-6">
              <div className="max-w-md w-full rounded-2xl surface-raised p-6 text-center backdrop-blur-md">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-slow" />
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-200">
                    In development
                  </span>
                </div>
                <h2 className="font-display font-semibold text-xl text-white mb-2">
                  {title} drops soon
                </h2>
                <p className="text-sm text-white/65 leading-relaxed mb-5">{description}</p>
                <Link href="/dashboard/billing" className="btn btn-primary text-sm w-full">
                  Reserve a {tier === "Enterprise" ? "demo" : "Pro spot"}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Model" value={modelHandle} />
          <Stat label="Cost" value={cost} />
          <Stat label="Tier" value={tier} />
          <Stat label="Status" value="In dev" />
        </div>
      </div>
    </div>
  );
}

function FieldShell({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <label className="text-xs font-mono uppercase tracking-wider text-white/55">
          {label}
        </label>
        {hint && <span className="text-[10px] font-mono text-white/35">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function renderField(f: Field) {
  if (f.kind === "upload") {
    return (
      <div className="rounded-lg border border-dashed border-white/15 aspect-video flex items-center justify-center text-white/40 text-xs font-mono uppercase tracking-wider">
        Drop file
      </div>
    );
  }
  if (f.kind === "url") {
    return (
      <input
        type="url"
        placeholder="https://..."
        readOnly
        className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-sm text-white font-mono"
      />
    );
  }
  if (f.kind === "slider") {
    return (
      <>
        <input
          type="range"
          min={f.min}
          max={f.max}
          defaultValue={f.default}
          className="w-full accent-brand"
          readOnly
        />
        <div className="flex justify-between font-mono text-[10px] text-white/40 mt-1">
          <span>{f.min}{f.suffix ?? ""}</span>
          <span>{f.max}{f.suffix ?? ""}</span>
        </div>
      </>
    );
  }
  if (f.kind === "select") {
    return (
      <div className="flex flex-wrap gap-1.5">
        {f.options.map((o) => (
          <span
            key={o}
            className={cn(
              "px-3 py-1.5 rounded-full border text-xs",
              o === f.default
                ? "bg-white/[0.08] border-white/25 text-white"
                : "bg-white/[0.025] border-white/[0.08] text-white/60"
            )}
          >
            {o}
          </span>
        ))}
      </div>
    );
  }
  // toggle
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "relative inline-block w-10 h-5 rounded-full",
          f.default ? "bg-brand" : "bg-white/20"
        )}
      >
        <span
          className={cn(
            "absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white",
            f.default && "translate-x-5"
          )}
        />
      </span>
      <span className="text-xs text-white/65">{f.default ? "On" : "Off"}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg surface p-3">
      <div className="text-[10px] font-mono uppercase tracking-wider text-white/35 mb-1">
        {label}
      </div>
      <div className="font-mono text-sm text-white">{value}</div>
    </div>
  );
}
