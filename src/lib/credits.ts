import type { Resolution, FeatureType } from "@/types";
import { getModel, getDefaultModel, type ModelDef } from "@/lib/models";

/**
 * Pricing model:
 *
 *   credits = ceil( usd_cost_per_gen × resolution_factor × duration_factor × MARKUP × 100 )
 *
 * - 1 credit = $0.01 of *spend* allocated by us, at MARKUP=1.0 break-even.
 * - Credit packs sell at $0.05/credit (100 cr = $5), so MARKUP of ~0.5 breaks
 *   even and 0.25 leaves a 75% gross margin on resold compute.
 * - Free monthly grants don't earn revenue, so cost is pure burn — keep
 *   margin tight on default models.
 */
const MARKUP = 0.5;

const RES_FACTOR: Record<Resolution, number> = {
  "480p": 0.6,
  "720p": 1.0,
  "1080p": 2.0,
};

export function estimateCreditsForModel(
  model: ModelDef,
  resolution: Resolution,
  durationSeconds: number
): number {
  const dur = Math.max(2, Math.min(model.maxDuration, durationSeconds));
  const durationFactor = dur / 5;
  const usd = model.usdPer5s720p * RES_FACTOR[resolution] * durationFactor;
  const credits = Math.ceil(usd * MARKUP * 100);
  return Math.max(1, credits);
}

/**
 * Convenience: estimate by feature + modelId. Falls back to the default
 * model for the feature if the modelId isn't in the registry.
 */
export function estimateCredits(
  feature: FeatureType,
  resolution: Resolution,
  durationSeconds: number,
  modelId?: string
): number {
  const model = (modelId && getModel(feature, modelId)) || getDefaultModel(feature);
  return estimateCreditsForModel(model, resolution, durationSeconds);
}
