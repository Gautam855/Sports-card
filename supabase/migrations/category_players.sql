-- Migration for Team Players (Category Players)
CREATE TABLE IF NOT EXISTS category_players (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id uuid NOT NULL REFERENCES news_categories(id) ON DELETE CASCADE,
    player_name text NOT NULL,
    player_image text,
    player_url text,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_category_players_category ON category_players(category_id);

-- Enable RLS
ALTER TABLE category_players ENABLE ROW LEVEL SECURITY;

-- Idempotent policies
DROP POLICY IF EXISTS "Public read category_players" ON category_players;
CREATE POLICY "Public read category_players" ON category_players
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin write category_players" ON category_players;
CREATE POLICY "Admin write category_players" ON category_players
    FOR ALL USING (true) WITH CHECK (true);
