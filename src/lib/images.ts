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
function getOptimalQuality(baseQuality?: number): number {
  const defaultQuality = baseQuality || 75;
  
  // Browser check
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return defaultQuality;
  }
  
  try {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection && connection.effectiveType) {
        // Slow connection - reduce quality
        if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
          return Math.max(30, defaultQuality - 30);
        }
        // Fast connection - maintain quality
        if (connection.effectiveType === '4g' && connection.downlink > 10) {
          return Math.min(90, defaultQuality + 10);
        }
      }
    }
  } catch (e) {
    // Ignore errors
  }
  
  return defaultQuality;
}

// Device pixel ratio aware sizing
function getOptimalSize(width?: number, height?: number): { width?: number; height?: number } {
  // Browser check
  if (typeof window === 'undefined') {
    return { width, height };
  }
  
  try {
    const dpr = window.devicePixelRatio || 1;
    const maxDpr = Math.min(dpr, 2); // Cap at 2x for performance
    
    return {
      width: width ? Math.round(width * maxDpr) : undefined,
      height: height ? Math.round(height * maxDpr) : undefined
    };
  } catch (e) {
    return { width, height };
  }
}

// Supabase Storage görüntü dönüşümleri için URL oluşturucu.
export function buildImageUrl(originalUrl: string, options: ImageTransformOptions = {}): string {
  if (!originalUrl) return originalUrl;
  
  try {
    // Create cache key
    const cacheKey = `${originalUrl}:${JSON.stringify(options)}`;
    
    // Check cache first
    if (urlCache.has(cacheKey)) {
      return urlCache.get(cacheKey)!;
    }
    
    const url = new URL(originalUrl);
    
    // Apply optimizations only in browser environment
    let finalWidth = options.width;
    let finalHeight = options.height;
    let finalQuality = options.quality || 75;
    
    if (typeof window !== 'undefined') {
      const optimalSize = getOptimalSize(options.width, options.height);
      const optimalQuality = getOptimalQuality(options.quality);
      
      finalWidth = optimalSize.width;
      finalHeight = optimalSize.height;
      finalQuality = optimalQuality;
    }
    
    if (finalWidth) url.searchParams.set('width', String(finalWidth));
    if (finalHeight) url.searchParams.set('height', String(finalHeight));
    if (finalQuality) url.searchParams.set('quality', String(finalQuality));
    if (options.resize) url.searchParams.set('resize', options.resize);
    
    // Default to WebP for better compression
    const format = options.format || 'webp';
    if (format !== 'origin') url.searchParams.set('format', format);
    
    const result = url.toString();
    
    // Cache the result (limit cache size)
    if (urlCache.size > 1000) {
      const firstKey = urlCache.keys().next().value;
      if (firstKey) urlCache.delete(firstKey);
    }
    urlCache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    // Geçersiz URL ise orijinali döndür.
    console.warn('buildImageUrl error:', error);
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


