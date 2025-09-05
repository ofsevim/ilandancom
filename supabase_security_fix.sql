-- Supabase Güvenlik Sorunu Çözümü
-- listings view'ındaki SECURITY DEFINER sorunu

-- 1. Mevcut view'ı kaldır
DROP VIEW IF EXISTS public.listings;

-- 2. Güvenli view oluştur (SECURITY INVOKER - varsayılan)
CREATE VIEW public.listings AS
SELECT 
    a.id,
    a.title,
    a.description,
    a.price,
    a.category_id,
    a.city,
    a.district,
    a.latitude,
    a.longitude,
    a.images,
    a.user_id,
    a.status,
    a.created_at,
    a.updated_at,
    a.view_count,
    a.featured,
    c.name as category_name,
    c.slug as category_slug,
    c.icon as category_icon,
    u.name as user_name,
    u.email as user_email,
    u.phone as user_phone,
    u.avatar as user_avatar,
    u.role as user_role,
    u.created_at as user_created_at,
    u.is_active as user_is_active
FROM ads a
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN users u ON a.user_id = u.id
WHERE a.status = 'active'; -- Sadece aktif ilanlar

-- 3. RLS politikalarını etkinleştir
ALTER VIEW public.listings ENABLE ROW LEVEL SECURITY;

-- 4. Güvenlik politikaları oluştur
CREATE POLICY "listings_view_policy" ON public.listings
    FOR SELECT 
    TO authenticated, anon
    USING (true); -- Herkes aktif ilanları görebilir

-- 5. İsteğe bağlı: Admin için özel politika
CREATE POLICY "admin_listings_policy" ON public.listings
    FOR SELECT 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 6. View için gerekli izinleri ver
GRANT SELECT ON public.listings TO authenticated;
GRANT SELECT ON public.listings TO anon;

-- 7. Alternatif: SECURITY DEFINER fonksiyon kullanımı
-- Eğer özel yetkiler gerekirse:

CREATE OR REPLACE FUNCTION public.get_listings_with_permissions()
RETURNS TABLE (
    id uuid,
    title text,
    description text,
    price decimal,
    category_id uuid,
    city text,
    district text,
    latitude decimal,
    longitude decimal,
    images text[],
    user_id uuid,
    status text,
    created_at timestamptz,
    updated_at timestamptz,
    view_count integer,
    featured boolean,
    category_name text,
    category_slug text,
    category_icon text,
    user_name text,
    user_email text,
    user_phone text,
    user_avatar text,
    user_role text,
    user_created_at timestamptz,
    user_is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER -- Bu fonksiyon için gerekli
SET search_path = public
AS $$
BEGIN
    -- RLS kontrolü
    IF NOT (auth.role() = 'authenticated' OR auth.role() = 'anon') THEN
        RAISE EXCEPTION 'Unauthorized access';
    END IF;
    
    RETURN QUERY
    SELECT 
        a.id,
        a.title,
        a.description,
        a.price,
        a.category_id,
        a.city,
        a.district,
        a.latitude,
        a.longitude,
        a.images,
        a.user_id,
        a.status,
        a.created_at,
        a.updated_at,
        a.view_count,
        a.featured,
        c.name as category_name,
        c.slug as category_slug,
        c.icon as category_icon,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        u.avatar as user_avatar,
        u.role as user_role,
        u.created_at as user_created_at,
        u.is_active as user_is_active
    FROM ads a
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN users u ON a.user_id = u.id
    WHERE a.status = 'active';
END;
$$;

-- Fonksiyon için izinler
GRANT EXECUTE ON FUNCTION public.get_listings_with_permissions() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_listings_with_permissions() TO anon;

-- 8. API servislerini güncellemek için örnek
-- Eğer API'de bu fonksiyonu kullanmak istersen:
-- SELECT * FROM public.get_listings_with_permissions();
