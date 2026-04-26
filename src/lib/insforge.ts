import { createClient, type InsForgeClient } from "@insforge/sdk";
import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_INSFORGE_URL!;

if (!BASE_URL) {
  console.warn("NEXT_PUBLIC_INSFORGE_URL missing — set it in .env.local");
}

/**
 * Browser-side singleton. SDK manages session cookies automatically.
 * Import as `insforgeClient` from a "use client" component.
 */
export const insforgeClient: InsForgeClient = createClient({
  baseUrl: BASE_URL,
});

/**
 * Server-side factory. Reads the user's access token from the `wan_session`
 * httpOnly cookie and returns an SDK configured for server-mode operation.
 *
 * Use inside server components, route handlers, and server actions.
 */
export async function getInsforgeServer(): Promise<InsForgeClient> {
  const cookieStore = await cookies();
  const token = cookieStore.get("wan_session")?.value;
  return createClient({
    baseUrl: BASE_URL,
    isServerMode: true,
    edgeFunctionToken: token,
  });
}

/**
 * Server-mode SDK without a user token — for admin operations like the
 * Replicate webhook which has no caller identity.
 */
export function getInsforgeAnon(): InsForgeClient {
  return createClient({
    baseUrl: BASE_URL,
    isServerMode: true,
  });
}
