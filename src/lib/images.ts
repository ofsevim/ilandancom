export type ImageTransformOptions = {
  width?: number;
  height?: number;
  quality?: number; // 1-100
  resize?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  format?: 'origin' | 'webp' | 'png' | 'jpeg';
  blur?: number; // 0-100
  sharpen?: number; // 0-100
};

// Farklı cihaz türleri için optimize edilmiş resim boyutları
export const IMAGE_SIZES = {
  thumbnail: { width: 150, height: 150, quality: 70 },
  card: { width: 400, height: 300, quality: 80 },
  detail: { width: 800, height: 600, quality: 85 },
  fullscreen: { width: 1200, height: 900, quality: 90 },
  hero: { width: 1920, height: 1080, quality: 95 }
} as const;

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
    if (options.blur) url.searchParams.set('blur', String(options.blur));
    if (options.sharpen) url.searchParams.set('sharpen', String(options.sharpen));
    return url.toString();
  } catch {
    // Geçersiz URL ise orijinali döndür.
    return originalUrl;
  }
}

// Responsive resim URL'leri oluştur
export function buildResponsiveImageUrls(originalUrl: string, size: keyof typeof IMAGE_SIZES): {
  src: string;
  srcSet: string;
  sizes: string;
} {
  const baseSize = IMAGE_SIZES[size];
  const src = buildImageUrl(originalUrl, { ...baseSize, format: 'webp' });
  
  // Farklı çözünürlükler için srcSet
  const srcSet = [
    buildImageUrl(originalUrl, { ...baseSize, width: baseSize.width * 0.5, format: 'webp' }) + ' 0.5x',
    buildImageUrl(originalUrl, { ...baseSize, format: 'webp' }) + ' 1x',
    buildImageUrl(originalUrl, { ...baseSize, width: baseSize.width * 1.5, format: 'webp' }) + ' 1.5x',
    buildImageUrl(originalUrl, { ...baseSize, width: baseSize.width * 2, format: 'webp' }) + ' 2x'
  ].join(', ');

  // Responsive sizes
  const sizes = size === 'card' 
    ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw'
    : size === 'detail'
    ? '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw'
    : '100vw';

  return { src, srcSet, sizes };
}


