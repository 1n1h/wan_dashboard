import Link from "next/link";
import {
  ArrowUpRight,
  Type,
  Image as ImageIcon,
  Wand2,
  Activity,
  Users,
  Sparkles,
} from "lucide-react";

type Quickstart = {
  label: string;
  icon: typeof Type;
  href: string;
  cost: string;
  code: string;
  videoSrc: string; // swap these to /qs-<code>.mp4 once real videos are produced
  tint: string; // tailwind color tokens for the overlay gradient
};

const QUICK_ACTIONS: Quickstart[] = [
  {
    label: "Text-to-Video",
    icon: Type,
    href: "/dashboard/t2v",
    cost: "8 cr",
    code: "t2v",
    videoSrc: "/auth-bg.mp4",
    tint: "from-violet-500/40 via-transparent to-fuchsia-500/30",
  },
  {
    label: "Image-to-Video",
    icon: ImageIcon,
    href: "/dashboard/i2v",
    cost: "10 cr",
    code: "i2v",
    videoSrc: "/auth-bg.mp4",
    tint: "from-cyan-500/40 via-transparent to-blue-500/30",
  },
  {
    label: "Face-Swap",
    icon: Users,
    href: "/dashboard/face-swap",
    cost: "15 cr",
    code: "swap",
    videoSrc: "/auth-bg.mp4",
    tint: "from-emerald-500/40 via-transparent to-teal-500/30",
  },
  {
    label: "Motion Control",
    icon: Activity,
    href: "/dashboard/motion",
    cost: "varies",
    code: "motion",
    videoSrc: "/auth-bg.mp4",
    tint: "from-amber-500/40 via-transparent to-orange-500/30",
  },
  {
    label: "Editing",
    icon: Wand2,
    href: "/dashboard/editing",
    cost: "12 cr",
    code: "edit",
    videoSrc: "/auth-bg.mp4",
    tint: "from-rose-500/40 via-transparent to-pink-500/30",
  },
];

export default function DashboardHome() {
  return (
    <div className="max-w-screen-2xl mx-auto p-6 md:p-10">
      <div className="mb-10">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-white/35 mb-2">
          — Welcome back
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
          What are we making today?
        </h1>
      </div>

      {/* Quickstart grid */}
      <section className="mb-12">
        <div className="text-xs font-mono uppercase tracking-wider text-white/35 mb-3">
          Quick start
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
          {QUICK_ACTIONS.map((a) => (
            <QuickstartCard key={a.code} action={a} />
          ))}
        </div>
      </section>

      {/* Recent + tips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <div className="text-xs font-mono uppercase tracking-wider text-white/35 mb-3">
            Recent generations
          </div>
          <div className="rounded-2xl surface-raised p-12 text-center">
            <div className="text-white/70 mb-1">No videos yet</div>
            <div className="text-xs text-white/40 mb-5">Your renders will show up here.</div>
            <Link href="/dashboard/t2v" className="btn btn-primary text-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Generate your first
            </Link>
          </div>
        </section>

        <aside>
          <div className="text-xs font-mono uppercase tracking-wider text-white/35 mb-3">
            Tips
          </div>
          <div className="rounded-2xl surface-raised p-5 space-y-4 text-sm">
            <div>
              <div className="font-medium text-white mb-1">Prompt with verbs.</div>
              <div className="text-white/55 text-xs leading-relaxed">
                &ldquo;walking through&rdquo;, &ldquo;crashing into&rdquo;, &ldquo;dissolving into smoke&rdquo;.
              </div>
            </div>
            <div>
              <div className="font-medium text-white mb-1">Specify the lens.</div>
              <div className="text-white/55 text-xs leading-relaxed">
                35mm anamorphic, drone overhead, FPV chase — say it.
              </div>
            </div>
            <div>
              <div className="font-medium text-white mb-1">Iterate with seeds.</div>
              <div className="text-white/55 text-xs leading-relaxed">
                Lock a seed once you like it, then tweak prompts around it.
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function QuickstartCard({ action }: { action: Quickstart }) {
  const Icon = action.icon;
  return (
    <Link
      href={action.href}
      className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-white/[0.06] hover:border-white/20 hover:shadow-[0_24px_48px_-16px_rgba(0,0,0,0.5)] transition-all"
    >
      {/* Background video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        src={action.videoSrc}
        className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-700"
      />

      {/* Color tint */}
      <div className={`absolute inset-0 bg-gradient-to-br ${action.tint} mix-blend-overlay`} />

      {/* Dark legibility scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

      {/* Top-right code chip */}
      <div className="absolute top-3 right-3 px-2 py-1 rounded-md bg-white/10 backdrop-blur-sm font-mono text-[10px] font-semibold text-white/90 tracking-wider border border-white/10">
        {action.code.toUpperCase()}
      </div>

      {/* Top-left icon */}
      <div className="absolute top-3 left-3 w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>

      {/* Bottom label */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="font-display font-semibold text-base md:text-lg text-white leading-tight">
              {action.label}
            </div>
            <div className="font-mono text-[11px] text-white/65 mt-1">
              {action.cost} per gen
            </div>
          </div>
          <div className="w-9 h-9 shrink-0 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center group-hover:bg-white/25 group-hover:border-white/30 transition-colors">
            <ArrowUpRight className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>
    </Link>
  );
}
