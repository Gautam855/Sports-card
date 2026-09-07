-- Categories Schema Upgrade: Add faqs, emoji, meta_title, meta_description
-- These columns are added ONLY if they don't already exist.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news_categories' AND column_name='faqs') THEN
        ALTER TABLE news_categories ADD COLUMN faqs jsonb DEFAULT '[]'::jsonb;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news_categories' AND column_name='emoji') THEN
        ALTER TABLE news_categories ADD COLUMN emoji text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news_categories' AND column_name='meta_title') THEN
        ALTER TABLE news_categories ADD COLUMN meta_title text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='news_categories' AND column_name='meta_description') THEN
        ALTER TABLE news_categories ADD COLUMN meta_description text;
    END IF;
END
$$;

-- Seed standard sports categories (upsert — skip if already exist by slug)
INSERT INTO news_categories (name, slug, color, emoji, description, sort_order) VALUES
    ('Cricket',          'cricket',     '#10b981', '🏏', 'Latest cricket news, player stories, match reports and expert analysis.',                        1),
    ('Football',         'football',    '#3b82f6', '⚽', 'Football news from Premier League, La Liga, Champions League and more.',                         2),
    ('Basketball',       'basketball',  '#f97316', '🏀', 'NBA, EuroLeague and international basketball news and game analysis.',                           3),
    ('Tennis',           'tennis',      '#84cc16', '🎾', 'ATP, WTA and Grand Slam news, tournament updates and player stories.',                           4),
    ('Formula 1',        'f1',          '#ef4444', '🏎️', 'Formula 1 news, race weekend updates, driver stories and championship analysis.',                5),
    ('NFL',              'nfl',         '#8b5cf6', '🏈', 'NFL news, game recaps, player updates and season analysis.',                                     6),
    ('NBA',              'nba',         '#f59e0b', '🏀', 'NBA news, trade rumors, game recaps and player spotlight stories.',                              7),
    ('Olympics',         'olympics',    '#eab308', '🥇', 'Olympic sports news, athlete stories and major multi-sport event coverage.',                     8),
    ('Baseball',         'baseball',    '#0ea5e9', '⚾', 'MLB and international baseball news, standings updates and game stories.',                       9),
    ('Rugby',            'rugby',       '#22c55e', '🏉', 'Rugby news from Six Nations, Rugby Championship, Premiership and international fixtures.',      10),
    ('FIFA World Cup',   'fifa',        '#ec4899', '🌍', 'FIFA World Cup news, national team updates and tournament coverage.',                           11),
    ('Hockey',           'hockey',      '#4f46e5', '🏑', 'Hockey news, international matches, player stories and tournament coverage.',                    12)
ON CONFLICT (slug) DO UPDATE SET
    emoji = EXCLUDED.emoji,
    color = COALESCE(news_categories.color, EXCLUDED.color),
    description = COALESCE(news_categories.description, EXCLUDED.description),
    sort_order = EXCLUDED.sort_order;
