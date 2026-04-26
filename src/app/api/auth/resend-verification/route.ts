import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@insforge/sdk";

const Body = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const sdk = createClient({
    baseUrl: process.env.NEXT_PUBLIC_INSFORGE_URL!,
    isServerMode: true,
  });

  const { data, error } = await sdk.auth.resendVerificationEmail({
    email: parsed.data.email,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, message: data?.message });
}
