/**
 * Model registry — single source of truth for which Replicate models we expose
 * for which feature, what they cost us, and which user tiers can pick them.
 *
 * Per-feature pages render a `<ModelPicker>` from this registry; the generate
 * API route reads from it to (a) verify the user's tier permits the model,
 * (b) compute the credit cost, and (c) build the Replicate prediction payload.
 *
 * **Pricing is your cost (what Replicate charges per generation), not what
 * the user pays.** User-facing credit cost is derived in `credits.ts` via:
 *   credits = ceil(usd_per_gen × resolution_factor × duration_factor × markup × 100)
 *
 * Verify each handle + price against the live Replicate page before shipping —
 * model owners change pricing and Replicate has deprecated handles before.
 */

import type { Tier, FeatureType } from "@/types";

export type ModelTier = "fast" | "balanced" | "pro" | "cinematic";

export interface ModelDef {
  /** Stable internal ID — what we store in DB and pass between client/server. */
  id: string;
  /** Replicate model handle (`<owner>/<name>`), used by `replicate.predictions.create`. */
  handle: string;
  /** Human label shown in the picker. */
  name: string;
  /** Short tagline ("Fast iterations", "Best motion", etc.) */
  tagline: string;
  /** Speed/quality bucket — drives badge color in the picker. */
  tier: ModelTier;
  /** Lowest user tier that can pick this model. */
  minUserTier: Tier;
  /** Approximate USD cost per 5s 720p generation. */
  usdPer5s720p: number;
  /** Max output duration the model supports (seconds). */
  maxDuration: number;
  /** Highest resolution slug ("480p" | "720p" | "1080p"). */
  maxResolution: "480p" | "720p" | "1080p";
  /**
   * For T2V models: whether the user can attach an optional reference image
   * to guide the generation (style, composition, subject). Most premium T2V
   * models support this; Wan 2.5 t2v-fast does not.
   */
  supportsReferenceImage?: boolean;
  /** Whether this model is verified working — set false until you've test-fired it. */
  verified: boolean;
  /**
   * Build the `input` payload for `replicate.predictions.create({ model, input })`
   * from the user's request. Each model has its own param shape.
   */
  buildInput: (req: GenerateRequest) => Record<string, unknown>;
}

export interface GenerateRequest {
  feature: FeatureType;
  modelId: string;
  prompt?: string;
  image_url?: string;
  video_url?: string;
  motion_video_url?: string;
  face_image_url?: string;
  duration: number;
  resolution: "480p" | "720p" | "1080p";
  aspect?: string;
  seed?: number;
  // Feature-specific extras
  edit_type?: "upscale" | "restyle" | "extend" | "denoise";
  edit_strength?: number;
  swap_confidence?: number;
  swap_blend?: number;
  motion_intensity?: number;
  preserve_face?: boolean;
}

const resOnly = (res: string) => res.replace("p", "");

// ─── Text-to-Video ──────────────────────────────────────────────────────────

