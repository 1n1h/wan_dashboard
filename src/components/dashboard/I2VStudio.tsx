"use client";

import { useState, useMemo } from "react";
import { Loader2, Sparkles, Download, RotateCcw } from "lucide-react";
import { estimateCreditsForModel } from "@/lib/credits";
import { MODEL_REGISTRY, getModel } from "@/lib/models";
import type { Resolution, Tier } from "@/types";
import { cn } from "@/lib/utils";
import { ModelPicker } from "@/components/dashboard/ModelPicker";
import { FileDropzone } from "@/components/dashboard/FileDropzone";

const ASPECTS = [
  { label: "16:9", code: "16:9" },
  { label: "9:16", code: "9:16" },
  { label: "1:1", code: "1:1" },
];
const RESOLUTIONS: { value: Resolution; label: string; tier: string }[] = [
  { value: "480p", label: "480p", tier: "Free" },
  { value: "720p", label: "720p", tier: "Starter" },
  { value: "1080p", label: "1080p", tier: "Pro" },
];
const ANIMATIONS = ["pan", "zoom in", "zoom out", "follow subject", "ambient"];

type Status = "idle" | "submitting" | "processing" | "completed" | "failed";

const I2V_MODELS = MODEL_REGISTRY["image-to-video"];

export function I2VStudio({ userTier = "free" as Tier }: { userTier?: Tier }) {
  const [modelId, setModelId] = useState(I2V_MODELS[0].id);
  const [imageUrl, setImageUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState(5);
  const [resolution, setResolution] = useState<Resolution>("720p");
  const [aspect, setAspect] = useState("16:9");
  const [animation, setAnimation] = useState("pan");
  const [seed, setSeed] = useState<string>("");
  const [status, setStatus] = useState<Status>("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const model = getModel("image-to-video", modelId) ?? I2V_MODELS[0];
  const cost = useMemo(
    () => estimateCreditsForModel(model, resolution, duration),
    [model, resolution, duration]
  );

  async function onGenerate() {
    if (!imageUrl.trim() || status === "submitting" || status === "processing") return;
    setStatus("submitting");
    setError(null);
    setVideoUrl(null);

    try {
      const composedPrompt = [prompt.trim(), animation].filter(Boolean).join(", ");

      const res = await fetch("/api/videos/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          feature: "image-to-video",
          modelId: model.id,
          prompt: composedPrompt || "natural ambient motion",
          duration,
          resolution,
          aspect,
          seed: seed ? Number(seed) : undefined,
          image_url: imageUrl.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Generation failed");

      setStatus("processing");
      pollResult(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      setStatus("failed");
    }
  }

  async function pollResult(id: string) {
    for (let i = 0; i < 60; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      try {
        const res = await fetch(`/api/videos/${id}/status`);
        const data = await res.json();
        if (data.status === "completed" && data.video_url) {
          setVideoUrl(data.video_url);
          setStatus("completed");
          return;
        }
        if (data.status === "failed") {
          setError(data.error_message ?? "Generation failed");
          setStatus("failed");
          return;
        }
      } catch {}
    }
    setError("Timed out waiting for result");
    setStatus("failed");
  }

  function reset() {
    setStatus("idle");
    setVideoUrl(null);
    setError(null);
  }

  const busy = status === "submitting" || status === "processing";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] h-full">
      {/* Form */}
      <div className="border-r border-white/[0.06] overflow-y-auto p-6 space-y-6">
        <div>
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-white/35 mb-2">
            — Image-to-Video
          </div>
          <h1 className="font-display text-2xl font-bold mb-1 text-white">Animate a still</h1>
          <p className="text-xs text-white/50">
            {model.name} · {cost} credits estimated
          </p>
        </div>

        <Field label="Model">
          <ModelPicker
            models={I2V_MODELS}
            selectedId={modelId}
            onSelect={setModelId}
            userTier={userTier}
          />
        </Field>

        {/* Source image */}
        <Field label="Source image">
          <FileDropzone
            mode="image"
            value={imageUrl}
            onChange={setImageUrl}
          />
        </Field>

        <Field label="Prompt (optional)" hint={`${prompt.length}/500`}>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value.slice(0, 500))}
            placeholder="Wind in the trees, leaves rustling, slow camera push-in..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-brand/50 focus:bg-white/[0.05] resize-none transition-colors"
          />
        </Field>

        <Field label="Animation">
          <div className="flex flex-wrap gap-1.5">
            {ANIMATIONS.map((a) => (
              <button
                key={a}
                onClick={() => setAnimation(a)}
                className={cn(
                  "px-3 py-1.5 rounded-full border text-xs transition-all",
                  animation === a
                    ? "bg-white/[0.08] border-white/25 text-white"
                    : "bg-white/[0.025] border-white/[0.08] text-white/60 hover:border-white/15 hover:text-white"
                )}
              >
                {a}
              </button>
            ))}
          </div>
        </Field>

        <Field label={`Duration · ${duration}s`}>
          <input
            type="range"
            min={2}
            max={10}
            step={1}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="w-full accent-brand"
          />
          <div className="flex justify-between font-mono text-[10px] text-white/40 mt-1">
            <span>2s</span>
            <span>10s</span>
          </div>
        </Field>

        <Field label="Resolution">
          <div className="grid grid-cols-3 gap-2">
            {RESOLUTIONS.map((r) => (
              <button
                key={r.value}
                onClick={() => setResolution(r.value)}
                className={cn(
                  "py-2 rounded-lg border text-sm transition-all",
                  resolution === r.value
                    ? "bg-white/[0.08] border-white/25 text-white"
                    : "bg-white/[0.025] border-white/[0.08] text-white/60 hover:border-white/15 hover:text-white"
                )}
              >
                <div className="font-medium">{r.label}</div>
                <div className="text-[9px] font-mono text-white/40">{r.tier}</div>
              </button>
            ))}
          </div>
        </Field>

        <Field label="Aspect ratio">
          <div className="grid grid-cols-3 gap-2">
            {ASPECTS.map((a) => (
              <button
                key={a.code}
                onClick={() => setAspect(a.code)}
                className={cn(
                  "py-2 rounded-lg border font-mono text-xs transition-all",
                  aspect === a.code
                    ? "bg-white/[0.08] border-white/25 text-white"
                    : "bg-white/[0.025] border-white/[0.08] text-white/60 hover:border-white/15 hover:text-white"
                )}
              >
                {a.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Seed (optional)" hint="for reproducibility">
          <input
            type="number"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="random"
            className="w-full px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-sm font-mono text-white placeholder:text-white/30 focus:outline-none focus:border-brand/50 focus:bg-white/[0.05] transition-colors"
          />
        </Field>

        <div className="pt-4 border-t border-white/[0.06] space-y-2">
          <button
            onClick={onGenerate}
            disabled={busy || !imageUrl.trim()}
            className="btn btn-primary w-full"
          >
            {busy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {status === "submitting" ? "Submitting..." : "Animating..."}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate · {cost} credits
              </>
            )}
          </button>
          {status !== "idle" && !busy && (
            <button onClick={reset} className="btn btn-ghost w-full text-sm">
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="p-6 md:p-10 flex flex-col">
        <div className="flex-1 rounded-2xl bg-black/40 border border-white/[0.08] overflow-hidden grain aspect-[16/9] relative">
          <div className="absolute top-0 left-0 right-0 h-9 bg-black/50 backdrop-blur-md border-b border-white/[0.06] flex items-center px-4 gap-2 z-10">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
            </div>
            <div className="flex-1 text-center font-mono text-[10px] text-white/40 uppercase tracking-wider">
              wan://i2v · {resolution} · {aspect} · {duration}s
            </div>
            <div
              className={cn(
                "font-mono text-[10px] px-2 py-0.5 rounded border",
                status === "completed" && "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
                status === "processing" && "bg-amber-500/15 text-amber-300 border-amber-500/30",
                status === "submitting" && "bg-amber-500/15 text-amber-300 border-amber-500/30",
                status === "failed" && "bg-red-500/15 text-red-300 border-red-500/30",
                status === "idle" && "bg-white/[0.04] text-white/40 border-white/[0.08]"
              )}
            >
              {status}
            </div>
          </div>

          <div className="absolute inset-0 pt-9">
            {status === "idle" && <PreviewExplainer src="/auth-bg.mp4" />}
            {status === "submitting" && <PreviewProcessing label="Submitting to GPU..." />}
            {status === "processing" && <PreviewProcessing label="Animating frames..." />}
            {status === "failed" && <PreviewError message={error ?? "Failed"} onRetry={reset} />}
            {status === "completed" && videoUrl && <PreviewVideo url={videoUrl} />}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <Stat label="Model" value={model.name} />
          <Stat label="Cost" value={`${cost} cr`} />
          <Stat label="Resolution" value={resolution} />
          <Stat label="Duration" value={`${duration}s`} />
        </div>
      </div>
    </div>
  );
}

function Field({
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

function PreviewExplainer({ src }: { src: string }) {
  return (
    <div className="relative w-full h-full overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        src={src}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/55 backdrop-blur-md border border-white/10">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
        <span className="font-mono text-[10px] uppercase tracking-wider text-white/80 whitespace-nowrap">
          Example output · drop an image to animate yours
        </span>
      </div>
    </div>
  );
}

function PreviewProcessing({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-brand-glow animate-spin mx-auto mb-3" />
        <div className="font-mono text-sm text-white mb-1">{label}</div>
        <div className="text-xs text-white/50">Stay or come back — we&apos;ll save it.</div>
      </div>
    </div>
  );
}

function PreviewError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="text-center max-w-sm px-6">
        <div className="font-mono text-xs uppercase tracking-wider text-red-300 mb-2">
          Generation failed
        </div>
        <div className="text-sm text-white/70 mb-4">{message}</div>
        <button onClick={onRetry} className="btn btn-ghost text-sm">
          Try again
        </button>
      </div>
    </div>
  );
}

function PreviewVideo({ url }: { url: string }) {
  return (
    <div className="w-full h-full p-1 relative">
      <video
        src={url}
        controls
        autoPlay
        loop
        className="w-full h-full object-contain rounded-lg"
      />
      <a
        href={url}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-4 right-4 btn btn-primary text-sm"
      >
        <Download className="w-3.5 h-3.5" />
        Download
      </a>
    </div>
  );
}
