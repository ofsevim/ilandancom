import React, { useState } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { buildImageUrl } from '../lib/images';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  resize?: 'cover' | 'contain' | 'fill';
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  width = 400,
  height = 300,
  quality = 60,
  format = 'webp',
  resize = 'cover',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzljYTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPll1a2xlbml5b3IuLi48L3RleHQ+PC9zdmc+',
  onLoad,
  onError
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { elementRef, hasIntersected } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '100px',
    triggerOnce: true
  });

  const handleLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setImageError(true);
    onError?.();
  };

  const imageUrl = hasIntersected 
    ? buildImageUrl(src, { width, height, quality, resize, format })
    : placeholder;

  return (
    <div 
      ref={elementRef as React.RefObject<HTMLDivElement>}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Placeholder */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {/* Error State */}
      {imageError && (
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Resim Yüklenemedi</p>
          </div>
        </div>
      )}

      {/* Actual Image */}
      {hasIntersected && (
        <img
          src={imageUrl}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
    </div>
  );
};

export default LazyImage;