const T2V_MODELS: ModelDef[] = [
  {
    id: "wan-2.5-t2v-fast",
    handle: "wan-video/wan-2.5-t2v-fast",
    name: "Wan 2.5 Fast",
    tagline: "Quick iterations · cheapest",
    tier: "fast",
    minUserTier: "free",
    usdPer5s720p: 0.25,
    maxDuration: 15,
    maxResolution: "720p",
    supportsReferenceImage: false,
    verified: true,
    buildInput: (r) => ({
      prompt: r.prompt,
      duration: r.duration,
      resolution: resOnly(r.resolution),
      ...(r.seed != null ? { seed: r.seed } : {}),
    }),
  },
  {
    id: "seedance-1-lite",
    handle: "bytedance/seedance-1-lite",
    name: "Seedance 1 Lite",
    tagline: "ByteDance fast tier · sharp",
    tier: "fast",
    minUserTier: "starter",
    usdPer5s720p: 0.18,
    maxDuration: 10,
    maxResolution: "720p",
    // Seedance unifies T2V + I2V at the same handle: pass `image` to switch
    // to image-conditioned mode. So the same handle accepts an optional ref.
    supportsReferenceImage: true,
    verified: false,
    buildInput: (r) => ({
      prompt: r.prompt,
      duration: r.duration,
      resolution: r.resolution,
      ...(r.image_url ? { image: r.image_url } : {}),
      ...(r.seed != null ? { seed: r.seed } : {}),
    }),
  },
  {
    id: "seedance-1-pro-t2v",
    handle: "bytedance/seedance-1-pro",
    name: "Seedance 1 Pro",
    tagline: "ByteDance flagship · cinematic",
    tier: "balanced",
    minUserTier: "pro",
    usdPer5s720p: 0.45,
    maxDuration: 10,
    maxResolution: "1080p",
    supportsReferenceImage: true,
    verified: false,
    buildInput: (r) => ({
      prompt: r.prompt,
      duration: r.duration,
      resolution: r.resolution,
      aspect_ratio: r.aspect ?? "16:9",
      ...(r.image_url ? { image: r.image_url } : {}),
      ...(r.seed != null ? { seed: r.seed } : {}),
    }),
  },
  {
    id: "seedance-2",
    handle: "bytedance/seedance-2.0",
    name: "Seedance 2.0",
    tagline: "Multimodal · up to 9 image refs",
    tier: "pro",
    minUserTier: "pro",
    usdPer5s720p: 0.7,
    maxDuration: 10,
    maxResolution: "1080p",
    supportsReferenceImage: true,
    verified: false,
    buildInput: (r) => ({
      prompt: r.prompt,
      duration: r.duration,
      resolution: r.resolution,
      aspect_ratio: r.aspect ?? "16:9",
      ...(r.image_url ? { image: r.image_url } : {}),
      ...(r.seed != null ? { seed: r.seed } : {}),
    }),
  },
  {
    id: "kling-v2.1-master-t2v",
    handle: "kwaivgi/kling-v2.1-master",
    name: "Kling 2.1 Master",
    tagline: "Best motion realism · physics",
    tier: "pro",
    minUserTier: "pro",
    usdPer5s720p: 1.4,
    maxDuration: 10,
    maxResolution: "1080p",
    supportsReferenceImage: true,
    verified: false,
    buildInput: (r) => ({
      prompt: r.prompt,
      duration: r.duration <= 5 ? 5 : 10,
      aspect_ratio: r.aspect ?? "16:9",
      ...(r.image_url ? { start_image: r.image_url } : {}),
      ...(r.seed != null ? { seed: r.seed } : {}),
    }),
  },
  {
    id: "veo-3-fast",
    handle: "google/veo-3-fast",
    name: "Veo 3 Fast",
    tagline: "Google Veo · fast · native audio",
    tier: "balanced",
    minUserTier: "pro",
    usdPer5s720p: 0.65,
    maxDuration: 8,
    maxResolution: "1080p",
    supportsReferenceImage: true,
    verified: false,
    buildInput: (r) => ({
      prompt: r.prompt,
      duration: Math.min(r.duration, 8),
      ...(r.image_url ? { image: r.image_url } : {}),
      ...(r.seed != null ? { seed: r.seed } : {}),
    }),
  },
  {
    id: "veo-3",
    handle: "google/veo-3",
    name: "Veo 3",
    tagline: "Highest fidelity + native audio",
    tier: "cinematic",
    minUserTier: "enterprise",
    usdPer5s720p: 3.0,
    maxDuration: 8,
    maxResolution: "1080p",
    supportsReferenceImage: true,
    verified: false,
    buildInput: (r) => ({
      prompt: r.prompt,
      duration: Math.min(r.duration, 8),
      ...(r.image_url ? { image: r.image_url } : {}),
      ...(r.seed != null ? { seed: r.seed } : {}),
    }),
  },
];

// ─── Image-to-Video ─────────────────────────────────────────────────────────

const I2V_MODELS: ModelDef[] = [
  {
    id: "wan-2.5-i2v-fast",
    handle: "wan-video/wan-2.5-i2v-fast",
    name: "Wan 2.5 Fast",
    tagline: "Quick iterations · cheapest",
    tier: "fast",
    minUserTier: "free",
    usdPer5s720p: 0.25,
    maxDuration: 10,
    maxResolution: "720p",
    verified: true,
    buildInput: (r) => ({
      prompt: r.prompt ?? "natural motion",
      image: r.image_url,
      duration: r.duration,
      resolution: resOnly(r.resolution),
      ...(r.seed != null ? { seed: r.seed } : {}),
    }),
  },
  {
    id: "seedance-1-lite-i2v",
    handle: "bytedance/seedance-1-lite",
    name: "Seedance 1 Lite",
    tagline: "ByteDance fast tier · sharp",
    tier: "fast",
    minUserTier: "starter",
    usdPer5s720p: 0.18,
    maxDuration: 10,
    maxResolution: "720p",
    verified: false,
    buildInput: (r) => ({
      prompt: r.prompt,
      image: r.image_url,
      duration: r.duration,
      resolution: r.resolution,
      ...(r.seed != null ? { seed: r.seed } : {}),
    }),
  },
  {
    id: "seedance-1-pro-i2v",
    handle: "bytedance/seedance-1-pro",
    name: "Seedance 1 Pro",
    tagline: "ByteDance flagship · cinematic",
    tier: "balanced",
    minUserTier: "pro",
    usdPer5s720p: 0.45,
    maxDuration: 10,
    maxResolution: "1080p",
    verified: false,
    buildInput: (r) => ({
      prompt: r.prompt,
      image: r.image_url,
      duration: r.duration,
      resolution: r.resolution,
      aspect_ratio: r.aspect ?? "16:9",
      ...(r.seed != null ? { seed: r.seed } : {}),
    }),
  },
  {
    id: "seedance-2-i2v",
    handle: "bytedance/seedance-2.0",
    name: "Seedance 2.0",
    tagline: "Multimodal · best of ByteDance",
    tier: "pro",
    minUserTier: "pro",
    usdPer5s720p: 0.7,
    maxDuration: 10,
    maxResolution: "1080p",
    verified: false,
    buildInput: (r) => ({
      prompt: r.prompt,
      image: r.image_url,
      duration: r.duration,
      resolution: r.resolution,
      aspect_ratio: r.aspect ?? "16:9",
      ...(r.seed != null ? { seed: r.seed } : {}),
    }),
  },
  {
    id: "kling-v2.1-master-i2v",
    handle: "kwaivgi/kling-v2.1-master",
    name: "Kling 2.1 Master",
    tagline: "Best motion realism · physics",
    tier: "pro",
    minUserTier: "pro",
    usdPer5s720p: 1.4,
    maxDuration: 10,
    maxResolution: "1080p",
    verified: false,
    buildInput: (r) => ({
      prompt: r.prompt,
      start_image: r.image_url,
      duration: r.duration <= 5 ? 5 : 10,
      aspect_ratio: r.aspect ?? "16:9",
      ...(r.seed != null ? { seed: r.seed } : {}),
    }),
  },
];

