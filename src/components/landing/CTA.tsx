"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import { TimelineContent } from "@/components/ui/timeline-animation";

export function CTA() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} className="py-24 md:py-32 relative">
      <div className="max-w-5xl mx-auto px-4 md:px-6">
        <TimelineContent
          as="div"
          animationNum={1}
          timelineRef={sectionRef}
          className="relative rounded-3xl overflow-hidden p-12 md:p-20 text-center grain bg-zinc-900 text-white"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-brand/30 via-transparent to-accent/20 pointer-events-none" />
          <div className="absolute -top-1/2 -left-1/4 w-1/2 h-full bg-brand/20 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute -bottom-1/2 -right-1/4 w-1/2 h-full bg-accent/15 blur-3xl rounded-full pointer-events-none" />

          <div className="relative">
            <h2 className="2xl:text-6xl xl:text-5xl sm:text-4xl text-3xl leading-[1.05] tracking-tight mb-4">
              Stop describing.
              <br />
              <span className="font-semibold text-gradient-warm">
                Start rendering.
              </span>
            </h2>
            <p className="text-lg text-zinc-300 max-w-xl mx-auto mb-10">
              50 free credits. No credit card. Your first clip in under a minute.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 bg-white text-zinc-900 px-6 py-3 hover:bg-brand hover:text-white group"
            >
              Generate your first video
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </TimelineContent>
      </div>
    </section>
  );
}
