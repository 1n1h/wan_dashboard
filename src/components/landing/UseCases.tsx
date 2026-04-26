"use client";

import { useRef } from "react";
import { TimelineContent } from "@/components/ui/timeline-animation";

const CASES = [
  {
    label: "01",
    title: "AI presenters & avatars",
    description: "Spin up a brand spokesperson from a single photo. Looks human, never sleeps.",
    accent: "Marketing",
  },
  {
    label: "02",
    title: "Product launch films",
    description: "Render a 30s campaign across 1080p, 9:16, and 1:1 in the time it takes to brew coffee.",
    accent: "DTC",
  },
  {
    label: "03",
    title: "Social-first content",
    description: "Daily TikTok hooks, IG Reels, YouTube Shorts — generated, not filmed.",
    accent: "Creators",
  },
  {
    label: "04",
    title: "Educational explainers",
    description: "Animate diagrams, simulate experiments, dramatize history. K–12 to PhD.",
    accent: "EdTech",
  },
];

export function UseCases() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      id="use-cases"
      className="py-24 md:py-32 relative border-t border-zinc-100"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-12">
          <div className="lg:col-span-1">
            <TimelineContent
              as="div"
              animationNum={1}
              timelineRef={sectionRef}
              className="font-mono text-xs uppercase tracking-[0.2em] text-brand mb-3"
            >
              — Use cases
            </TimelineContent>
            <TimelineContent
              as="h2"
              animationNum={2}
              timelineRef={sectionRef}
              className="2xl:text-5xl xl:text-4xl text-3xl text-zinc-900 leading-[1.05] tracking-tight"
            >
              Wan is being{" "}
              <span className="font-semibold text-gradient-warm">used for...</span>
            </TimelineContent>
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CASES.map((c, index) => (
              <TimelineContent
                key={c.label}
                as="div"
                animationNum={index + 3}
                timelineRef={sectionRef}
                className="group rounded-2xl liquid-glass-light p-6 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-2xl text-zinc-300 group-hover:text-brand transition-colors">
                    {c.label}
                  </span>
                  <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 rounded-md bg-accent/10 text-accent-deep border border-accent/20">
                    {c.accent}
                  </span>
                </div>
                <h3 className="font-display font-semibold text-lg mb-2 text-zinc-900">
                  {c.title}
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">{c.description}</p>
              </TimelineContent>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
