-- Basit RPC Functions - AdBlock Bypass için
-- Bu fonksiyonları Supabase SQL Editor'da tek tek çalıştırın

-- 1. Ad güncelleme fonksiyonu (basit versiyon)
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
BEGIN
  UPDATE ads SET
    title = ad_title,
    description = ad_description,
    price = ad_price,
    category_id = ad_category_id,
    city = ad_city,
    district = ad_district,
    images = ad_images,
    updated_at = NOW()
  WHERE id = ad_id;
  
  RETURN (SELECT to_json(ads.*) FROM ads WHERE id = ad_id);
END;
$$;

-- 2. View count artırma fonksiyonu
CREATE OR REPLACE FUNCTION increment_view_safe(ad_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE ads SET
    view_count = view_count + 1,
    updated_at = NOW()
  WHERE id = ad_id;
  
  RETURN (SELECT to_json(ads.*) FROM ads WHERE id = ad_id);
END;
$$;

-- 3. Ad silme fonksiyonu
CREATE OR REPLACE FUNCTION delete_ad_safe(ad_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM ads WHERE id = ad_id;
  RETURN TRUE;
END;
$$;
