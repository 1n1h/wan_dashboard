"use client";

import Link from "next/link";
import { useRef } from "react";
import {
  Coins,
  Megaphone,
  Sparkles,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import { TimelineContent } from "@/components/ui/timeline-animation";

export function AffiliateSection() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section
      ref={sectionRef}
      id="affiliate"
      className="py-24 md:py-32 relative border-t border-zinc-100"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="rounded-3xl bg-zinc-900 text-white overflow-hidden grain relative">
          {/* Ambient glow */}
          <div className="absolute -top-1/2 -right-1/4 w-1/2 h-full bg-amber-500/15 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute -bottom-1/2 -left-1/4 w-1/2 h-full bg-orange-500/10 blur-3xl rounded-full pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 p-10 md:p-16">
            {/* Left: pitch */}
            <div>
              <TimelineContent
                as="div"
                animationNum={1}
                timelineRef={sectionRef}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 mb-6"
              >
                <Megaphone className="w-3 h-3 text-amber-300" />
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-200">
                  Affiliate program
                </span>
              </TimelineContent>

              <TimelineContent
                as="h2"
                animationNum={2}
                timelineRef={sectionRef}
                className="2xl:text-6xl xl:text-5xl text-4xl leading-[1.05] tracking-tight mb-5"
              >
                Earn{" "}
                <span className="font-semibold text-amber-300">25%</span> on
                every paid month.
              </TimelineContent>

              <TimelineContent
                as="p"
                animationNum={3}
                timelineRef={sectionRef}
                className="text-lg text-zinc-300 leading-relaxed mb-8 max-w-xl"
              >
                Share Wan with creators, agencies, indie hackers. We pay you a
                quarter of every paid month they stay subscribed for the first
                year. One link, lifetime credit.
              </TimelineContent>

              <TimelineContent
                as="div"
                animationNum={4}
                timelineRef={sectionRef}
                className="flex flex-wrap gap-3"
              >
                <Link
                  href="/signup?next=/dashboard/affiliate"
                  className="inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 bg-amber-300 text-zinc-900 px-6 py-3 hover:bg-amber-200 group"
                >
                  Become an affiliate
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="#perks"
                  className="inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 border border-white/15 text-white/85 px-6 py-3 hover:bg-white/5"
                >
                  See the perks
                </a>
              </TimelineContent>

              {/* Quick math */}
              <TimelineContent
                as="div"
                animationNum={5}
                timelineRef={sectionRef}
                className="mt-10 grid grid-cols-3 gap-3 max-w-md"
              >
                {[
                  ["10", "$148"],
                  ["50", "$738"],
                  ["200", "$2,950"],
                ].map(([users, earn]) => (
                  <div
                    key={users}
                    className="rounded-xl bg-white/[0.04] border border-white/10 p-3"
                  >
                    <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 mb-1">
                      {users} Pro refs
                    </div>
                    <div className="font-display text-lg font-bold text-amber-300">
                      {earn}/mo
                    </div>
                  </div>
                ))}
              </TimelineContent>
            </div>

            {/* Right: perks */}
            <div id="perks" className="space-y-3">
              {[
                {
                  icon: Coins,
                  title: "25% recurring · 12 months",
                  text: "Quarterly cut of every paid month, capped at one year per user. No referral cap.",
                },
                {
                  icon: TrendingUp,
                  title: "30-day attribution window",
                  text: "Cookie sticks for a month. Late conversions still attribute to you.",
                },
                {
                  icon: Sparkles,
                  title: "Marketing kit included",
                  text: "Pre-written copy for X, IG, email, and blog. Banner assets, demo reels.",
                },
                {
                  icon: Megaphone,
                  title: "Real-time dashboard",
                  text: "Track clicks, signups, paying users, earnings. Updated live.",
                },
              ].map((p, i) => {
                const Icon = p.icon;
                return (
                  <TimelineContent
                    key={p.title}
                    as="div"
                    animationNum={i + 6}
                    timelineRef={sectionRef}
                    className="rounded-xl bg-white/[0.03] border border-white/10 p-5 flex gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-amber-300" />
                    </div>
                    <div>
                      <div className="font-medium text-white mb-1">{p.title}</div>
                      <div className="text-sm text-zinc-400 leading-relaxed">
                        {p.text}
                      </div>
                    </div>
                  </TimelineContent>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
