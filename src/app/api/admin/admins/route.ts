import { NextResponse } from "next/server";
import { z } from "zod";
import { getInsforgeServer } from "@/lib/insforge";
import { getSessionUser, canEditAdmin } from "@/lib/session";

const Body = z.object({
  email: z.string().email(),
  role: z.enum(["owner", "edit", "view"]),
});

export async function POST(req: Request) {
  const me = await getSessionUser();
  if (!canEditAdmin(me)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
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

  // Only owners can mint other owners.
  if (parsed.data.role === "owner" && me!.admin_role !== "owner") {
    return NextResponse.json(
      { error: "Only owners can grant owner role" },
      { status: 403 }
    );
  }

  const sdk = await getInsforgeServer();

  // Look up the target user — must already have a Wan account.
  const { data: matches } = await sdk.database
    .from("users")
    .select("id, email")
    .eq("email", parsed.data.email)
    .limit(1);

  const target = (matches?.[0] as { id: string; email: string } | undefined) ?? null;
  if (!target) {
    return NextResponse.json(
      { error: `No user with email ${parsed.data.email}. They must sign up first.` },
      { status: 404 }
    );
  }

  // Insert (or upgrade role).
  const { data: existing } = await sdk.database
    .from("admins")
    .select("id")
    .eq("user_id", target.id)
    .limit(1);

  if (existing && existing.length > 0) {
    await sdk.database
      .from("admins")
      .update({ role: parsed.data.role })
      .eq("user_id", target.id);
  } else {
    await sdk.database
      .from("admins")
      .insert([
        {
          user_id: target.id,
          email: target.email,
          role: parsed.data.role,
          created_by: me!.id,
        },
      ]);
  }

  return NextResponse.json({ ok: true });
}
