import { FaceSwapStudio } from "@/components/dashboard/FaceSwapStudio";
import { getSessionUser } from "@/lib/session";

export default async function FaceSwapPage() {
  const user = await getSessionUser();
  return <FaceSwapStudio userTier={user?.tier ?? "free"} />;
}
