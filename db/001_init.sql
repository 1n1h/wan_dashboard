-- WanAnimate SaaS — initial schema
-- Run via InsForge MCP `query` tool, or paste into the InsForge SQL console.
-- Idempotent (uses IF NOT EXISTS) so it's safe to re-run during dev.

-- Required for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================================
-- users
-- Auth identity is owned by InsForge Auth; this table extends it with
-- product fields (tier, credits, billing dates).
-- =========================================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  auth_provider TEXT,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free','starter','pro','enterprise')),
  credits_remaining INT NOT NULL DEFAULT 50,
  credits_purchased INT NOT NULL DEFAULT 0,
  tier_start_date TIMESTAMPTZ,
  tier_end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_tier ON users(tier);

-- =========================================================================
-- video_generations
-- One row per Replicate job. video_url populated on webhook completion.
-- =========================================================================
CREATE TABLE IF NOT EXISTS video_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL CHECK (feature_type IN (
    'text-to-video','image-to-video','face-swap','motion-transfer','video-editing'
  )),
  input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  model_used TEXT NOT NULL,
  replicate_job_id TEXT UNIQUE,
  video_url TEXT,
  thumbnail_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending','processing','completed','failed'
  )),
  credits_used INT,
  processing_time_seconds INT,
  error_message TEXT,
  share_token TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_videogen_user_created ON video_generations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videogen_status ON video_generations(status);
CREATE INDEX IF NOT EXISTS idx_videogen_replicate_job ON video_generations(replicate_job_id);

-- =========================================================================
-- pricing_tiers
-- Source-of-truth for tier metadata. Synced with TIERS in src/types.
-- =========================================================================
CREATE TABLE IF NOT EXISTS pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  monthly_price_cents INT NOT NULL,
  monthly_credits INT NOT NULL,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  max_video_length_seconds INT NOT NULL,
  max_resolution TEXT NOT NULL,
  api_rate_limit INT NOT NULL,
  priority_processing BOOLEAN NOT NULL DEFAULT FALSE,
  support_level TEXT NOT NULL,
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO pricing_tiers (name, monthly_price_cents, monthly_credits, features, max_video_length_seconds, max_resolution, api_rate_limit, priority_processing, support_level)
VALUES
  ('free',       0,    50,   '["Text-to-Video (5s max)","480p","Community support"]'::jsonb,                                                                              5,   '480p',  1,    FALSE, 'community'),
  ('starter',    1900, 500,  '["Text-to-Video","Image-to-Video","720p","Email support"]'::jsonb,                                                                          10,  '720p',  5,    FALSE, 'email'),
  ('pro',        5900, 2000, '["All features","Face-Swap","Motion Transfer","Editing","1080p","Priority queue","Commercial license"]'::jsonb,                              30,  '1080p', 20,   TRUE,  'priority'),
  ('enterprise', 0,    0,    '["Custom","Fine-tuning","Webhooks","White-label","Dedicated support"]'::jsonb,                                                               120, '1080p', 1000, TRUE,  'priority')
ON CONFLICT (name) DO NOTHING;

-- =========================================================================
-- credit_purchases
-- One-off credit-pack purchases via Stripe (separate from subscription).
-- =========================================================================
CREATE TABLE IF NOT EXISTS credit_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  credits_purchased INT NOT NULL,
  amount_cents INT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_purchases_user ON credit_purchases(user_id, created_at DESC);

-- =========================================================================
-- updated_at triggers
-- =========================================================================
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
