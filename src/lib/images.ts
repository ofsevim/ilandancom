export type ImageTransformOptions = {
  width?: number;
  height?: number;
  quality?: number; // 1-100
  resize?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  format?: 'origin' | 'webp' | 'png' | 'jpeg';
};

// Supabase Storage görüntü dönüşümleri için URL oluşturucu.
// Not: Public URL'lere ?width=&height=&quality=&resize=&format= parametreleri eklenebilir.
export function buildImageUrl(originalUrl: string, options: ImageTransformOptions = {}): string {
  if (!originalUrl) return originalUrl;
  try {
    const url = new URL(originalUrl);
    if (options.width) url.searchParams.set('width', String(options.width));
    if (options.height) url.searchParams.set('height', String(options.height));
    if (options.quality) url.searchParams.set('quality', String(options.quality));
    if (options.resize) url.searchParams.set('resize', options.resize);
    if (options.format) url.searchParams.set('format', options.format);
    return url.toString();
  } catch {
    // Geçersiz URL ise orijinali döndür.
    return originalUrl;
  }
}


