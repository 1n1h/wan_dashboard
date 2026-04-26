import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { getSessionUser } from "@/lib/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  // Demo fallback so the dashboard renders without a configured InsForge auth
  // backend. Wire real session check + redirect to /login once auth is live.
  const displayUser = user
    ? {
        email: user.email,
        tier: user.tier,
        credits_remaining: user.credits_remaining,
        avatar_url: user.avatar_url ?? null,
        admin_role: user.admin_role ?? null,
      }
    : {
        email: "demo@wan.app",
        tier: "free" as const,
        credits_remaining: 50,
        avatar_url: null,
        admin_role: null,
      };

  return (
    <div className="dark-shell flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar user={displayUser} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
