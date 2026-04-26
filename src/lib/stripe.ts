import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  // Don't throw at import time so build/typecheck don't fail; runtime check
  // happens in the route handlers that actually call the SDK.
  console.warn("STRIPE_SECRET_KEY missing — billing routes will fail until set.");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "sk_test_placeholder", {
  // Pin to the SDK's expected version. Bump intentionally and test on bump.
  apiVersion: "2026-04-22.dahlia",
});

/**
 * Tier subscription catalog. Inline price_data is used at checkout time, so
 * no Stripe Dashboard product setup is required — what you see here is what
 * shows on the user's checkout page.
 */
export type TierPlan = "starter" | "pro";

export const TIER_PLANS: Record<TierPlan, {
  name: string;
  monthlyPriceCents: number;
  monthlyCredits: number;
  description: string;
}> = {
  starter: {
    name: "Wan Starter",
    monthlyPriceCents: 1900,
    monthlyCredits: 500,
    description: "500 credits/mo · 720p · all features except Pro+",
  },
  pro: {
    name: "Wan Pro",
    monthlyPriceCents: 5900,
    monthlyCredits: 2000,
    description: "2000 credits/mo · 1080p · Face-Swap · Motion · Editing · priority queue",
  },
};

/**
 * One-off credit-pack catalog.
 */
export type CreditPackId = "pack-100" | "pack-500" | "pack-1000" | "pack-2500";

export const CREDIT_PACKS: Record<CreditPackId, {
  credits: number;
  cents: number;
  label: string;
}> = {
  "pack-100":  { credits: 100,  cents: 500,  label: "Starter pack" },
  "pack-500":  { credits: 500,  cents: 2000, label: "Studio pack" },
  "pack-1000": { credits: 1000, cents: 3500, label: "Creator pack" },
  "pack-2500": { credits: 2500, cents: 8000, label: "Agency pack" },
};
