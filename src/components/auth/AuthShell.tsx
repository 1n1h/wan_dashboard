import Link from "next/link";
import { VideoBackground } from "@/components/ui/video-background";

// Local file in /public; swap to a CDN URL once bundle size becomes a concern.
const AUTH_VIDEO_URL = "/auth-bg.mp4";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-4 py-12 text-white overflow-hidden">
      <VideoBackground videoUrl={AUTH_VIDEO_URL} />

      <div className="relative z-20 w-full max-w-lg animate-fade-in">
        <div className="p-10 rounded-2xl backdrop-blur-md bg-black/55 border border-white/10 shadow-[0_24px_64px_-16px_rgba(0,0,0,0.6)]">
          {/* Brand header with animated glow */}
          <Link
            href="/"
            className="block mb-8 text-center group"
          >
            <h2 className="text-3xl font-bold mb-2 relative">
              <span className="absolute -inset-2 bg-gradient-to-r from-brand/40 via-warm/30 to-accent/40 blur-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-700 animate-pulse-slow"></span>
              <span className="relative inline-flex items-center gap-2 font-display tracking-tight text-white">
                <span className="w-9 h-9 rounded-lg bg-brand-gradient flex items-center justify-center text-base">
                  W
                </span>
                wan<span className="text-brand-glow">.</span>
              </span>
            </h2>
            <p className="text-white/70 text-sm">{subtitle}</p>
          </Link>

          {/* Section header */}
          <div className="mb-6 text-center">
            <h1 className="font-display text-xl font-semibold text-white">{title}</h1>
          </div>

          {children}

          <p className="mt-8 text-center text-sm text-white/60">{footer}</p>
        </div>
      </div>

      <footer className="absolute bottom-4 left-0 right-0 text-center text-xs font-mono text-white/40 z-20 uppercase tracking-wider">
        © {new Date().getFullYear()} Wan · Studio-quality AI video
      </footer>
    </div>
  );
}
