"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Copy,
  Check,
  Twitter,
  Instagram,
  Mail,
  ArrowLeft,
  FileText,
  Image as ImageIcon,
  Lightbulb,
} from "lucide-react";
import type { Affiliate } from "@/types";
import { cn } from "@/lib/utils";

const PLAYBOOK_TEMPLATES = (link: string) => ({
  twitter: [
    `Just made a 5-second cinematic clip with one prompt on @wan_studio.

No After Effects. No FCPX. Just type → render.

Free credits to try: ${link}`,
    `Stopped paying for stock video. Now I generate exactly the shot I need on @wan_studio in ~30 seconds.

50 free credits to start: ${link}`,
    `If you make content and aren't using AI video gen yet, you're behind.

@wan_studio is the cleanest workflow I've found — Wan, Kling, Seedance, Veo all in one place.

${link}`,
  ],
  instagram: [
    `What if you could generate any video clip from a sentence?

I've been using Wan for client work and it's genuinely changing my workflow.

50 free credits via my link in bio (or ${link})

#aivideo #contentcreator #aitools`,
  ],
  email: [
    `Subject: This AI tool replaced 80% of my stock footage budget

Hey [Name],

Wanted to share something I've been using all month — wan.studio. It's an AI video generator that combines Wan, Kling, Seedance, and Veo under one credit balance.

Type a prompt → 30 seconds later you have a 5-10 second clip at 720p or 1080p. I've been using it for product launches, social cuts, and pitch decks.

If you want to try it, here's my link with 50 free credits:
${link}

— [Your name]`,
  ],
  blog: [
    `# Hands-on: 3 hours with Wan Studio

I've spent the last week testing Wan, an AI video generator that bundles every major model — Wan 2.5, Kling 2.1, Seedance 2.0, Veo 3 — under one credit balance.

## What's surprising

The model picker. Most AI video tools lock you into one provider; Wan lets you A/B between Seedance Pro and Kling Master on the same prompt and pick the better take. Game-changer for client work where you're trying to nail the exact vibe.

## What I made

[Embed your demos here]

## Try it

Free tier gives you 50 credits per month, no card required.

[Get started](${link})`,
  ],
});

const TIPS = [
  "Lead with a clip you generated, not a screenshot of the UI. Show, don't tell.",
  "Pick a niche — \"AI video for [DTC brands / wedding planners / D&D players]\". Generic AI promo gets ignored.",
  "Side-by-side: prompt + output. The before/after framing converts.",
  "Show your seed/prompt so viewers can recreate it. Drives shares.",
  "Time your posts to launches — if a new model drops on Wan, post a comparison thread that day.",
  "Track which platforms convert: TikTok hooks → IG saves → emails close. Different funnels.",
];

const ASSETS = [
  {
    name: "Hero banner (1200×628)",
    description: "Twitter/LinkedIn header. Brand purple + your code.",
    icon: ImageIcon,
  },
  {
    name: "Square card (1080×1080)",
    description: "IG feed / FB / Substack. Bold brand mark, your link.",
    icon: ImageIcon,
  },
  {
    name: "Story (1080×1920)",
    description: "IG/TikTok/Snap stories. Vertical CTA.",
    icon: ImageIcon,
  },
  {
    name: "Demo reel (mp4)",
    description: "30s sizzle clip showing 5 features. Drop into Reels/Shorts.",
    icon: FileText,
  },
];

export function MarketingMaterials({ affiliate }: { affiliate: Affiliate }) {
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const link = origin ? `${origin}/?ref=${affiliate.code}` : "";

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-10">
      <Link
        href="/dashboard/affiliate"
        className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-white/45 hover:text-white/80"
      >
        <ArrowLeft className="w-3 h-3" />
        Back to dashboard
      </Link>

      <div>
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-amber-300 mb-2">
          — Marketing kit
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          Materials & playbooks
        </h1>
        <p className="text-sm text-white/55 mt-2">
          Pre-written copy with your link baked in. Steal it, edit it, ship it.
        </p>
      </div>

      <CopyTemplates templates={PLAYBOOK_TEMPLATES(link)} />

      {/* Tips */}
      <section>
        <div className="font-mono text-[10px] uppercase tracking-wider text-white/40 mb-3 flex items-center gap-1.5">
          <Lightbulb className="w-3 h-3" />
          What works
        </div>
        <div className="rounded-2xl surface-raised p-6 space-y-3">
          {TIPS.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-white/75">
              <span className="font-mono text-[10px] text-amber-300/70 mt-0.5 shrink-0">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="leading-relaxed">{tip}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Asset placeholders */}
      <section>
        <div className="font-mono text-[10px] uppercase tracking-wider text-white/40 mb-3">
          Visual assets
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ASSETS.map((a) => {
            const Icon = a.icon;
            return (
              <div
                key={a.name}
                className="rounded-xl surface p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-white/55" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white">{a.name}</div>
                  <div className="text-xs text-white/45">{a.description}</div>
                </div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-white/30">
                  Soon
                </span>
              </div>
            );
          })}
        </div>
        <div className="text-xs font-mono text-white/30 text-center mt-4">
          Designer assets ship next sprint — for now, generate your own demos
          and use the copy above.
        </div>
      </section>
    </div>
  );
}

function CopyTemplates({
  templates,
}: {
  templates: ReturnType<typeof PLAYBOOK_TEMPLATES>;
}) {
  return (
    <section className="space-y-6">
      <Group icon={Twitter} title="Twitter / X" templates={templates.twitter} />
      <Group icon={Instagram} title="Instagram" templates={templates.instagram} />
      <Group icon={Mail} title="Email outreach" templates={templates.email} />
      <Group icon={FileText} title="Long-form / blog" templates={templates.blog} />
    </section>
  );
}

function Group({
  icon: Icon,
  title,
  templates,
}: {
  icon: typeof Twitter;
  title: string;
  templates: string[];
}) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-white/40 mb-3 flex items-center gap-1.5">
        <Icon className="w-3 h-3" />
        {title}
      </div>
      <div className="space-y-2">
        {templates.map((t, i) => (
          <CopyBox key={i} text={t} />
        ))}
      </div>
    </div>
  );
}

function CopyBox({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-xl surface p-4 flex gap-3">
      <pre className="flex-1 whitespace-pre-wrap text-sm text-white/80 leading-relaxed font-sans">
        {text}
      </pre>
      <button
        onClick={copy}
        className={cn(
          "shrink-0 self-start text-xs px-2.5 py-1 rounded-md border transition-colors",
          copied
            ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-200"
            : "border-white/15 text-white/65 hover:bg-white/[0.05] hover:text-white"
        )}
      >
        {copied ? (
          <Check className="w-3.5 h-3.5" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}
