// Retry utility for API calls
export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain errors
      if (error instanceof Error && (
        error.message.includes('permission denied') ||
        error.message.includes('unauthorized') ||
        error.message.includes('not found')
      )) {
        throw error;
      }
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
};

// Network error detection
export const isNetworkError = (error: any): boolean => {
  return (
    error?.message?.includes('Failed to fetch') ||
    error?.message?.includes('NetworkError') ||
    error?.message?.includes('fetch') ||
    error?.code === 'NETWORK_ERROR' ||
    !navigator.onLine
  );
};
