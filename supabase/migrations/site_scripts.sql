-- ═══════════════════════════════════════════════════════════════
-- Site Scripts & SEO Manager
-- Stores all injectable scripts, meta tags, structured data, etc.
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS site_scripts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Identification
    name TEXT NOT NULL,                          -- Human label: "Google AdSense", "GA4 Analytics"
    slug TEXT NOT NULL UNIQUE,                   -- Unique key: "google-adsense", "ga4", "custom-meta-robots"
    
    -- Categorisation
    category TEXT NOT NULL DEFAULT 'custom'      -- 'analytics', 'ads', 'seo-meta', 'verification', 'structured-data', 'custom'
        CHECK (category IN ('analytics', 'ads', 'seo-meta', 'verification', 'structured-data', 'custom', 'tracking')),
    
    -- Injection type
    script_type TEXT NOT NULL DEFAULT 'script'   -- 'script-src', 'script-inline', 'meta', 'link', 'json-ld', 'noscript', 'raw-html'
        CHECK (script_type IN ('script-src', 'script-inline', 'meta', 'link', 'json-ld', 'noscript', 'raw-html')),
    
    -- Placement  
    placement TEXT NOT NULL DEFAULT 'head'       -- 'head' or 'body-start' or 'body-end'
        CHECK (placement IN ('head', 'body-start', 'body-end')),
    
    -- Content
    content TEXT NOT NULL DEFAULT '',             -- The script/meta/tag content
    src TEXT,                                     -- External script src URL (for script-src type)
    attributes JSONB DEFAULT '{}',               -- Additional attributes: { "async": true, "data-ad-client": "ca-pub-xxx" }
    
    -- Targeting (which pages to inject on)
    pages TEXT[] DEFAULT ARRAY['*']::TEXT[],      -- ['*'] = all pages, ['/blog/*', '/news/*'] = specific
    exclude_pages TEXT[] DEFAULT ARRAY[]::TEXT[], -- Pages to exclude
    
    -- Loading strategy
    loading_strategy TEXT DEFAULT 'afterInteractive'  -- 'beforeInteractive', 'afterInteractive', 'lazyOnload', 'worker'
        CHECK (loading_strategy IN ('beforeInteractive', 'afterInteractive', 'lazyOnload', 'worker')),
    
    -- Priority / ordering
    priority INTEGER DEFAULT 50 CHECK (priority BETWEEN 0 AND 100),  -- Lower = loads first
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast active-script lookups
CREATE INDEX IF NOT EXISTS idx_site_scripts_active ON site_scripts (is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_site_scripts_category ON site_scripts (category);

-- Row Level Security
ALTER TABLE site_scripts ENABLE ROW LEVEL SECURITY;

-- Allow all access (admin auth is handled at app level)
CREATE POLICY "Allow all access to site_scripts"
ON site_scripts
FOR ALL
USING (true)
WITH CHECK (true);

-- ─── Seed with common presets ────────────────────────────────
INSERT INTO site_scripts (name, slug, category, script_type, placement, content, loading_strategy, is_active, priority, notes)
VALUES 
    ('Google Analytics (GA4)', 'google-analytics-ga4', 'analytics', 'script-src', 'head', '', 'afterInteractive', false, 10, 'Set GA4 Measurement ID in content field. Format: G-XXXXXXXXXX'),
    ('Google AdSense', 'google-adsense', 'ads', 'script-src', 'head', '', 'afterInteractive', false, 20, 'Set AdSense client ID in attributes: {"data-ad-client": "ca-pub-XXXXX"}'),
    ('Google Tag Manager', 'google-tag-manager', 'tracking', 'script-inline', 'head', '', 'afterInteractive', false, 5, 'Set GTM container ID in content field. Format: GTM-XXXXXX'),
    ('Google Site Verification', 'google-site-verification', 'verification', 'meta', 'head', '', 'beforeInteractive', false, 1, 'Set verification code in content field'),
    ('Bing Site Verification', 'bing-site-verification', 'verification', 'meta', 'head', '', 'beforeInteractive', false, 2, 'Set Bing verification code in content field'),
    ('Facebook Pixel', 'facebook-pixel', 'tracking', 'script-inline', 'head', '', 'afterInteractive', false, 15, 'Set Facebook Pixel ID in content field'),
    ('Schema.org Organization', 'schema-org-organization', 'structured-data', 'json-ld', 'head', '', 'afterInteractive', false, 30, 'Add JSON-LD structured data for organization'),
    ('Custom Head Script', 'custom-head-script', 'custom', 'script-inline', 'head', '', 'afterInteractive', false, 90, 'Add any custom script to the <head>'),
    ('Custom Body Script', 'custom-body-script', 'custom', 'script-inline', 'body-end', '', 'lazyOnload', false, 95, 'Add any custom script before </body>')
ON CONFLICT (slug) DO NOTHING;
