import { NextResponse } from "next/server";
import { getInsforgeServer } from "@/lib/insforge";
import { replicate } from "@/lib/replicate";
import { getSessionUser } from "@/lib/session";
import type { VideoGeneration } from "@/types";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { id } = await ctx.params;
  const sdk = await getInsforgeServer();

  const { data: rows, error } = await sdk.database
    .from("video_generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .limit(1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const gen = rows?.[0] as VideoGeneration | undefined;
  if (!gen) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (gen.status === "completed" || gen.status === "failed") {
    return NextResponse.json(gen);
  }

  // Poll Replicate directly while a webhook URL may not be reachable in dev.
  if (gen.replicate_job_id) {
    try {
      const prediction = await replicate.predictions.get(gen.replicate_job_id);

      if (prediction.status === "succeeded") {
        const url = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
        await sdk.database
          .from("video_generations")
          .update({
            status: "completed",
            video_url: url,
            completed_at: new Date().toISOString(),
          })
          .eq("id", id);
        return NextResponse.json({ ...gen, status: "completed", video_url: url });
      }

      if (prediction.status === "failed" || prediction.status === "canceled") {
        await sdk.database
          .from("video_generations")
          .update({
            status: "failed",
            error_message: String(prediction.error ?? "Replicate failure"),
            completed_at: new Date().toISOString(),
          })
          .eq("id", id);
        if (gen.credits_used) {
          await sdk.database
            .from("users")
            .update({ credits_remaining: user.credits_remaining + gen.credits_used })
            .eq("id", user.id);
        }
        return NextResponse.json({
          ...gen,
          status: "failed",
          error_message: String(prediction.error ?? "Replicate failure"),
        });
      }
    } catch {
      // fall through and return current state
    }
  }

  return NextResponse.json(gen);
}
