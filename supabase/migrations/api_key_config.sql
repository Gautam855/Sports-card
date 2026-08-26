-- API Key Config table for multi-slot key rotation
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS api_key_config (
    id TEXT PRIMARY KEY,
    active_slot INTEGER NOT NULL DEFAULT 1 CHECK (active_slot BETWEEN 1 AND 10),
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed with news API provider only (live score providers removed)
INSERT INTO api_key_config (id, active_slot, notes)
VALUES ('serpapi', 1, 'SerpApi — Google News / real-time sports news')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE api_key_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to api_key_config"
ON api_key_config
FOR ALL
USING (true)
WITH CHECK (true);

ALTER TABLE api_key_config DROP CONSTRAINT IF EXISTS api_key_config_active_slot_check;
ALTER TABLE api_key_config ADD CONSTRAINT api_key_config_active_slot_check CHECK (active_slot BETWEEN 1 AND 10);

-- Optional: remove legacy live-score provider rows if they exist
DELETE FROM api_key_config WHERE id IN (
    'football', 'football536', 'baseball', 'mma', 'rugby', 'formula1', 'tennis', 'cricket', 'basketball'
);
