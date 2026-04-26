"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { TimelineContent } from "@/components/ui/timeline-animation";

const FEATURES = [
  {
    name: "Text-to-Video",
    code: "T2V",
    description: "Type a prompt, get a clip. Cinematic, anime, photoreal — all from a single line.",
    cost: "8 credits",
    available: "All tiers",
    videoSrc: "/auth-bg.mp4",
    tint: "from-violet-500/30 via-transparent to-fuchsia-500/20",
  },
  {
    name: "Image-to-Video",
    code: "I2V",
    description: "Bring stills to life. Camera moves, ambient motion, character animation from a single frame.",
    cost: "10 credits",
    available: "Starter+",
    videoSrc: "/auth-bg.mp4",
    tint: "from-cyan-500/30 via-transparent to-blue-500/20",
  },
  {
    name: "Face-Swap",
    code: "SWAP",
    description: "Identity transfer with frame-perfect tracking. Confidence and blend strength dialled in.",
    cost: "15 credits",
    available: "Pro+",
    videoSrc: "/auth-bg.mp4",
    tint: "from-emerald-500/30 via-transparent to-teal-500/20",
  },
  {
    name: "Motion Transfer",
    code: "MOTION",
    description: "Drive any character with reference footage. Preserve face, transfer pose and gesture.",
    cost: "18 credits",
    available: "Pro+",
    videoSrc: "/auth-bg.mp4",
    tint: "from-amber-500/30 via-transparent to-orange-500/20",
  },
  {
    name: "Video Editing",
    code: "EDIT",
    description: "Upscale, color-grade, restyle, extend. Surgical edits with consistent motion.",
    cost: "12 credits",
    available: "Pro+",
    videoSrc: "/auth-bg.mp4",
    tint: "from-rose-500/30 via-transparent to-pink-500/20",
  },
  {
    name: "Custom Fine-tuning",
    code: "TRAIN",
    description: "Train Wan on your characters and brand style. Coming soon to Enterprise.",
    cost: "Contact",
    available: "Enterprise",
    videoSrc: "/auth-bg.mp4",
    tint: "from-zinc-500/40 via-transparent to-zinc-700/30",
    comingSoon: true,
  },
];

export function Features() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} id="features" className="py-24 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <article className="max-w-3xl mb-12 md:mb-16">
          <TimelineContent
            as="div"
            animationNum={1}
            timelineRef={sectionRef}
            className="font-mono text-xs uppercase tracking-[0.2em] text-brand mb-3"
          >
            — Capabilities
          </TimelineContent>
          <TimelineContent
            as="h2"
            animationNum={2}
            timelineRef={sectionRef}
            className="2xl:text-6xl xl:text-5xl sm:text-4xl text-3xl text-zinc-900 leading-[1.05] tracking-tight"
          >
            Five models.{" "}
            <span className="font-semibold text-gradient-brand">One canvas.</span>
          </TimelineContent>
          <TimelineContent
            as="p"
            animationNum={3}
            timelineRef={sectionRef}
            className="mt-4 text-lg text-zinc-600 leading-relaxed"
          >
            Every WanAnimate primitive in a single workspace. Mix them, chain them, sequence them.
          </TimelineContent>
        </article>

        <div className="grid md:grid-cols-3 grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
          {FEATURES.map((f, index) => (
            <TimelineContent
              key={f.code}
              as="div"
              animationNum={index + 4}
              timelineRef={sectionRef}
              className="group relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-200 hover:border-brand/40 transition-all duration-300 shadow-sm hover:shadow-xl"
            >
              {/* Looping background video — swap each `videoSrc` per card as
                  real demo footage gets produced. */}
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                src={f.videoSrc}
                className={cn(
                  "absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105",
                  f.comingSoon && "grayscale"
                )}
              />

              {/* Color tint blended with the video */}
              <div
                className={cn("absolute inset-0 bg-gradient-to-br mix-blend-overlay", f.tint)}
              />

              {/* Bottom progressive blur */}
              <ProgressiveBlur
                className="pointer-events-none absolute bottom-0 left-0 h-[55%] w-full"
                blurIntensity={0.4}
              />

              {/* Top-right code chip */}
              <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-white/90 backdrop-blur-sm font-mono text-[10px] font-semibold text-zinc-900 tracking-wider">
                {f.code}
              </div>

              {/* Coming-soon ribbon */}
              {f.comingSoon && (
                <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-warm/90 text-white font-mono text-[10px] uppercase tracking-wider">
                  Coming soon
                </div>
              )}

              {/* Bottom label */}
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <h3 className="font-display font-semibold text-xl md:text-2xl mb-1.5 leading-tight">
                  {f.name}
                </h3>
                <p className="text-sm text-white/85 leading-snug mb-3 line-clamp-2">
                  {f.description}
                </p>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-sm border border-white/30">
                    {f.cost}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-sm border border-white/30">
                    {f.available}
                  </span>
                </div>
              </div>
            </TimelineContent>
          ))}
        </div>
      </div>
    </section>
  );
}
