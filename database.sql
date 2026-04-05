-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar VARCHAR(500),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    icon VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ads table
CREATE TABLE IF NOT EXISTS ads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    images TEXT[] DEFAULT '{}',
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'sold', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    view_count INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false
);

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, ad_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ads_category_id ON ads(category_id);
CREATE INDEX IF NOT EXISTS idx_ads_user_id ON ads(user_id);
CREATE INDEX IF NOT EXISTS idx_ads_status ON ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_city ON ads(city);
CREATE INDEX IF NOT EXISTS idx_ads_created_at ON ads(created_at);
CREATE INDEX IF NOT EXISTS idx_ads_price ON ads(price);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_ad_id ON favorites(ad_id);

-- Insert default categories (only if they don't exist)
INSERT INTO categories (name, slug, icon) VALUES
('Emlak', 'emlak', 'Home'),
('Vasıta', 'vasita', 'Car'),
('İkinci El ve Sıfır Alışveriş', 'alisveris', 'ShoppingBag'),
('İş İlanları', 'is-ilanlari', 'Briefcase'),
('Yedek Parça, Aksesuar', 'yedek-parca', 'Wrench'),
('Elektronik', 'elektronik', 'Smartphone'),
('Ev, Bahçe, Yapı, Market', 'ev-bahce', 'TreePine'),
('Ustalar ve Hizmetler', 'hizmetler', 'Users')
ON CONFLICT (slug) DO NOTHING;

-- Cities and Districts
-- Tables
CREATE TABLE IF NOT EXISTS cities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL UNIQUE,
    plate smallint,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS districts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    name text NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(city_id, name)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cities_name ON cities(name);
CREATE INDEX IF NOT EXISTS idx_districts_city_id ON districts(city_id);
CREATE INDEX IF NOT EXISTS idx_districts_name ON districts(name);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;
DROP POLICY IF EXISTS "Ads are viewable by everyone" ON ads;
DROP POLICY IF EXISTS "Users can view their own ads" ON ads;
DROP POLICY IF EXISTS "Users can create ads" ON ads;
DROP POLICY IF EXISTS "Users can update their own ads" ON ads;
DROP POLICY IF EXISTS "Users can delete their own ads" ON ads;
DROP POLICY IF EXISTS "Users can view their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can create their own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete their own favorites" ON favorites;
DROP POLICY IF EXISTS "Cities read for all" ON cities;
DROP POLICY IF EXISTS "Districts read for all" ON districts;
DROP POLICY IF EXISTS "Cities write for service" ON cities;
DROP POLICY IF EXISTS "Districts write for service" ON districts;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Public users can view limited profile" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- Categories policies (public read access)
CREATE POLICY "Categories are viewable by everyone" ON categories
    FOR SELECT USING (true);

-- Ads policies
CREATE POLICY "Ads are viewable by everyone" ON ads
    FOR SELECT USING (status = 'active');

CREATE POLICY "Users can view their own ads" ON ads
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create ads" ON ads
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own ads" ON ads
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can update any ad" ON ads
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Users can delete their own ads" ON ads
    FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can delete any ad" ON ads
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Favorites policies
CREATE POLICY "Users can view their own favorites" ON favorites
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own favorites" ON favorites
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own favorites" ON favorites
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Read policies (public readable)
CREATE POLICY "Cities read for all" ON cities
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Districts read for all" ON districts
FOR SELECT
TO anon, authenticated
USING (true);

-- (Optional) write policies: only service role (via REST admin key) can write; no app writes
CREATE POLICY "Cities write for service" ON cities
FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Districts write for service" ON districts
FOR INSERT TO service_role WITH CHECK (true);

-- Minimal seed (can be extended)
INSERT INTO cities(name, plate) VALUES
('İstanbul', 34),
('Ankara', 6),
('İzmir', 35),
('Bursa', 16),
('Antalya', 7),
('Balıkesir', 10)
ON CONFLICT (name) DO NOTHING;

INSERT INTO districts(city_id, name)
SELECT c.id, d.name FROM (
    VALUES
    ('İstanbul', 'Kadıköy'), ('İstanbul', 'Beşiktaş'), ('İstanbul', 'Şişli'),
    ('Ankara', 'Çankaya'), ('Ankara', 'Keçiören'),
    ('İzmir', 'Konak'), ('İzmir', 'Bornova'),
    ('Bursa', 'Nilüfer'), ('Bursa', 'Osmangazi'),
    ('Antalya', 'Kepez'), ('Antalya', 'Muratpaşa'),
    ('Balıkesir', 'Altıeylül'), ('Balıkesir', 'Karesi'), ('Balıkesir', 'Ayvalık'), ('Balıkesir', 'Edremit'), ('Balıkesir', 'Bandırma')
) AS d(city_name, name)
JOIN cities c ON c.name = d.city_name
ON CONFLICT (city_id, name) DO NOTHING;

-- RPC Functions for RLS bypass
CREATE OR REPLACE FUNCTION get_public_user(user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  SELECT to_json(users.*) INTO result
  FROM users
  WHERE id = user_id;
  
  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION increment_view(ad_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Direkt ads tablosunu güncelle (listings view'ı ads tablosuna bağlı olabilir)
  UPDATE public.ads
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = ad_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_public_user(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION increment_view(UUID) TO anon, authenticated;

-- Create storage bucket for ad images
INSERT INTO storage.buckets (id, name, public) VALUES ('ad-images', 'ad-images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Storage policies
CREATE POLICY "Images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'ad-images');

CREATE POLICY "Users can upload images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'ad-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own images" ON storage.objects
    FOR UPDATE USING (bucket_id = 'ad-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own images" ON storage.objects
    FOR DELETE USING (bucket_id = 'ad-images' AND auth.uid()::text = (storage.foldername(name))[1]);
