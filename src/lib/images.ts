export type ImageTransformOptions = {
  width?: number;
  height?: number;
  quality?: number; // 1-100
  resize?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  format?: 'origin' | 'webp' | 'png' | 'jpeg';
};

// Supabase Storage görüntü dönüşümleri için URL oluşturucu.
export function buildImageUrl(originalUrl: string, options: ImageTransformOptions = {}): string {
  if (!originalUrl) return originalUrl;
  
  try {
    const url = new URL(originalUrl);
    
    if (options.width) url.searchParams.set('width', String(options.width));
    if (options.height) url.searchParams.set('height', String(options.height));
    if (options.quality) url.searchParams.set('quality', String(options.quality));
    if (options.resize) url.searchParams.set('resize', options.resize);
    
    // Default to WebP for better compression
    const format = options.format || 'webp';
    if (format !== 'origin') url.searchParams.set('format', format);
    
    return url.toString();
  } catch (error) {
    // Geçersiz URL ise orijinali döndür.
    return originalUrl;
  }
}

// Preload critical images
export function preloadImage(url: string, options: ImageTransformOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      resolve();
      return;
    }
    
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject();
    img.src = buildImageUrl(url, options);
  });
}


