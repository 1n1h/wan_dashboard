import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { createClient } from "@insforge/sdk";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
  }

  const sdk = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    isServerMode: true,
  });

  const { data, error } = await sdk.auth.signInWithPassword(parsed.data);

  // Detect "email verification required" error and pivot the UI into the OTP flow.
  if (error) {
    const msg = error.message ?? "";
    const needsVerify = /verif/i.test(msg) || /not verified/i.test(msg);
    if (needsVerify) {
      // Auto-resend a fresh code so the user always has a usable one.
      await sdk.auth.resendVerificationEmail({ email: parsed.data.email }).catch(() => {});
      return NextResponse.json({
        requireEmailVerification: true,
        email: parsed.data.email,
      });
    }
    return NextResponse.json({ error: msg || "Login failed" }, { status: 401 });
  }

  if (!data?.accessToken || !data.user) {
    return NextResponse.json({ error: "Login failed" }, { status: 401 });
  }

  // Mirror auth.users → public.users on first sign-in if not already present.
  const authedSdk = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    isServerMode: true,
    edgeFunctionToken: data.accessToken,
  });

  const { data: existing } = await authedSdk.database
    .from("users")
    .select("id")
    .eq("id", data.user.id)
    .limit(1);

  if (!existing || existing.length === 0) {
    // Check for affiliate attribution cookie
    const refCookie = (await cookies()).get("wan_ref")?.value;
    let refAffiliateId: string | null = null;

    if (refCookie) {
      const { data: matches } = await authedSdk.database
        .from("affiliates")
        .select("id, status")
        .eq("code", refCookie)
        .limit(1);
      const aff = matches?.[0] as { id: string; status: string } | undefined;
      if (aff && aff.status === "active") {
        refAffiliateId = aff.id;
      }
    }

    await authedSdk.database
      .from("users")
      .insert([
        {
          id: data.user.id,
          email: data.user.email,
          tier: "free",
          credits_remaining: 50,
          ...(refAffiliateId
            ? { referred_by_affiliate_id: refAffiliateId }
            : {}),
        },
      ]);

    // Record the signup conversion for the affiliate (no payout yet — kicks
    // in when they make a qualifying purchase).
    if (refAffiliateId) {
      await authedSdk.database.from("affiliate_conversions").insert([
        {
          affiliate_id: refAffiliateId,
          referred_user_id: data.user.id,
          conversion_type: "signup",
          amount_cents: 0,
          commission_cents: 0,
          status: "pending",
        },
      ]);
    }
  }

  const cookieStore = await cookies();
  cookieStore.set("wan_session", data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ user: data.user });
}
