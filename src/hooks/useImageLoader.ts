import { useState, useEffect, useRef } from 'react';
import { buildImageUrl, ImageTransformOptions } from '../lib/images';

interface UseImageLoaderOptions extends ImageTransformOptions {
  placeholder?: string;
  lazy?: boolean;
}

export function useImageLoader(src: string, options: UseImageLoaderOptions = {}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [loadedSrc, setLoadedSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>();

  useEffect(() => {
    if (!src) return;

    setLoading(true);
    setError(false);

    // Create optimized URL
    const optimizedSrc = buildImageUrl(src, options);

    // Preload image
    const img = new Image();
    
    img.onload = () => {
      setLoadedSrc(optimizedSrc);
      setLoading(false);
      setError(false);
    };

    img.onerror = () => {
      setLoading(false);
      setError(true);
      // Fallback to placeholder or original
      setLoadedSrc(options.placeholder || src);
    };

    img.src = optimizedSrc;
    imgRef.current = img;

    return () => {
      if (imgRef.current) {
        imgRef.current.onload = null;
        imgRef.current.onerror = null;
      }
    };
  }, [src, JSON.stringify(options)]);

  return {
    src: loadedSrc,
    loading,
    error
  };
}

// Progressive image loading hook
export function useProgressiveImage(src: string, placeholderSrc: string, options: ImageTransformOptions = {}) {
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(buildImageUrl(src, options));
      setLoading(false);
    };

    img.onerror = () => {
      setLoading(false);
    };

    img.src = buildImageUrl(src, options);

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, JSON.stringify(options)]);

  return {
    src: currentSrc,
    loading
  };
}