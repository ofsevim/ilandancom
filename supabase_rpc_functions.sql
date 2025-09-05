-- Supabase RPC Functions for AdBlock Bypass
-- Bu fonksiyonları Supabase SQL Editor'da çalıştırın

-- 1. Ad güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_ad_safe(
  ad_id UUID,
  ad_title TEXT,
  ad_description TEXT,
  ad_price NUMERIC,
  ad_category_id UUID,
  ad_city TEXT,
  ad_district TEXT,
  ad_images TEXT[]
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Ads tablosunu güncelle
  UPDATE ads SET
    title = COALESCE(ad_title, title),
    description = COALESCE(ad_description, description),
    price = COALESCE(ad_price, price),
    category_id = COALESCE(ad_category_id, category_id),
    city = COALESCE(ad_city, city),
    district = COALESCE(ad_district, district),
    images = COALESCE(ad_images, images),
    updated_at = NOW()
  WHERE id = ad_id;
  
  -- Güncellenmiş kaydı döndür
  SELECT to_json(ads.*) INTO result
  FROM ads
  WHERE id = ad_id;
  
  RETURN result;
END;
$$;

-- 2. View count artırma fonksiyonu
CREATE OR REPLACE FUNCTION increment_view_safe(ad_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- View count'u artır
  UPDATE ads SET
    view_count = view_count + 1,
    updated_at = NOW()
  WHERE id = ad_id;
  
  -- Güncellenmiş kaydı döndür
  SELECT to_json(ads.*) INTO result
  FROM ads
  WHERE id = ad_id;
  
  RETURN result;
END;
$$;

-- 3. Ad silme fonksiyonu
CREATE OR REPLACE FUNCTION delete_ad_safe(ad_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Ad'ı sil
  DELETE FROM ads WHERE id = ad_id;
  
  RETURN TRUE;
END;
$$;

-- 4. Public user bilgisi alma fonksiyonu
CREATE OR REPLACE FUNCTION get_public_user_safe(user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Public user bilgilerini al
  SELECT to_json(users.*) INTO result
  FROM users
  WHERE id = user_id;
  
  RETURN result;
END;
$$;