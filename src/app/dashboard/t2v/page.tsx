import { T2VStudio } from "@/components/dashboard/T2VStudio";
import { getSessionUser } from "@/lib/session";

export default async function T2VPage() {
  const user = await getSessionUser();
  return <T2VStudio userTier={user?.tier ?? "free"} />;
}
