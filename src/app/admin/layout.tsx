import { redirect } from "next/navigation";
import { getSessionUser, isAdmin } from "@/lib/session";
import { TopBar } from "@/components/dashboard/TopBar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user || !isAdmin(user)) {
    redirect("/dashboard");
  }

  return (
    <div className="dark-shell flex h-screen overflow-hidden">
      <AdminSidebar role={user.admin_role!} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          user={{
            email: user.email,
            tier: user.tier,
            credits_remaining: user.credits_remaining,
            avatar_url: user.avatar_url ?? null,
            admin_role: user.admin_role ?? null,
          }}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
