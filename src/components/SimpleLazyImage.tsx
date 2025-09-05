import React, { useState, useCallback } from 'react';
import { buildImageUrl } from '../lib/images';

interface SimpleLazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  resize?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onClick?: (e: React.MouseEvent<HTMLImageElement>) => void;
}

const SimpleLazyImage: React.FC<SimpleLazyImageProps> = ({
  src,
  alt,
  className = '',
  width = 400,
  height = 300,
  quality = 80,
  format = 'webp',
  resize = 'cover',
  onLoad,
  onError,
  onClick
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Unique key için src'yi kullan
  const imageKey = `simple-lazy-${src.replace(/[^a-zA-Z0-9]/g, '')}-${width}-${height}`;

  // Event handler'ları useCallback ile optimize et
  const handleLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    onLoad?.(e);
  }, [onLoad]);

  const handleError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    onError?.(e);
  }, [onError]);

  const optimizedSrc = buildImageUrl(src, {
    width,
    height,
    quality,
    format,
    resize
  });

  return (
    <div 
      key={imageKey} // Unique key ekle
      className={`relative overflow-hidden ${className}`}
    >
      {/* Loading Placeholder */}
      {!isLoaded && !hasError && (
        <div 
          className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center"
          style={{ width, height }}
        >
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div 
          className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400"
          style={{ width, height }}
        >
          <div className="text-center">
            <div className="text-2xl mb-2">📷</div>
            <div className="text-sm">Resim Yüklenemedi</div>
          </div>
        </div>
      )}

      {/* Actual Image - Native lazy loading */}
      <img
        key={`${imageKey}-img`} // Image için de unique key
        src={optimizedSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ width, height }}
        onLoad={handleLoad}
        onError={handleError}
        onClick={onClick}
        loading="lazy" // Native lazy loading
        decoding="async"
      />
    </div>
  );
};

export default SimpleLazyImage;
