import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-zinc-100 py-16 bg-white/40 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
                <span className="font-display font-bold text-white text-sm">W</span>
              </div>
              <span className="font-display font-semibold tracking-tight text-lg text-zinc-900">
                wan<span className="text-brand">.</span>
              </span>
            </div>
            <p className="text-sm text-zinc-600 max-w-xs leading-relaxed mb-4">
              Studio-quality AI video for creators, marketers, and educators.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-slow" />
              All systems operational
            </div>
          </div>

          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-zinc-900 mb-4">
              Product
            </div>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li><a href="#features" className="hover:text-zinc-900">Features</a></li>
              <li><a href="#pricing" className="hover:text-zinc-900">Pricing</a></li>
              <li><Link href="/changelog" className="hover:text-zinc-900">Changelog</Link></li>
              <li><Link href="/api" className="hover:text-zinc-900">API</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-zinc-900 mb-4">
              Company
            </div>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li><Link href="/about" className="hover:text-zinc-900">About</Link></li>
              <li><Link href="/blog" className="hover:text-zinc-900">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-zinc-900">Contact</Link></li>
            </ul>
          </div>

          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-zinc-900 mb-4">
              Legal
            </div>
            <ul className="space-y-2 text-sm text-zinc-600">
              <li><Link href="/terms" className="hover:text-zinc-900">Terms</Link></li>
              <li><Link href="/privacy" className="hover:text-zinc-900">Privacy</Link></li>
              <li><Link href="/dmca" className="hover:text-zinc-900">DMCA</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-100 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-zinc-500">
          <div>© {new Date().getFullYear()} Wan. Powered by WanAnimate via Replicate.</div>
          <div>v0.1.0 · build {new Date().toISOString().slice(0, 10)}</div>
        </div>
      </div>
    </footer>
  );
}
