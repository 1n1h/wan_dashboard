import { NextResponse } from "next/server";
import { z } from "zod";
import { cookies } from "next/headers";
import { createClient } from "@insforge/sdk";

const Body = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(128),
  name: z.string().optional(),
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

  const { data, error } = await sdk.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    name: parsed.data.name,
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  if (!data) {
    return NextResponse.json({ error: "No data returned" }, { status: 500 });
  }

  // Note: we DON'T mirror to public.users here. The user has no access token
  // yet (email verification required), so PostgREST would reject the insert.
  // Mirror happens on first authenticated sign-in instead.

  if (data.requireEmailVerification || !data.accessToken) {
    return NextResponse.json({
      requireEmailVerification: true,
      email: data.user?.email,
    });
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
