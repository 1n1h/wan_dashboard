import Link from "next/link";
import { Check, Coins, Receipt } from "lucide-react";
import { TIERS } from "@/types";
import { getSessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";
import { CheckoutButton, UpgradeButton } from "@/components/dashboard/BillingButtons";

const CREDIT_PACKS: ReadonlyArray<{
  id: "pack-100" | "pack-500" | "pack-1000" | "pack-2500";
  credits: number;
  cents: number;
  label: string;
  popular?: boolean;
}> = [
  { id: "pack-100", credits: 100, cents: 500, label: "Starter pack" },
  { id: "pack-500", credits: 500, cents: 2000, label: "Studio pack", popular: true },
  { id: "pack-1000", credits: 1000, cents: 3500, label: "Creator pack" },
  { id: "pack-2500", credits: 2500, cents: 8000, label: "Agency pack" },
];

export default async function BillingPage() {
  const user = await getSessionUser();
  const currentTier = user?.tier ?? "free";
  const credits = user?.credits_remaining ?? 0;

  return (
    <div className="max-w-screen-2xl mx-auto p-6 md:p-10 space-y-10">
      <div>
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-white/35 mb-2">
          — Billing
        </div>
        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          Billing & credits
        </h1>
        <p className="text-sm text-white/55 mt-2">
          Manage your tier, top up credits, and view past invoices.
        </p>
      </div>

      {/* Current state */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl surface-raised p-6">
          <div className="font-mono text-[10px] uppercase tracking-wider text-white/40 mb-2">
            Current tier
          </div>
          <div className="font-display text-2xl text-white capitalize mb-1">
            {currentTier}
          </div>
          <div className="text-xs text-white/50">
            {currentTier === "free"
              ? "50 credits / month, 480p, watermarked output."
              : currentTier === "starter"
              ? "500 credits / month, 720p, no watermark."
              : currentTier === "pro"
              ? "2000 credits / month, 1080p, all features, priority queue."
              : "Custom credits, fine-tuning, dedicated support."}
          </div>
        </div>

        <div className="rounded-2xl surface-raised p-6">
          <div className="font-mono text-[10px] uppercase tracking-wider text-white/40 mb-2">
            Credit balance
          </div>
          <div className="flex items-center gap-2 mb-1">
            <Coins className="w-5 h-5 text-amber-300" />
            <div className="font-display text-2xl text-white">
              {credits.toLocaleString()}
            </div>
          </div>
          <div className="text-xs text-white/50">
            Resets monthly on tier renewal date.
          </div>
        </div>

        <div className="rounded-2xl surface-raised p-6">
          <div className="font-mono text-[10px] uppercase tracking-wider text-white/40 mb-2">
            Next renewal
          </div>
          <div className="font-display text-2xl text-white mb-1">
            {currentTier === "free" ? "Auto" : "—"}
          </div>
          <div className="text-xs text-white/50">
            {currentTier === "free"
              ? "Free tier resets on the 1st of each month."
              : "Subscription not active. Check back after Stripe is wired."}
          </div>
        </div>
      </section>

      {/* Tier ladder */}
      <section>
        <div className="flex items-end justify-between mb-4 gap-2 flex-wrap">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/40 mb-1">
              Plans
            </div>
            <div className="font-display text-xl text-white">Pick a tier</div>
          </div>
          <div className="text-xs text-white/45 font-mono">
            Powered by Stripe · cancel anytime
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {TIERS.map((tier) => {
            const isCurrent = tier.name === currentTier;
            const isPro = tier.name === "pro";
            const price =
              tier.name === "enterprise"
                ? "Custom"
                : tier.monthly_price_cents === 0
                ? "$0"
                : `$${(tier.monthly_price_cents / 100).toFixed(0)}`;

            return (
              <div
                key={tier.id}
                className={cn(
                  "relative rounded-2xl p-5 flex flex-col transition-all",
                  isPro && !isCurrent && "border border-brand/30 bg-gradient-to-b from-brand/10 to-transparent",
                  !isPro && !isCurrent && "surface",
                  isCurrent &&
                    "bg-emerald-500/10 border border-emerald-500/30"
                )}
              >
                {isCurrent && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-emerald-500 text-[10px] font-mono uppercase tracking-wider text-emerald-950 font-bold">
                    Current
                  </div>
                )}
                {isPro && !isCurrent && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-brand-gradient text-[10px] font-mono uppercase tracking-wider text-white font-bold">
                    Most popular
                  </div>
                )}

                <div className="mb-4">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1">
                    {tier.name}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="font-display text-3xl font-bold text-white">{price}</span>
                    {tier.name !== "enterprise" && tier.monthly_price_cents > 0 && (
                      <span className="text-xs text-white/45">/mo</span>
                    )}
                  </div>
                  {tier.monthly_credits > 0 && (
                    <div className="mt-0.5 text-xs text-white/55">
                      {tier.monthly_credits.toLocaleString()} credits / mo
                    </div>
                  )}
                </div>

                <ul className="space-y-1.5 mb-5 flex-1 text-xs text-white/65">
                  {tier.features.slice(0, 5).map((f) => (
                    <li key={f} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-brand-glow mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <UpgradeButton
                  plan={tier.name}
                  isCurrent={isCurrent}
                  isPro={isPro}
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* Credit packs */}
      <section>
        <div className="flex items-end justify-between mb-4 gap-2 flex-wrap">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/40 mb-1">
              Credit packs
            </div>
            <div className="font-display text-xl text-white">Top up anytime</div>
          </div>
          <div className="text-xs text-white/45 font-mono">
            One-off · Stripe checkout · never expire
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CREDIT_PACKS.map((pack) => (
            <div
              key={pack.credits}
              className={cn(
                "relative rounded-xl p-5 transition-all",
                pack.popular
                  ? "border border-amber-500/30 bg-gradient-to-b from-amber-500/10 to-transparent"
                  : "surface surface-hover"
              )}
            >
              {pack.popular && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-amber-500 text-[10px] font-mono uppercase tracking-wider text-amber-950 font-bold">
                  Best value
                </div>
              )}
              <div className="font-mono text-[10px] uppercase tracking-wider text-white/40 mb-2">
                {pack.label}
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display text-2xl font-bold text-white">
                  {pack.credits.toLocaleString()}
                </span>
                <span className="text-xs text-white/45">cr</span>
              </div>
              <div className="text-sm text-amber-300 font-mono mb-4">
                ${(pack.cents / 100).toFixed(0)}
              </div>
              <CheckoutButton
                body={{ kind: "credit_pack", pack: pack.id }}
                className="btn-glass w-full text-xs"
              >
                Add credits
              </CheckoutButton>
            </div>
          ))}
        </div>
      </section>

      {/* Invoices placeholder */}
      <section>
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-white/40 mb-1">
              Invoices
            </div>
            <div className="font-display text-xl text-white">Receipts</div>
          </div>
        </div>
        <div className="rounded-2xl surface-raised p-12 text-center">
          <Receipt className="w-8 h-8 text-white/30 mx-auto mb-3" />
          <div className="text-sm text-white/55">
            No invoices yet. Once you subscribe or top up, they appear here.
          </div>
        </div>
      </section>

      <p className="text-center text-xs font-mono text-white/30">
        Need a custom plan?{" "}
        <Link href="/contact" className="text-white/60 hover:text-white">
          Contact sales →
        </Link>
      </p>
    </div>
  );
}
