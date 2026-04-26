import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { createClient } from "@insforge/sdk";

const Body = z.object({
  email: z.string().email(),
  otp: z.string().min(4).max(10),
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
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const sdk = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    isServerMode: true,
  });

  const { data, error } = await sdk.auth.verifyEmail(parsed.data);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data?.accessToken || !data.user) {
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }

  // Mirror auth.users → public.users now that we have a valid token.
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
    const refCookie = (await cookies()).get("wan_ref")?.value;
    let refAffiliateId: string | null = null;

    if (refCookie) {
      const { data: matches } = await authedSdk.database
        .from("affiliates")
        .select("id, status")
        .eq("code", refCookie)
        .limit(1);
      const aff = matches?.[0] as { id: string; status: string } | undefined;
      if (aff && aff.status === "active") refAffiliateId = aff.id;
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
