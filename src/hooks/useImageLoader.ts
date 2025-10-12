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
        if (!src) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(false);

        try {
            // Create optimized URL
            const optimizedSrc = buildImageUrl(src, options);

            // Preload image
            const img = new Image();
            imgRef.current = img;

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
        } catch (err) {
            console.error('useImageLoader error:', err);
            setLoading(false);
            setError(true);
            setLoadedSrc(options.placeholder || src);
        }

        return () => {
            if (imgRef.current) {
                imgRef.current.onload = null;
                imgRef.current.onerror = null;
            }
        };
    }, [src, options.width, options.height, options.quality, options.resize, options.format, options.placeholder]);

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
        if (!src) {
            setLoading(false);
            return;
        }

        try {
            const img = new Image();
            const optimizedSrc = buildImageUrl(src, options);

            img.onload = () => {
                setCurrentSrc(optimizedSrc);
                setLoading(false);
            };

            img.onerror = () => {
                setLoading(false);
            };

            img.src = optimizedSrc;

            return () => {
                img.onload = null;
                img.onerror = null;
            };
        } catch (err) {
            console.error('useProgressiveImage error:', err);
            setLoading(false);
        }
    }, [src, options.width, options.height, options.quality, options.resize, options.format]);

    return {
        src: currentSrc,
        loading
    };
}