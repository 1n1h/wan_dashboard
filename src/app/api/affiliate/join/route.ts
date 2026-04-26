import { NextResponse } from "next/server";
import { getInsforgeServer } from "@/lib/insforge";
import { getSessionUser } from "@/lib/session";
import { AFFILIATE_CONFIG, generateAffiliateCode } from "@/lib/affiliate";

export async function POST() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const sdk = await getInsforgeServer();

  // Already an affiliate? Return existing record.
  const { data: existing } = await sdk.database
    .from("affiliates")
    .select("*")
    .eq("user_id", user.id)
    .limit(1);

  if (existing && existing.length > 0) {
    return NextResponse.json({ affiliate: existing[0], existing: true });
  }

  // Try a few times in case of code collision.
  for (let i = 0; i < 5; i++) {
    const code = generateAffiliateCode(user.username ?? user.email.split("@")[0]);
    const { data, error } = await sdk.database
      .from("affiliates")
      .insert([
        {
          user_id: user.id,
          code,
          commission_rate: AFFILIATE_CONFIG.defaultCommissionRate,
        },
      ])
      .select();

    if (!error && data && data.length > 0) {
      return NextResponse.json({ affiliate: data[0], existing: false });
    }
  }

  return NextResponse.json(
    { error: "Failed to provision affiliate code" },
    { status: 500 }
  );
}
