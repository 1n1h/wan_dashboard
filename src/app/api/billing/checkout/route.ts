import { NextResponse } from "next/server";
import { z } from "zod";
import { stripe, TIER_PLANS, CREDIT_PACKS } from "@/lib/stripe";
import { getInsforgeServer } from "@/lib/insforge";
import { getSessionUser } from "@/lib/session";

const Body = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("subscription"),
    plan: z.enum(["starter", "pro"]),
  }),
  z.object({
    kind: z.literal("credit_pack"),
    pack: z.enum(["pack-100", "pack-500", "pack-1000", "pack-2500"]),
  }),
]);

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const sdk = await getInsforgeServer();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  // Reuse Stripe customer if we have one for this user.
  let customerId = user.stripe_customer_id ?? null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
    await sdk.database
      .from("users")
      .update({ stripe_customer_id: customerId })
      .eq("id", user.id);
  }

  if (parsed.data.kind === "subscription") {
    const plan = TIER_PLANS[parsed.data.plan];

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      line_items: [
        {
          price_data: {
            currency: "usd",
            recurring: { interval: "month" },
            unit_amount: plan.monthlyPriceCents,
            product_data: {
              name: plan.name,
              description: plan.description,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}&success=1`,
      cancel_url: `${appUrl}/dashboard/billing?canceled=1`,
      metadata: {
        kind: "subscription",
        plan: parsed.data.plan,
        user_id: user.id,
      },
      subscription_data: {
        metadata: {
          plan: parsed.data.plan,
          user_id: user.id,
        },
      },
      // Allow promotion codes for influencer promos
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  }

  // One-off credit pack
  const pack = CREDIT_PACKS[parsed.data.pack];

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: pack.cents,
          product_data: {
            name: `${pack.credits.toLocaleString()} credit ${pack.label}`,
            description: `One-time top-up · ${pack.credits.toLocaleString()} credits added to your balance`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}&success=1`,
    cancel_url: `${appUrl}/dashboard/billing?canceled=1`,
    metadata: {
      kind: "credit_pack",
      pack: parsed.data.pack,
      credits: String(pack.credits),
      user_id: user.id,
    },
    payment_intent_data: {
      metadata: {
        kind: "credit_pack",
        pack: parsed.data.pack,
        credits: String(pack.credits),
        user_id: user.id,
      },
    },
  });

  return NextResponse.json({ url: session.url });
}
