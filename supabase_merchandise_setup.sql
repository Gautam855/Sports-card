-- SQL Script to create the merchandise table in Supabase

CREATE TABLE public.merchandise (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    
    name TEXT NOT NULL,
    description TEXT,
    sport TEXT NOT NULL DEFAULT 'football',
    category TEXT NOT NULL DEFAULT 'jerseys',
    brand TEXT,
    athlete TEXT,
    
    image_url TEXT,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'USD',
    
    featured BOOLEAN DEFAULT false,
    placements TEXT[] DEFAULT '{}',
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    affiliate_url TEXT,
    tags TEXT[] DEFAULT '{}'
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.merchandise ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active merchandise
CREATE POLICY "Allow public read access to active merchandise" 
ON public.merchandise 
FOR SELECT 
TO public 
USING (is_active = true);

-- Allow authenticated users (Admins) to manage all merchandise
CREATE POLICY "Allow authenticated users full access" 
ON public.merchandise 
FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- Create some sample data
INSERT INTO public.merchandise (name, sport, category, brand, athlete, price, currency, featured, placements, is_active, affiliate_url)
VALUES 
    ('Official Real Madrid Home Jersey 24/25', 'football', 'jerseys', 'Adidas', 'Jude Bellingham', 120.00, 'USD', true, ARRAY['homepage', 'store_hero', 'store_grid'], true, 'https://example.com'),
    ('Kobe 8 Protro "Halo"', 'basketball', 'shoes', 'Nike', 'Kobe Bryant', 190.00, 'USD', true, ARRAY['homepage', 'store_hero', 'store_grid'], true, 'https://example.com'),
    ('Babolat Pure Aero Racket', 'tennis', 'equipment', 'Babolat', 'Carlos Alcaraz', 259.00, 'USD', false, ARRAY['store_grid'], true, 'https://example.com'),
    ('Asics Metaspeed Sky Paris', 'running', 'shoes', 'Asics', null, 250.00, 'USD', false, ARRAY['store_grid'], true, 'https://example.com'),
    ('Nike Vaporfly 3', 'running', 'shoes', 'Nike', null, 260.00, 'USD', true, ARRAY['store_hero', 'store_grid'], true, 'https://example.com'),
    ('Lionel Messi Inter Miami Jersey', 'football', 'jerseys', 'Adidas', 'Lionel Messi', 130.00, 'USD', true, ARRAY['homepage', 'store_grid', 'match_sidebar'], true, 'https://example.com'),
    ('LeBron 21 Signature Shoe', 'basketball', 'shoes', 'Nike', 'LeBron James', 200.00, 'USD', false, ARRAY['store_grid', 'match_sidebar'], true, 'https://example.com'),
    ('Novak Djokovic Lacoste Polo', 'tennis', 'apparel', 'Lacoste', 'Novak Djokovic', 110.00, 'USD', false, ARRAY['store_grid'], true, 'https://example.com');
