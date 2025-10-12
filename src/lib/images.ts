export type ImageTransformOptions = {
  width?: number;
  height?: number;
  quality?: number; // 1-100
  resize?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  format?: 'origin' | 'webp' | 'png' | 'jpeg';
};

// URL cache for performance
const urlCache = new Map<string, string>();

// Network-aware quality adjustment
function getOptimalQuality(baseQuality: number = 75): number {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection) {
      // Slow connection - reduce quality
      if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
        return Math.max(30, baseQuality - 30);
      }
      // Fast connection - maintain quality
      if (connection.effectiveType === '4g' && connection.downlink > 10) {
        return Math.min(90, baseQuality + 10);
      }
    }
  }
  return baseQuality;
}

// Device pixel ratio aware sizing
function getOptimalSize(width?: number, height?: number): { width?: number; height?: number } {
  if (typeof window === 'undefined') return { width, height };
  
  const dpr = window.devicePixelRatio || 1;
  const maxDpr = Math.min(dpr, 2); // Cap at 2x for performance
  
  return {
    width: width ? Math.round(width * maxDpr) : undefined,
    height: height ? Math.round(height * maxDpr) : undefined
  };
}

// Supabase Storage görüntü dönüşümleri için URL oluşturucu.
export function buildImageUrl(originalUrl: string, options: ImageTransformOptions = {}): string {
  if (!originalUrl) return originalUrl;
  
  // Create cache key
  const cacheKey = `${originalUrl}:${JSON.stringify(options)}`;
  
  // Check cache first
  if (urlCache.has(cacheKey)) {
    return urlCache.get(cacheKey)!;
  }
  
  try {
    const url = new URL(originalUrl);
    
    // Apply network-aware optimizations
    const optimalQuality = getOptimalQuality(options.quality);
    const optimalSize = getOptimalSize(options.width, options.height);
    
    if (optimalSize.width) url.searchParams.set('width', String(optimalSize.width));
    if (optimalSize.height) url.searchParams.set('height', String(optimalSize.height));
    if (optimalQuality) url.searchParams.set('quality', String(optimalQuality));
    if (options.resize) url.searchParams.set('resize', options.resize);
    
    // Default to WebP for better compression
    const format = options.format || 'webp';
    if (format !== 'origin') url.searchParams.set('format', format);
    
    const result = url.toString();
    
    // Cache the result (limit cache size)
    if (urlCache.size > 1000) {
      const firstKey = urlCache.keys().next().value;
      urlCache.delete(firstKey);
    }
    urlCache.set(cacheKey, result);
    
    return result;
  } catch {
    // Geçersiz URL ise orijinali döndür.
    return originalUrl;
  }
}

// Preload critical images
export function preloadImage(url: string, options: ImageTransformOptions = {}): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = buildImageUrl(url, options);
  });
}

// Lazy load images with intersection observer
export function createLazyImageObserver(callback: (entry: IntersectionObserverEntry) => void) {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }
  
  return new IntersectionObserver(
    (entries) => {
      entries.forEach(callback);
    },
    {
      rootMargin: '50px', // Start loading 50px before image comes into view
      threshold: 0.1
    }
  );
}


