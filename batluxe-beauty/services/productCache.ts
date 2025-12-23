import { Product } from '../types';

class ProductCache {
  private cache: Product[] | null = null;
  private cacheTime: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  isValid(): boolean {
    return this.cache !== null && (Date.now() - this.cacheTime) < this.CACHE_DURATION;
  }

  get(): Product[] | null {
    if (this.isValid()) {
      return this.cache;
    }
    return null;
  }

  set(products: Product[]): void {
    this.cache = products;
    this.cacheTime = Date.now();
  }

  clear(): void {
    this.cache = null;
    this.cacheTime = 0;
  }

  findById(id: string): Product | null {
    if (!this.isValid()) return null;
    return this.cache?.find(p => p.id === id) || null;
  }
}

export const productCache = new ProductCache();