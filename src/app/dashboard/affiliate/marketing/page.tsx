import { getInsforgeServer } from "@/lib/insforge";
import { getSessionUser } from "@/lib/session";
import { redirect } from "next/navigation";
import type { Affiliate } from "@/types";
import { MarketingMaterials } from "@/components/dashboard/MarketingMaterials";

export default async function MarketingMaterialsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const sdk = await getInsforgeServer();
  const { data } = await sdk.database
    .from("affiliates")
    .select("*")
    .eq("user_id", user.id)
    .limit(1);

  const affiliate = (data?.[0] as Affiliate | undefined) ?? null;
  if (!affiliate) redirect("/dashboard/affiliate");

  return <MarketingMaterials affiliate={affiliate} />;
}