// ─── Character Animation (renamed from "Motion Transfer" in UI) ─────────────

const MOTION_MODELS: ModelDef[] = [
  {
    id: "mimic-motion",
    handle: "zsxkib/mimic-motion",
    name: "MimicMotion",
    tagline: "Recreate any motion with your character",
    tier: "balanced",
    minUserTier: "pro",
    usdPer5s720p: 0.6,
    maxDuration: 10,
    maxResolution: "720p",
    verified: false,
    buildInput: (r) => ({
      motion_video: r.motion_video_url,
      appearance_image: r.image_url,
      // Best-effort additional knobs — Replicate ignores unknown fields, but
      // verify against the live model page when it 422s.
      ...(r.motion_intensity != null
        ? { motion_scale: r.motion_intensity / 100 }
        : {}),
      ...(r.seed != null ? { seed: r.seed } : {}),
    }),
  },
];

// ─── Face-Swap ──────────────────────────────────────────────────────────────

const FACESWAP_MODELS: ModelDef[] = [
  {
    id: "roop-faceswap",
    handle: "arabyai-replicate/roop_face_swap",
    name: "Roop",
    tagline: "Frame-coherent video face-swap",
    tier: "balanced",
    minUserTier: "pro",
    usdPer5s720p: 0.4,
    maxDuration: 30,
    maxResolution: "720p",
    verified: false,
    buildInput: (r) => ({
      target_video: r.video_url,
      source_image: r.face_image_url,
    }),
  },
];

// ─── Editing — splits by edit_type ──────────────────────────────────────────

const EDIT_MODELS: ModelDef[] = [
  {
    id: "real-esrgan-video",
    handle: "lucataco/real-esrgan-video",
    name: "Real-ESRGAN Upscale",
    tagline: "2x / 4x video upscale",
    tier: "balanced",
    minUserTier: "pro",
    usdPer5s720p: 0.3,
    maxDuration: 120,
    maxResolution: "1080p",
    verified: false,
    buildInput: (r) => ({
      video: r.video_url,
      scale: 2,
    }),
  },
  {
    id: "rerender-a-video",
    handle: "pollinations/rerender_a_video",
    name: "Rerender",
    tagline: "Restyle video with a prompt",
    tier: "balanced",
    minUserTier: "pro",
    usdPer5s720p: 0.75,
    maxDuration: 30,
    maxResolution: "720p",
    verified: false,
    buildInput: (r) => ({
      input_video: r.video_url,
      prompt: r.prompt,
      strength: (r.edit_strength ?? 60) / 100,
    }),
  },
];

// ─── Registry ───────────────────────────────────────────────────────────────

export const MODEL_REGISTRY: Record<FeatureType, ModelDef[]> = {
  "text-to-video": T2V_MODELS,
  "image-to-video": I2V_MODELS,
  "motion-transfer": MOTION_MODELS,
  "face-swap": FACESWAP_MODELS,
  "video-editing": EDIT_MODELS,
};

export function getModel(
  feature: FeatureType,
  modelId: string
): ModelDef | undefined {
  return MODEL_REGISTRY[feature]?.find((m) => m.id === modelId);
}

export function getDefaultModel(feature: FeatureType): ModelDef {
  // Default to the first (cheapest/fastest) entry per feature.
  return MODEL_REGISTRY[feature][0];
}

const TIER_RANK: Record<Tier, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  enterprise: 3,
};

export function userCanAccessModel(userTier: Tier, model: ModelDef): boolean {
  return TIER_RANK[userTier] >= TIER_RANK[model.minUserTier];
}
