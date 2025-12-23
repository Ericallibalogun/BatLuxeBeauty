import React, { useState } from 'react';

interface FastImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const FastImage: React.FC<FastImageProps> = ({
  src,
  alt,
  className = '',
  placeholder = 'https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=Loading...',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder - only show while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse"></div>
      )}
      
      {/* Actual image - loads immediately, no lazy loading */}
      <img
        src={hasError ? placeholder : src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        // Remove lazy loading for instant display
        loading="eager"
        // Add preload hint for faster loading
        decoding="async"
      />
    </div>
  );
};

export default FastImage;