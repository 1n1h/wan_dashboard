import { getInsforgeServer } from "@/lib/insforge";
import type { User, AdminRole } from "@/types";

export async function getSessionUser(): Promise<User | null> {
  const sdk = await getInsforgeServer();

  const { data, error } = await sdk.auth.getCurrentUser();
  if (error || !data?.user) return null;

  // Pull product extension fields (tier, credits) from public.users.
  const { data: rows } = await sdk.database
    .from("users")
    .select("*")
    .eq("id", data.user.id)
    .limit(1);

  if (!rows || rows.length === 0) return null;

  const product = rows[0] as User;

  // Merge avatar from auth.users.profile (set by OAuth providers automatically,
  // or via setProfile() for email signups).
  const profile = (data.user.profile ?? {}) as { avatar_url?: string };

  // Check admin status. One DB hit, cached implicitly per request.
  const { data: adminRows } = await sdk.database
    .from("admins")
    .select("role")
    .eq("user_id", data.user.id)
    .limit(1);

  const admin_role =
    adminRows && adminRows.length > 0
      ? ((adminRows[0] as { role: AdminRole }).role as AdminRole)
      : null;

  return {
    ...product,
    email: product.email ?? data.user.email,
    avatar_url: profile.avatar_url ?? null,
    admin_role,
  };
}

export function isAdmin(user: User | null): boolean {
  return !!user?.admin_role;
}

export function canEditAdmin(user: User | null): boolean {
  return user?.admin_role === "owner" || user?.admin_role === "edit";
}
