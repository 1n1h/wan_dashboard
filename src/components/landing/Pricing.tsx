"use client";

import Link from "next/link";
import { useRef } from "react";
import { Check } from "lucide-react";
import { TIERS } from "@/types";
import { cn } from "@/lib/utils";
import { TimelineContent } from "@/components/ui/timeline-animation";

export function Pricing() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} id="pricing" className="py-24 md:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <article className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <TimelineContent
            as="div"
            animationNum={1}
            timelineRef={sectionRef}
            className="font-mono text-xs uppercase tracking-[0.2em] text-brand mb-3"
          >
            — Pricing
          </TimelineContent>
          <TimelineContent
            as="h2"
            animationNum={2}
            timelineRef={sectionRef}
            className="2xl:text-6xl xl:text-5xl sm:text-4xl text-3xl text-zinc-900 leading-[1.05] tracking-tight"
          >
            Pay for what you{" "}
            <span className="font-semibold text-gradient-brand">render</span>.
          </TimelineContent>
          <TimelineContent
            as="p"
            animationNum={3}
            timelineRef={sectionRef}
            className="mt-4 text-lg text-zinc-600"
          >
            Credit-based. No surprise overage. Cancel anytime.
          </TimelineContent>
        </article>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TIERS.map((tier, index) => {
            const isPro = tier.name === "pro";
            const price =
              tier.name === "enterprise"
                ? "Custom"
                : tier.monthly_price_cents === 0
                ? "$0"
                : `$${(tier.monthly_price_cents / 100).toFixed(0)}`;

            return (
              <TimelineContent
                key={tier.id}
                as="div"
                animationNum={index + 4}
                timelineRef={sectionRef}
                className={cn(
                  "relative rounded-2xl p-6 flex flex-col transition-all",
                  isPro
                    ? "bg-zinc-900 text-white shadow-[0_24px_48px_-12px_rgba(168,85,247,0.35)] -translate-y-2"
                    : "liquid-glass-light"
                )}
              >
                {isPro && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-brand-gradient text-[10px] font-mono uppercase tracking-wider text-white font-bold">
                    Most popular
                  </div>
                )}

                <div className="mb-6">
                  <div
                    className={cn(
                      "font-mono text-xs uppercase tracking-[0.2em] mb-2",
                      isPro ? "text-brand-glow" : "text-zinc-500"
                    )}
                  >
                    {tier.name}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-4xl font-bold">{price}</span>
                    {tier.name !== "enterprise" && tier.monthly_price_cents > 0 && (
                      <span className={cn("text-sm", isPro ? "text-zinc-400" : "text-zinc-500")}>
                        /mo
                      </span>
                    )}
                  </div>
                  {tier.monthly_credits > 0 && (
                    <div className={cn("mt-1 text-sm", isPro ? "text-zinc-300" : "text-zinc-600")}>
                      {tier.monthly_credits.toLocaleString()} credits / month
                    </div>
                  )}
                  {tier.name === "enterprise" && (
                    <div className={cn("mt-1 text-sm", isPro ? "text-zinc-300" : "text-zinc-600")}>
                      Custom credits
                    </div>
                  )}
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {tier.features.map((f) => (
                    <li
                      key={f}
                      className={cn(
                        "flex items-start gap-2 text-sm",
                        isPro ? "text-zinc-300" : "text-zinc-600"
                      )}
                    >
                      <Check
                        className={cn(
                          "w-4 h-4 mt-0.5 shrink-0",
                          isPro ? "text-accent-glow" : "text-brand"
                        )}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.name === "enterprise" ? "/contact" : "/signup"}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 px-6 py-3 w-full text-sm",
                    isPro
                      ? "bg-white text-zinc-900 hover:bg-brand hover:text-white"
                      : "bg-zinc-900 text-white hover:bg-brand"
                  )}
                >
                  {tier.name === "free"
                    ? "Start free"
                    : tier.name === "enterprise"
                    ? "Contact sales"
                    : `Get ${tier.name}`}
                </Link>
              </TimelineContent>
            );
          })}
        </div>

        {/* Credit packs */}
        <TimelineContent
          as="div"
          animationNum={9}
          timelineRef={sectionRef}
          className="mt-12 max-w-3xl mx-auto rounded-2xl liquid-glass-light p-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="font-mono text-xs uppercase tracking-[0.2em] text-accent-deep mb-1">
                — Top up
              </div>
              <div className="font-display text-lg text-zinc-900">
                Need more credits? Buy in packs.
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {[
                ["100", "$5"],
                ["500", "$20"],
                ["1K", "$35"],
                ["2.5K", "$80"],
              ].map(([credits, price]) => (
                <div
                  key={credits}
                  className="px-3 py-2 rounded-lg bg-white/70 backdrop-blur-md border border-white/80 shadow-sm"
                >
                  <span className="text-zinc-900 font-semibold">{credits}</span>{" "}
                  <span className="text-zinc-400">·</span>{" "}
                  <span className="text-brand font-semibold">{price}</span>
                </div>
              ))}
            </div>
          </div>
        </TimelineContent>
      </div>
    </section>
  );
}
