-- Stripe IDs on users so we can find them on webhook events.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_status TEXT;

CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON users(stripe_customer_id);
