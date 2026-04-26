import { I2VStudio } from "@/components/dashboard/I2VStudio";
import { getSessionUser } from "@/lib/session";

export default async function I2VPage() {
  const user = await getSessionUser();
  return <I2VStudio userTier={user?.tier ?? "free"} />;
}
