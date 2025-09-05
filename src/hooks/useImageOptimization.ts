import { useState, useEffect } from 'react';

// Network bağlantı hızını tespit et
export function useNetworkSpeed() {
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    // @ts-ignore - navigator.connection henüz standart değil
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      const updateConnectionStatus = () => {
        // Yavaş bağlantı tespiti
        const isSlow = connection.effectiveType === 'slow-2g' || 
                      connection.effectiveType === '2g' ||
                      connection.downlink < 1.5; // 1.5 Mbps'den az
        
        setIsSlowConnection(isSlow);
      };

      updateConnectionStatus();
      connection.addEventListener('change', updateConnectionStatus);

      return () => connection.removeEventListener('change', updateConnectionStatus);
    }

    // Fallback: User agent'a göre tahmin
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    setIsSlowConnection(isMobile);
  }, []);

  return isSlowConnection;
}

// Resim yükleme durumunu takip et
export function useImageLoading() {
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const startLoading = (src: string) => {
    setLoadingImages(prev => new Set(prev).add(src));
  };

  const finishLoading = (src: string) => {
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(src);
      return newSet;
    });
    setLoadedImages(prev => new Set(prev).add(src));
  };

  const isImageLoading = (src: string) => loadingImages.has(src);
  const isImageLoaded = (src: string) => loadedImages.has(src);

  return {
    startLoading,
    finishLoading,
    isImageLoading,
    isImageLoaded,
    loadingCount: loadingImages.size
  };
}

// Resim öncelik sıralaması
export function getImagePriority(index: number, total: number): 'high' | 'low' | 'auto' {
  if (index === 0) return 'high'; // İlk resim yüksek öncelik
  if (index < 3) return 'auto';   // İlk 3 resim normal öncelik
  return 'low';                   // Diğerleri düşük öncelik
}
