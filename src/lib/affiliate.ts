import { randomBytes } from "crypto";

/**
 * Affiliate program configuration. Tweak commission rate, cookie window,
 * and qualifying-event payouts here in one place.
 */
export const AFFILIATE_CONFIG = {
  /** Default cut on a referred user's qualifying purchase. */
  defaultCommissionRate: 25, // %
  /** How long after click the attribution sticks (days). */
  cookieDays: 30,
  /** Cookie name on the visitor's browser. */
  cookieName: "wan_ref",
  /** One-off commission for a verified signup, $ */
  signupBonusUsd: 0,
  /** Percentage of first-purchase value paid to affiliate. */
  firstPurchaseRate: 25,
  /** Percentage of recurring subscription paid back to affiliate, capped to N months. */
  recurringRate: 25,
  recurringMonths: 12,
};

/**
 * Generate a friendly affiliate code from a name + random suffix.
 *   "Travis Garcia" → "travis-x4f9a7"
 */
export function generateAffiliateCode(name?: string | null): string {
  const slug = (name ?? "creator")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 20)
    || "creator";
  const suffix = randomBytes(3).toString("hex"); // 6 hex chars
  return `${slug}-${suffix}`;
}

/**
 * Hash an IP for de-duplication without storing PII long-term.
 */
export async function hashIp(ip: string): Promise<string> {
  // Lightweight hash (not cryptographic); just enough to dedupe + bucket.
  let h = 0;
  for (let i = 0; i < ip.length; i++) {
    h = (h << 5) - h + ip.charCodeAt(i);
    h |= 0;
  }
  return `ip_${(h >>> 0).toString(16)}`;
}
