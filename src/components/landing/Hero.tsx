"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { TimelineContent } from "@/components/ui/timeline-animation";

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} className="relative pt-28 pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Pill eyebrow */}
          <TimelineContent
            as="a"
            href="#features"
            animationNum={1}
            timelineRef={sectionRef}
            className="flex w-fit items-center gap-2 rounded-full bg-brand border-4 border-brand/20 py-0.5 pl-0.5 pr-3 text-xs mb-8 hover:scale-[1.02] transition-transform"
          >
            <div className="rounded-full bg-white px-2 py-1 text-xs text-zinc-900 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand" />
              New
            </div>
            <p className="text-white sm:text-sm text-xs">
              WanAnimate 2.5 is live
            </p>
            <ArrowRight className="h-3 w-3 text-white" />
          </TimelineContent>

          {/* Headline */}
          <TimelineContent
            as="h1"
            animationNum={2}
            timelineRef={sectionRef}
            className="2xl:text-7xl xl:text-6xl sm:text-5xl text-4xl leading-[1.05] text-zinc-900 tracking-tight"
          >
            Studio-quality{" "}
            <span className="font-semibold text-gradient-warm">video</span>,{" "}
            <span className="font-semibold text-gradient-brand">generated</span>{" "}
            in seconds.
          </TimelineContent>

          {/* Subhead */}
          <TimelineContent
            as="p"
            animationNum={3}
            timelineRef={sectionRef}
            className="mt-6 lg:text-xl sm:text-lg text-base max-w-2xl mx-auto text-zinc-600 leading-relaxed"
          >
            Type a prompt, drop an image, or transfer motion. Wan turns ideas into
            cinematic clips in <span className="text-zinc-900">seconds</span>, not hours.
          </TimelineContent>

          {/* CTAs */}
          <TimelineContent
            as="div"
            animationNum={4}
            timelineRef={sectionRef}
            className="flex flex-col sm:flex-row items-center gap-3 mt-10"
          >
            <Link href="/signup" className="btn-primary-light group">
              Start generating free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a href="#demo" className="btn-ghost-light group">
              <Play className="w-3.5 h-3.5 fill-current" />
              Watch a 30s demo
            </a>
          </TimelineContent>

          {/* Stat row */}
          <TimelineContent
            as="div"
            animationNum={5}
            timelineRef={sectionRef}
            className="mt-12 flex items-center justify-center gap-6 md:gap-8 text-xs font-mono text-zinc-500 uppercase tracking-wider"
          >
            <div><span className="text-zinc-900">12K+</span> creators</div>
            <div className="w-px h-3 bg-zinc-200" />
            <div><span className="text-zinc-900">~30s</span> avg gen</div>
            <div className="w-px h-3 bg-zinc-200" />
            <div><span className="text-zinc-900">1080p</span> max</div>
          </TimelineContent>
        </div>

        {/* Demo viewport */}
        <TimelineContent
          as="div"
          animationNum={6}
          timelineRef={sectionRef}
          className="relative mt-20 max-w-5xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-900 aspect-[16/9] grain shadow-[0_24px_64px_-24px_rgba(168,85,247,0.4)]">
            <div id="demo" className="absolute inset-0 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-brand/30 via-transparent to-accent/20" />
              <div className="relative z-10 flex flex-col items-center gap-3">
                <button className="w-16 h-16 rounded-full bg-white/95 backdrop-blur flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.4)] cursor-pointer hover:scale-105 transition-transform">
                  <Play className="w-6 h-6 fill-zinc-900 text-zinc-900 ml-0.5" />
                </button>
                <span className="font-mono text-xs text-white/70">demo.mp4 · 0:30</span>
              </div>
            </div>

            {/* Window chrome */}
            <div className="absolute top-0 left-0 right-0 h-9 bg-zinc-950/80 backdrop-blur-sm border-b border-white/10 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
              </div>
              <div className="flex-1 text-center font-mono text-[10px] text-white/50 uppercase tracking-wider">
                wan://generate · t2v · 1080p · 8s
              </div>
            </div>
          </div>

          {/* Floating notation cards */}
          <div className="hidden md:block absolute -left-6 top-1/3 glass-light rounded-xl px-4 py-3 max-w-xs shadow-xl animate-fade-in">
            <div className="text-[10px] font-mono uppercase tracking-wider text-brand mb-1">Prompt</div>
            <div className="text-sm text-zinc-700 italic">&ldquo;A fox running through golden hour wheat fields, slow-motion&rdquo;</div>
          </div>
          <div className="hidden md:block absolute -right-4 bottom-12 glass-light rounded-xl px-4 py-3 shadow-xl animate-fade-in">
            <div className="text-[10px] font-mono uppercase tracking-wider text-accent-deep mb-1">Cost</div>
            <div className="text-sm text-zinc-900">8 credits · 1080p</div>
          </div>
        </TimelineContent>
      </div>
    </section>
  );
}
