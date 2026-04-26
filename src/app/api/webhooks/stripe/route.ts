import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe, TIER_PLANS, type TierPlan } from "@/lib/stripe";
import { getInsforgeAnon } from "@/lib/insforge";
import { AFFILIATE_CONFIG } from "@/lib/affiliate";

export const runtime = "nodejs";
// Stripe needs the raw body for signature verification — disable Next's parsing.
export const dynamic = "force-dynamic";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, WEBHOOK_SECRET);
  } catch (err) {
    return NextResponse.json(
      { error: `Invalid signature: ${err instanceof Error ? err.message : String(err)}` },
      { status: 400 }
    );
  }

  const sdk = getInsforgeAnon();

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, sdk);
        break;
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice, sdk);
        break;
      case "customer.subscription.deleted":
      case "customer.subscription.updated":
        await handleSubscriptionChange(
          event.data.object as Stripe.Subscription,
          sdk
        );
        break;
      default:
        // Ignore unhandled events; Stripe retries are fine.
        break;
    }
  } catch (err) {
    // Log + return 500 so Stripe retries.
    console.error("Stripe webhook handler error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

// ─── Handlers ───────────────────────────────────────────────────────────────

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  sdk: ReturnType<typeof getInsforgeAnon>
) {
  const userId = session.client_reference_id ?? session.metadata?.user_id;
  if (!userId) {
    console.warn("checkout.session.completed missing user_id");
    return;
  }

  const kind = session.metadata?.kind;

  if (kind === "credit_pack") {
    const credits = Number(session.metadata?.credits ?? 0);
    if (!credits) return;

    // Add credits + record purchase
    const { data: userRows } = await sdk.database
      .from("users")
      .select("credits_remaining, credits_purchased, referred_by_affiliate_id")
      .eq("id", userId)
      .limit(1);
    const u = userRows?.[0] as
      | {
          credits_remaining: number;
          credits_purchased: number;
          referred_by_affiliate_id: string | null;
        }
      | undefined;
    if (!u) return;

    await sdk.database
      .from("users")
      .update({
        credits_remaining: u.credits_remaining + credits,
        credits_purchased: u.credits_purchased + credits,
      })
      .eq("id", userId);

    await sdk.database.from("credit_purchases").insert([
      {
        user_id: userId,
        stripe_payment_intent_id: session.payment_intent as string,
        credits_purchased: credits,
        amount_cents: session.amount_total ?? 0,
        status: "completed",
        completed_at: new Date().toISOString(),
      },
    ]);

    if (u.referred_by_affiliate_id) {
      await recordAffiliateConversion({
        sdk,
        affiliateId: u.referred_by_affiliate_id,
        userId,
        type: "first_purchase",
        amountCents: session.amount_total ?? 0,
      });
    }
    return;
  }

  if (kind === "subscription") {
    const plan = session.metadata?.plan as TierPlan | undefined;
    if (!plan || !(plan in TIER_PLANS)) return;

    const subscriptionId = session.subscription as string;
    const planDef = TIER_PLANS[plan];

    const { data: userRows } = await sdk.database
      .from("users")
      .select("credits_remaining, referred_by_affiliate_id")
      .eq("id", userId)
      .limit(1);
    const u = userRows?.[0] as
      | { credits_remaining: number; referred_by_affiliate_id: string | null }
      | undefined;
    if (!u) return;

    await sdk.database
      .from("users")
      .update({
        tier: plan,
        stripe_subscription_id: subscriptionId,
        stripe_subscription_status: "active",
        tier_start_date: new Date().toISOString(),
        // Top up to the plan's monthly grant
        credits_remaining: Math.max(u.credits_remaining, planDef.monthlyCredits),
      })
      .eq("id", userId);

    if (u.referred_by_affiliate_id) {
      const commission =
        Math.round((session.amount_total ?? 0) * (AFFILIATE_CONFIG.recurringRate / 100));
      await recordAffiliateConversion({
        sdk,
        affiliateId: u.referred_by_affiliate_id,
        userId,
        type: "subscription",
        amountCents: session.amount_total ?? 0,
        commissionCents: commission,
      });
    }
  }
}

async function handleInvoicePaid(
  invoice: Stripe.Invoice,
  sdk: ReturnType<typeof getInsforgeAnon>
) {
  // Renewals: top up monthly credits, log conversion if affiliate.
  // Stripe deprecated `Invoice.subscription` in newer API versions; the
  // expanded field is `parent.subscription_details.subscription` for sub
  // invoices. Read both for compatibility.
  type InvoiceWithSub = Stripe.Invoice & {
    subscription?: string | null;
    parent?: {
      subscription_details?: { subscription?: string | null } | null;
    } | null;
  };
  const inv = invoice as InvoiceWithSub;
  const subscriptionId =
    inv.subscription ?? inv.parent?.subscription_details?.subscription ?? null;
  if (!subscriptionId) return;

  const { data: userRows } = await sdk.database
    .from("users")
    .select("id, tier, credits_remaining, referred_by_affiliate_id")
    .eq("stripe_subscription_id", subscriptionId)
    .limit(1);
  const u = userRows?.[0] as
    | {
        id: string;
        tier: string;
        credits_remaining: number;
        referred_by_affiliate_id: string | null;
      }
    | undefined;
  if (!u) return;

  const planDef = TIER_PLANS[u.tier as TierPlan];
  if (planDef) {
    await sdk.database
      .from("users")
      .update({
        credits_remaining: planDef.monthlyCredits,
      })
      .eq("id", u.id);
  }

  if (u.referred_by_affiliate_id && (invoice.amount_paid ?? 0) > 0) {
    const commission = Math.round(
      (invoice.amount_paid ?? 0) * (AFFILIATE_CONFIG.recurringRate / 100)
    );
    await recordAffiliateConversion({
      sdk,
      affiliateId: u.referred_by_affiliate_id,
      userId: u.id,
      type: "renewal",
      amountCents: invoice.amount_paid ?? 0,
      commissionCents: commission,
    });
  }
}

async function handleSubscriptionChange(
  sub: Stripe.Subscription,
  sdk: ReturnType<typeof getInsforgeAnon>
) {
  const status = sub.status; // "active" | "canceled" | "past_due" | etc.
  await sdk.database
    .from("users")
    .update({
      stripe_subscription_status: status,
      ...(status === "canceled" || sub.cancel_at_period_end
        ? { tier: "free" as const }
        : {}),
    })
    .eq("stripe_subscription_id", sub.id);
}

async function recordAffiliateConversion({
  sdk,
  affiliateId,
  userId,
  type,
  amountCents,
  commissionCents,
}: {
  sdk: ReturnType<typeof getInsforgeAnon>;
  affiliateId: string;
  userId: string;
  type: "first_purchase" | "subscription" | "renewal";
  amountCents: number;
  commissionCents?: number;
}) {
  // Look up affiliate's commission rate
  const { data: affs } = await sdk.database
    .from("affiliates")
    .select("commission_rate, total_earned_cents")
    .eq("id", affiliateId)
    .limit(1);
  const aff = affs?.[0] as
    | { commission_rate: number; total_earned_cents: number }
    | undefined;
  if (!aff) return;

  const computedCommission =
    commissionCents ?? Math.round(amountCents * (aff.commission_rate / 100));

  // Insert idempotently — UNIQUE constraint catches dupes
  const { error } = await sdk.database.from("affiliate_conversions").insert([
    {
      affiliate_id: affiliateId,
      referred_user_id: userId,
      conversion_type: type,
      amount_cents: amountCents,
      commission_cents: computedCommission,
      status: "approved",
    },
  ]);
  if (error) return; // duplicate or transient

  // Bump the affiliate's running total
  await sdk.database
    .from("affiliates")
    .update({
      total_earned_cents: aff.total_earned_cents + computedCommission,
    })
    .eq("id", affiliateId);
}
