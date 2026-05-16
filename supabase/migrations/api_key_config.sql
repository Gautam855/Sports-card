-- API Key Config table for multi-slot key rotation
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS api_key_config (
    id TEXT PRIMARY KEY,              -- provider name: 'apisports', 'cricbuzz'
    active_slot INTEGER NOT NULL DEFAULT 1 CHECK (active_slot BETWEEN 1 AND 10),
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed with default values
INSERT INTO api_key_config (id, active_slot, notes)
VALUES 
    ('football', 1, 'Football (API-Sports)'),
    ('baseball', 1, 'Baseball (API-Sports)'),
    ('mma', 1, 'MMA / UFC (API-Sports)'),
    ('rugby', 1, 'Rugby (API-Sports)'),
    ('formula1', 1, 'Formula 1 (API-Sports)'),
    ('tennis', 1, 'Tennis (API-Sports)'),
    ('cricket', 1, 'Cricbuzz Cricket API (RapidAPI)')
ON CONFLICT (id) DO NOTHING;

-- Allow read/write access via anon key (since admin auth is handled at app level)
ALTER TABLE api_key_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to api_key_config"
ON api_key_config
FOR ALL
USING (true)
WITH CHECK (true);

-- Alter constraint in case table already exists
ALTER TABLE api_key_config DROP CONSTRAINT IF EXISTS api_key_config_active_slot_check;
ALTER TABLE api_key_config ADD CONSTRAINT api_key_config_active_slot_check CHECK (active_slot BETWEEN 1 AND 10);

