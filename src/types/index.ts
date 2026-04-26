export type Tier = "free" | "starter" | "pro" | "enterprise";

export type AdminRole = "owner" | "edit" | "view";

export interface AdminGrant {
  id: string;
  user_id: string;
  email: string;
  role: AdminRole;
  created_at: string;
}

export interface Affiliate {
  id: string;
  user_id: string;
  code: string;
  status: "active" | "paused" | "banned";
  commission_rate: number;
  payout_method: string | null;
  payout_details: Record<string, unknown> | null;
  total_earned_cents: number;
  total_paid_cents: number;
  created_at: string;
}

export type Resolution = "480p" | "720p" | "1080p";

export type FeatureType =
  | "text-to-video"
  | "image-to-video"
  | "face-swap"
  | "motion-transfer"
  | "video-editing";

export type GenerationStatus = "pending" | "processing" | "completed" | "failed";

export interface User {
  id: string;
  email: string;
  username: string | null;
  tier: Tier;
  credits_remaining: number;
  credits_purchased: number;
  tier_start_date: string | null;
  tier_end_date: string | null;
  created_at: string;
  /** Pulled from auth.users.profile.avatar_url at session-load time. */
  avatar_url?: string | null;
  /** Set if a row in `public.admins` exists for this user. */
  admin_role?: AdminRole | null;
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  stripe_subscription_status?: string | null;
  referred_by_affiliate_id?: string | null;
}

export interface VideoGeneration {
  id: string;
  user_id: string;
  feature_type: FeatureType;
  input_data: Record<string, unknown>;
  model_used: string;
  replicate_job_id: string | null;
  video_url: string | null;
  status: GenerationStatus;
  credits_used: number | null;
  processing_time_seconds: number | null;
  error_message: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface PricingTier {
  id: string;
  name: Tier;
  monthly_price_cents: number;
  monthly_credits: number;
  features: string[];
  max_video_length_seconds: number;
  max_resolution: Resolution;
  api_rate_limit: number;
  priority_processing: boolean;
  support_level: "community" | "email" | "priority";
}

export const TIERS: PricingTier[] = [
  {
    id: "free",
    name: "free",
    monthly_price_cents: 0,
    monthly_credits: 50,
    features: ["Text-to-Video (5s max)", "480p output", "1 req/min", "Community support"],
    max_video_length_seconds: 5,
    max_resolution: "480p",
    api_rate_limit: 1,
    priority_processing: false,
    support_level: "community",
  },
  {
    id: "starter",
    name: "starter",
    monthly_price_cents: 1900,
    monthly_credits: 500,
    features: ["Text-to-Video (10s)", "Image-to-Video", "720p output", "5 req/min", "Email support"],
    max_video_length_seconds: 10,
    max_resolution: "720p",
    api_rate_limit: 5,
    priority_processing: false,
    support_level: "email",
  },
  {
    id: "pro",
    name: "pro",
    monthly_price_cents: 5900,
    monthly_credits: 2000,
    features: [
      "Everything in Starter",
      "Face-Swap & Motion Transfer",
      "Video Editing",
      "1080p output",
      "20 req/min",
      "Priority GPU queue",
      "Commercial license",
    ],
    max_video_length_seconds: 30,
    max_resolution: "1080p",
    api_rate_limit: 20,
    priority_processing: true,
    support_level: "priority",
  },
  {
    id: "enterprise",
    name: "enterprise",
    monthly_price_cents: 0,
    monthly_credits: 0,
    features: [
      "Everything in Pro",
      "Custom model fine-tuning",
      "Webhooks & API",
      "White-label options",
      "Dedicated support",
      "Custom rate limits",
    ],
    max_video_length_seconds: 120,
    max_resolution: "1080p",
    api_rate_limit: 1000,
    priority_processing: true,
    support_level: "priority",
  },
];
