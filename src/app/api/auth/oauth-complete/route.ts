import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { createClient } from "@insforge/sdk";

const Body = z.object({
  accessToken: z.string().min(20),
  user: z.object({
    id: z.string().min(1),
    email: z.string().email(),
  }),
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

  // Verify the token actually corresponds to the claimed user. Without this
  // step a malicious client could submit any token + user pair.
  const verifySdk = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    isServerMode: true,
    edgeFunctionToken: parsed.data.accessToken,
  });

  const { data: who, error: whoErr } = await verifySdk.auth.getCurrentUser();
  if (whoErr || !who?.user || who.user.id !== parsed.data.user.id) {
    return NextResponse.json({ error: "Token / user mismatch" }, { status: 401 });
  }

  // Mirror to public.users on first sign-in.
  const { data: existing } = await verifySdk.database
    .from("users")
    .select("id")
    .eq("id", who.user.id)
    .limit(1);

  if (!existing || existing.length === 0) {
    await verifySdk.database
      .from("users")
      .insert([
        {
          id: who.user.id,
          email: who.user.email,
          tier: "free",
          credits_remaining: 50,
        },
      ]);
  }

  const cookieStore = await cookies();
  cookieStore.set("wan_session", parsed.data.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ ok: true });
}
