import { getInsforgeServer } from "@/lib/insforge";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import type { Affiliate } from "@/types";
import { AffiliateJoinPanel } from "@/components/dashboard/AffiliateJoinPanel";
import { AffiliateDashboardPanel } from "@/components/dashboard/AffiliateDashboardPanel";

export default async function AffiliateRootPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const sdk = await getInsforgeServer();
  const { data } = await sdk.database
    .from("affiliates")
    .select("*")
    .eq("user_id", user.id)
    .limit(1);

  const affiliate = (data?.[0] as Affiliate | undefined) ?? null;

  if (!affiliate) {
    return <AffiliateJoinPanel />;
  }

  // Pull stats for this affiliate
  const [{ data: clicks }, { data: convs }] = await Promise.all([
    sdk.database
      .from("affiliate_clicks")
      .select("created_at")
      .eq("affiliate_id", affiliate.id),
    sdk.database
      .from("affiliate_conversions")
      .select("*")
      .eq("affiliate_id", affiliate.id)
      .order("created_at", { ascending: false }),
  ]);

  return (
    <AffiliateDashboardPanel
      affiliate={affiliate}
      clicks={(clicks ?? []).length}
      conversions={(convs ?? []) as Array<{
        id: string;
        conversion_type: string;
        amount_cents: number;
        commission_cents: number;
        status: string;
        created_at: string;
      }>}
    />
  );
}
