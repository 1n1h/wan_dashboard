import { NextResponse } from "next/server";
import { getInsforgeAnon } from "@/lib/insforge";

/**
 * Replicate webhook receiver.
 *
 * URL: /api/webhooks/replicate?gen=<generation_id>
 *
 * Replicate POSTs the prediction object on completion. We update the
 * matching `video_generations` row and refund credits on failure.
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const generationId = url.searchParams.get("gen");
  if (!generationId) {
    return NextResponse.json({ error: "Missing gen param" }, { status: 400 });
  }

  let payload: {
    id: string;
    status: string;
    output?: string | string[] | null;
    error?: string | null;
    metrics?: { predict_time?: number };
  };
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sdk = getInsforgeAnon();

  if (payload.status === "succeeded") {
    const videoUrl = Array.isArray(payload.output) ? payload.output[0] : payload.output;
    await sdk.database
      .from("video_generations")
      .update({
        status: "completed",
        video_url: videoUrl,
        processing_time_seconds: Math.round(payload.metrics?.predict_time ?? 0),
        completed_at: new Date().toISOString(),
      })
      .eq("id", generationId);
    return NextResponse.json({ ok: true });
  }

  if (payload.status === "failed" || payload.status === "canceled") {
    const { data: rows } = await sdk.database
      .from("video_generations")
      .select("user_id, credits_used")
      .eq("id", generationId)
      .limit(1);

    const gen = rows?.[0] as { user_id: string; credits_used: number | null } | undefined;

    if (gen?.credits_used) {
      const { data: userRows } = await sdk.database
        .from("users")
        .select("credits_remaining")
        .eq("id", gen.user_id)
        .limit(1);
      const current = (userRows?.[0] as { credits_remaining: number } | undefined)?.credits_remaining ?? 0;
      await sdk.database
        .from("users")
        .update({ credits_remaining: current + gen.credits_used })
        .eq("id", gen.user_id);
    }

    await sdk.database
      .from("video_generations")
      .update({
        status: "failed",
        error_message: payload.error ?? "Unknown failure",
        completed_at: new Date().toISOString(),
      })
      .eq("id", generationId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
