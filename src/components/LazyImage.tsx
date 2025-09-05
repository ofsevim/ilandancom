import React, { useState, useCallback } from 'react';
import { buildImageUrl } from '../lib/images';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  resize?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  placeholder?: string;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onClick?: (e: React.MouseEvent<HTMLImageElement>) => void;
  decoding?: 'sync' | 'async' | 'auto';
  fetchpriority?: 'high' | 'low' | 'auto';
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  width = 400,
  height = 300,
  quality = 80,
  format = 'webp',
  resize = 'cover',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+',
  onLoad,
  onError,
  onClick,
  decoding = 'async',
  fetchpriority = 'auto'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Unique key için src'yi kullan
  const imageKey = `lazy-image-${src.replace(/[^a-zA-Z0-9]/g, '')}-${width}-${height}`;

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
    <div key={imageKey} className={`relative overflow-hidden ${className}`}>
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
        key={`${imageKey}-img`}
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
        decoding={decoding}
        fetchpriority={fetchpriority}
      />
    </div>
  );
};

export default LazyImage;