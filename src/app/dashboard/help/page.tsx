import Link from "next/link";
import {
  BookOpen,
  MessageCircle,
  Mail,
  ArrowUpRight,
  Sparkles,
  Coins,
  Type,
  Wand2,
} from "lucide-react";

const RESOURCES = [
  {
    icon: BookOpen,
    title: "Documentation",
    description: "Full guides for every feature, prompt patterns, and the API.",
    href: "https://docs.wan.studio",
    external: true,
  },
  {
    icon: MessageCircle,
    title: "Discord community",
    description: "Trade prompts, see what others are making, get fast answers.",
    href: "https://discord.gg/wan",
    external: true,
  },
  {
    icon: Mail,
    title: "Email support",
    description: "Pro+ get priority. Free tier responses within 48h.",
    href: "mailto:hello@wan.studio",
    external: false,
  },
];

const QUICK_ANSWERS = [
  {
    q: "How do credits work?",
    a: "Each render costs credits based on the feature, resolution, and duration. Free tier renews 50/month. Failed generations are auto-refunded.",
    icon: Coins,
  },
  {
    q: "Why do my renders take so long?",
    a: "T2V at 720p completes in 25-45s. 1080p takes 60-90s. Pro tier gets priority GPU allocation, so queue time stays near zero during peak hours.",
    icon: Wand2,
  },
  {
    q: "What makes a good prompt?",
    a: "Verbs over adjectives. Specify the lens (35mm anamorphic, drone overhead). Lock a seed once you like a result, then iterate around it.",
    icon: Type,
  },
];

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-12">
      <div>
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-white/35 mb-2">
          — Help
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          How can we help?
        </h1>
        <p className="text-sm text-white/55 mt-2">
          Docs, community, and answers to the most common questions.
        </p>
      </div>

      {/* Resources */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {RESOURCES.map((r) => {
          const Icon = r.icon;
          return (
            <a
              key={r.title}
              href={r.href}
              target={r.external ? "_blank" : undefined}
              rel={r.external ? "noopener noreferrer" : undefined}
              className="group rounded-2xl surface-raised p-5 hover:border-white/15 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center group-hover:bg-white/[0.08] transition-colors">
                  <Icon className="w-4 h-4 text-brand-glow" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-white/70 transition-colors" />
              </div>
              <div className="font-medium text-white mb-1">{r.title}</div>
              <div className="text-xs text-white/55 leading-relaxed">{r.description}</div>
            </a>
          );
        })}
      </section>

      {/* Quick answers */}
      <section>
        <div className="font-mono text-[10px] uppercase tracking-wider text-white/40 mb-4">
          Quick answers
        </div>
        <div className="space-y-3">
          {QUICK_ANSWERS.map((a) => {
            const Icon = a.icon;
            return (
              <div key={a.q} className="rounded-2xl surface p-5 flex gap-4">
                <div className="shrink-0 w-9 h-9 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
                  <Icon className="w-4 h-4 text-brand-glow" />
                </div>
                <div>
                  <div className="font-medium text-white mb-1">{a.q}</div>
                  <div className="text-sm text-white/65 leading-relaxed">{a.a}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="rounded-2xl surface-raised p-8 text-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand/15 border border-brand/30 mb-3">
          <Sparkles className="w-3 h-3 text-brand-glow" />
          <span className="text-[10px] font-mono uppercase tracking-wider text-brand-glow">
            Still stuck?
          </span>
        </div>
        <div className="font-display text-xl text-white mb-2">We&apos;ll help you ship.</div>
        <div className="text-sm text-white/55 mb-5 max-w-sm mx-auto">
          Drop us a line — Pro+ tickets get bumped to the top of the queue.
        </div>
        <div className="flex justify-center gap-2 flex-wrap">
          <a href="mailto:hello@wan.studio" className="btn btn-primary text-sm">
            <Mail className="w-3.5 h-3.5" />
            Email us
          </a>
          <Link href="/dashboard/billing" className="btn btn-ghost text-sm">
            Upgrade for priority
          </Link>
        </div>
      </section>
    </div>
  );
}
