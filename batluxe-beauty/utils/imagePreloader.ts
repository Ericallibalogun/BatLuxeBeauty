// Image preloader utility for faster loading
class ImagePreloader {
  private cache = new Set<string>();
  private preloadQueue: string[] = [];
  private isProcessing = false;

  // Preload a single image
  preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.cache.has(src)) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        this.cache.add(src);
        resolve();
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  // Preload multiple images with priority queue
  async preloadImages(urls: string[], priority: 'high' | 'low' = 'low') {
    if (priority === 'high') {
      // High priority - preload immediately
      const promises = urls.map(url => this.preloadImage(url));
      await Promise.allSettled(promises);
    } else {
      // Low priority - add to queue
      this.preloadQueue.push(...urls);
      this.processQueue();
    }
  }

  // Process preload queue in background
  private async processQueue() {
    if (this.isProcessing || this.preloadQueue.length === 0) return;
    
    this.isProcessing = true;
    
    while (this.preloadQueue.length > 0) {
      const url = this.preloadQueue.shift();
      if (url && !this.cache.has(url)) {
        try {
          await this.preloadImage(url);
          // Small delay to not block main thread
          await new Promise(resolve => setTimeout(resolve, 10));
        } catch (error) {
          console.warn('Failed to preload image:', url);
        }
      }
    }
    
    this.isProcessing = false;
  }

  // Check if image is cached
  isCached(src: string): boolean {
    return this.cache.has(src);
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
    this.preloadQueue = [];
  }
}

export const imagePreloader = new ImagePreloader();

// Preload critical images on app start
export const preloadCriticalImages = () => {
  const criticalImages = [
    'https://picsum.photos/400/400', // Fallback image
    // Add other critical images here
  ];
  
  imagePreloader.preloadImages(criticalImages, 'high');
};