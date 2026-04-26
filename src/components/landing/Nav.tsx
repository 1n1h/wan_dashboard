"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-3 left-0 right-0 z-50 px-3 md:px-0">
      <div
        className={cn(
          "max-w-5xl mx-auto rounded-2xl flex justify-between items-center px-2 md:px-3 py-2 transition-all duration-300",
          scrolled
            ? "glass-light shadow-[0_8px_24px_rgba(0,0,0,0.06)]"
            : "bg-white/40 backdrop-blur-xl border border-zinc-100"
        )}
      >
        <Link
          href="/"
          className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/60 transition-colors"
        >
          <div className="relative w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
            <span className="font-display font-bold text-white text-sm">W</span>
          </div>
          <span className="font-display font-semibold tracking-tight text-lg text-zinc-900">
            wan<span className="text-brand">.</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 text-sm text-zinc-600">
          {[
            ["Features", "#features"],
            ["Pricing", "#pricing"],
            ["Use cases", "#use-cases"],
            ["FAQ", "#faq"],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="px-3 py-1.5 rounded-lg hover:bg-white/70 hover:text-zinc-900 transition-colors"
            >
              {label}
            </a>
          ))}
          <a
            href="#affiliate"
            className="ml-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100/80 border border-amber-300/60 text-amber-900 hover:bg-amber-100 hover:border-amber-400 transition-colors"
          >
            <span className="font-medium">Affiliate</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900 border border-amber-400/50">
              25%
            </span>
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="text-sm text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded-lg hover:bg-white/70 hidden sm:inline-block transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="btn-primary-light text-sm py-2 px-4"
          >
            Try free
          </Link>
        </div>
      </div>
    </header>
  );
}
