import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Product } from '../types';

interface VirtualizedProductGridProps {
  products: Product[];
  renderProduct: (product: Product, index: number) => React.ReactNode;
  itemsPerRow?: number;
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
}

const VirtualizedProductGrid: React.FC<VirtualizedProductGridProps> = ({
  products,
  renderProduct,
  itemsPerRow = 6,
  itemHeight = 320,
  containerHeight = 600,
  overscan = 5
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const totalRows = Math.ceil(products.length / itemsPerRow);
    const startRow = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endRow = Math.min(
      totalRows - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );
    
    return {
      startRow,
      endRow,
      startIndex: startRow * itemsPerRow,
      endIndex: Math.min(products.length - 1, (endRow + 1) * itemsPerRow - 1)
    };
  }, [scrollTop, products.length, itemsPerRow, itemHeight, containerHeight, overscan]);

  // Get visible products
  const visibleProducts = useMemo(() => {
    return products.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [products, visibleRange.startIndex, visibleRange.endIndex]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const totalHeight = Math.ceil(products.length / itemsPerRow) * itemHeight;
  const offsetY = visibleRange.startRow * itemHeight;

  return (
    <div
      ref={setContainerRef}
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {visibleProducts.map((product, index) => (
              <div key={product.id}>
                {renderProduct(product, visibleRange.startIndex + index)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualizedProductGrid;