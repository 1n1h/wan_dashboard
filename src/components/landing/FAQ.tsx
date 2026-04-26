"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { TimelineContent } from "@/components/ui/timeline-animation";

const FAQS = [
  {
    q: "What is Wan?",
    a: "Wan is a SaaS workspace for the WanAnimate family of video models. Text-to-Video, Image-to-Video, Face-Swap, Motion Transfer, and Editing — all under one credit balance, one UI, one license.",
  },
  {
    q: "How do credits work?",
    a: "Every render costs credits based on the feature, resolution, and duration. Free tier renews 50 credits monthly; paid tiers come with monthly grants plus the option to top up. Failed generations are auto-refunded.",
  },
  {
    q: "Can I use the videos commercially?",
    a: "Free tier outputs are watermarked and non-commercial. Starter and above ship clean files with full commercial rights. Pro+ adds priority queue and broadcast-grade 1080p.",
  },
  {
    q: "How long does generation take?",
    a: "T2V at 720p typically completes in 25-45s. 1080p Pro renders take 60-90s. Pro+ gets priority GPU allocation, so queue time stays near zero even during peak hours.",
  },
  {
    q: "What file formats are supported?",
    a: "Output is always MP4 (H.264) for compatibility. We're adding ProRes and WebM exports in Q2. Inputs accept JPG, PNG, WebP for images and MP4, MOV for video.",
  },
  {
    q: "Is there an API?",
    a: "Yes — Pro and Enterprise tiers expose a REST API and webhook system. Same models, same pricing, automatable from your stack.",
  },
];

export function FAQ() {
  const sectionRef = useRef<HTMLElement>(null);
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section ref={sectionRef} id="faq" className="py-24 md:py-32 relative">
      <div className="max-w-3xl mx-auto px-4 md:px-6">
        <article className="text-center mb-12">
          <TimelineContent
            as="div"
            animationNum={1}
            timelineRef={sectionRef}
            className="font-mono text-xs uppercase tracking-[0.2em] text-brand mb-3"
          >
            — FAQ
          </TimelineContent>
          <TimelineContent
            as="h2"
            animationNum={2}
            timelineRef={sectionRef}
            className="2xl:text-6xl xl:text-5xl sm:text-4xl text-3xl text-zinc-900 leading-[1.05] tracking-tight"
          >
            Questions,{" "}
            <span className="font-semibold text-gradient-brand">answered</span>.
          </TimelineContent>
        </article>

        <div className="space-y-2">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <TimelineContent
                key={faq.q}
                as="div"
                animationNum={i + 3}
                timelineRef={sectionRef}
                className={cn(
                  "rounded-xl transition-all liquid-glass-light",
                  isOpen && "border-brand/40 shadow-[0_16px_40px_-12px_rgba(168,85,247,0.2)]"
                )}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                >
                  <span className="font-medium text-zinc-900 pr-4">{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform shrink-0",
                      isOpen ? "rotate-180 text-brand" : "text-zinc-400"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300",
                    isOpen ? "max-h-48" : "max-h-0"
                  )}
                >
                  <div className="px-6 pb-5 text-sm text-zinc-600 leading-relaxed">
                    {faq.a}
                  </div>
                </div>
              </TimelineContent>
            );
          })}
        </div>
      </div>
    </section>
  );
}
