"use client";

import { useEffect } from "react";

/**
 * Mounted once per landing page render. If `?ref=CODE` is present, POSTs to
 * /api/affiliate/track which records the click + sets the wan_ref cookie.
 *
 * The tracking is fire-and-forget — never blocks rendering, never throws.
 */
export function RefTracker() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("ref");
      if (!code) return;

      fetch("/api/affiliate/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          code,
          landing_path: window.location.pathname,
          referrer: document.referrer || null,
        }),
      }).catch(() => {});
    } catch {
      // never throw from tracking
    }
  }, []);

  return null;
}
