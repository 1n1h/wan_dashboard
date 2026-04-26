-- Track which specific model the user picked, separate from `model_used`
-- (the Replicate handle). model_id maps to the registry in src/lib/models.ts
-- so we can swap the underlying handle without losing the user's selection.

ALTER TABLE video_generations
  ADD COLUMN IF NOT EXISTS model_id TEXT;

CREATE INDEX IF NOT EXISTS idx_videogen_model_id ON video_generations(model_id);
