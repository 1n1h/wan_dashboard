-- ===========================================================================
-- Admin + Affiliate program schema
-- ===========================================================================

-- ─── admins ───────────────────────────────────────────────────────────────
-- Separate from `users` so we can grant/revoke admin access without touching
-- the user record. Roles are hierarchical: owner > edit > view.
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'edit', 'view')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);

-- ─── affiliates ───────────────────────────────────────────────────────────
-- One row per user who joined the affiliate program. The `code` is the public
-- referral identifier embedded in URLs and stored in cookies.
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','banned')),
  commission_rate INT NOT NULL DEFAULT 25 CHECK (commission_rate BETWEEN 0 AND 100),
  payout_method TEXT,                 -- 'paypal' | 'stripe' | 'bank' | null
  payout_details JSONB,
  total_earned_cents INT NOT NULL DEFAULT 0,
  total_paid_cents  INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(code);
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON affiliates(user_id);

-- ─── affiliate_clicks ─────────────────────────────────────────────────────
-- One row per visit to a `?ref=CODE` URL. Lightweight — we hash the IP for
-- de-duplication / fraud signal but don't store raw PII long-term.
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  ip_hash TEXT,
  user_agent TEXT,
  referrer TEXT,
  landing_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_aff_clicks_affiliate_created ON affiliate_clicks(affiliate_id, created_at DESC);

-- ─── affiliate_conversions ───────────────────────────────────────────────
-- One row per qualifying event: signup, first_purchase, subscription, renewal.
-- commission_cents is what we owe the affiliate for that event.
CREATE TABLE IF NOT EXISTS affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  conversion_type TEXT NOT NULL CHECK (conversion_type IN (
    'signup','first_purchase','subscription','renewal'
  )),
  amount_cents INT NOT NULL DEFAULT 0,
  commission_cents INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','paid','reversed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  UNIQUE(affiliate_id, referred_user_id, conversion_type)
);

CREATE INDEX IF NOT EXISTS idx_aff_conv_affiliate_created ON affiliate_conversions(affiliate_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aff_conv_referred_user ON affiliate_conversions(referred_user_id);

-- ─── users.referred_by_affiliate_id ──────────────────────────────────────
-- Set at signup if a `?ref=CODE` cookie is present. Used to attribute future
-- purchases (subscription, renewal) back to the original affiliate.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS referred_by_affiliate_id UUID
    REFERENCES affiliates(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by_affiliate_id);
