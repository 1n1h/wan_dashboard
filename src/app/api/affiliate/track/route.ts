import { NextResponse } from "next/server";
import { z } from "zod";
import { getInsforgeAnon } from "@/lib/insforge";
import { hashIp, AFFILIATE_CONFIG } from "@/lib/affiliate";
import { cookies } from "next/headers";

const Body = z.object({
  code: z.string().min(3).max(60),
  landing_path: z.string().optional(),
  referrer: z.string().optional(),
});

/**
 * POST /api/affiliate/track
 *
 * Called from the landing page when ?ref=CODE is in the URL. Records the
 * click and stamps the visitor with a `wan_ref` cookie that signup later
 * reads to attribute the user.
 *
 * Anonymous endpoint — no auth required.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const sdk = getInsforgeAnon();

  const { data: matches } = await sdk.database
    .from("affiliates")
    .select("id, code, status")
    .eq("code", parsed.data.code)
    .limit(1);

  const affiliate = matches?.[0] as
    | { id: string; code: string; status: string }
    | undefined;

  if (!affiliate || affiliate.status !== "active") {
    // Don't 404 — just no-op so the page keeps rendering.
    return NextResponse.json({ ok: true, matched: false });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "0.0.0.0";

  await sdk.database.from("affiliate_clicks").insert([
    {
      affiliate_id: affiliate.id,
      ip_hash: await hashIp(ip),
      user_agent: req.headers.get("user-agent")?.slice(0, 256) ?? null,
      referrer: parsed.data.referrer?.slice(0, 512) ?? null,
      landing_path: parsed.data.landing_path?.slice(0, 256) ?? null,
    },
  ]);

  // Stamp attribution cookie so signup can find it.
  const cookieStore = await cookies();
  cookieStore.set(AFFILIATE_CONFIG.cookieName, affiliate.code, {
    httpOnly: false, // readable client-side too for transparency
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AFFILIATE_CONFIG.cookieDays * 24 * 60 * 60,
  });

  return NextResponse.json({ ok: true, matched: true });
}
