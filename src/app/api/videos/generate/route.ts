import { NextResponse } from "next/server";
import { z } from "zod";
import { replicate } from "@/lib/replicate";
import { getInsforgeServer } from "@/lib/insforge";
import { getSessionUser } from "@/lib/session";
import { estimateCreditsForModel } from "@/lib/credits";
import { getModel, userCanAccessModel } from "@/lib/models";

const Body = z.object({
  feature: z.enum([
    "text-to-video",
    "image-to-video",
    "motion-transfer",
    "face-swap",
    "video-editing",
  ]),
  modelId: z.string().min(1),
  prompt: z.string().max(500).optional(),
  duration: z.number().min(2).max(30),
  resolution: z.enum(["480p", "720p", "1080p"]),
  aspect: z.string().optional(),
  seed: z.number().int().optional(),

  // Feature-specific input urls
  image_url: z.string().url().optional(),
  video_url: z.string().url().optional(),
  motion_video_url: z.string().url().optional(),
  face_image_url: z.string().url().optional(),

  // Editing extras
  edit_type: z.enum(["upscale", "restyle", "extend", "denoise"]).optional(),
  edit_strength: z.number().min(0).max(100).optional(),

  // Face-swap extras
  swap_confidence: z.number().min(0).max(100).optional(),
  swap_blend: z.number().min(0).max(100).optional(),

  // Motion extras
  motion_intensity: z.number().min(0).max(100).optional(),
  preserve_face: z.boolean().optional(),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const model = getModel(parsed.data.feature, parsed.data.modelId);
  if (!model) {
    return NextResponse.json(
      { error: `Unknown model: ${parsed.data.modelId}` },
      { status: 400 }
    );
  }

  if (!userCanAccessModel(user.tier, model)) {
    return NextResponse.json(
      {
        error: `${model.name} requires ${model.minUserTier}. Upgrade to unlock.`,
        required_tier: model.minUserTier,
      },
      { status: 403 }
    );
  }

  // Clamp duration to model max
  const duration = Math.min(parsed.data.duration, model.maxDuration);
  const cost = estimateCreditsForModel(model, parsed.data.resolution, duration);

  if (user.credits_remaining < cost) {
    return NextResponse.json(
      {
        error: `Not enough credits. Need ${cost}, have ${user.credits_remaining}.`,
        required: cost,
        available: user.credits_remaining,
      },
      { status: 402 }
    );
  }

  const sdk = await getInsforgeServer();

  // Reserve credits up-front; refund on failure.
  await sdk.database
    .from("users")
    .update({ credits_remaining: user.credits_remaining - cost })
    .eq("id", user.id);

  const { data: inserted, error: insertErr } = await sdk.database
    .from("video_generations")
    .insert([
      {
        user_id: user.id,
        feature_type: parsed.data.feature,
        model_id: model.id,
        model_used: model.handle,
        input_data: parsed.data,
        status: "pending",
        credits_used: cost,
      },
    ])
    .select();

  if (insertErr || !inserted || inserted.length === 0) {
    await sdk.database
      .from("users")
      .update({ credits_remaining: user.credits_remaining })
      .eq("id", user.id);
    return NextResponse.json(
      { error: insertErr?.message ?? "Failed to record generation" },
      { status: 500 }
    );
  }

  const generationId = (inserted[0] as { id: string }).id;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  const useWebhook = appUrl.startsWith("https://");

  try {
    const replicateInput = model.buildInput({ ...parsed.data, duration });

    const prediction = await replicate.predictions.create({
      model: model.handle,
      input: replicateInput,
      ...(useWebhook
        ? {
            webhook: `${appUrl}/api/webhooks/replicate?gen=${generationId}`,
            webhook_events_filter: ["completed"] as const,
          }
        : {}),
    });

    await sdk.database
      .from("video_generations")
      .update({ replicate_job_id: prediction.id, status: "processing" })
      .eq("id", generationId);

    return NextResponse.json({
      id: generationId,
      replicate_id: prediction.id,
      model: model.id,
      cost,
    });
  } catch (err) {
    await sdk.database
      .from("users")
      .update({ credits_remaining: user.credits_remaining })
      .eq("id", user.id);
    await sdk.database
      .from("video_generations")
      .update({
        status: "failed",
        error_message: err instanceof Error ? err.message : "Submission failed",
      })
      .eq("id", generationId);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to submit" },
      { status: 500 }
    );
  }
}
