import { NextResponse } from "next/server";
import { getInsforgeServer } from "@/lib/insforge";
import { getSessionUser, canEditAdmin } from "@/lib/session";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const me = await getSessionUser();
  if (!canEditAdmin(me)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const sdk = await getInsforgeServer();

  // Fetch the target so we can guard against deleting the last owner / self.
  const { data: rows } = await sdk.database
    .from("admins")
    .select("*")
    .eq("id", id)
    .limit(1);

  const target = (rows?.[0] as
    | { id: string; user_id: string; role: string }
    | undefined) ?? null;
  if (!target) {
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  }
  if (target.user_id === me!.id) {
    return NextResponse.json(
      { error: "Cannot revoke yourself" },
      { status: 400 }
    );
  }
  if (target.role === "owner" && me!.admin_role !== "owner") {
    return NextResponse.json(
      { error: "Only owners can revoke owners" },
      { status: 403 }
    );
  }

  await sdk.database.from("admins").delete().eq("id", id);

  return NextResponse.json({ ok: true });
}
