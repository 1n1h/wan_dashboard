import { MotionStudio } from "@/components/dashboard/MotionStudio";
import { getSessionUser } from "@/lib/session";

export default async function MotionPage() {
  const user = await getSessionUser();
  return <MotionStudio userTier={user?.tier ?? "free"} />;
}
