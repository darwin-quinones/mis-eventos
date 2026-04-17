import { useState, type ImgHTMLAttributes } from 'react';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  fallback?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
}

export const OptimizedImage = ({
  src,
  alt,
  fallback,
  sizes,
  loading = 'lazy',
  className = '',
  ...props
}: OptimizedImageProps) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Check if URL is external (not from our server)
  const isExternalUrl = (url: string): boolean => {
    return url.startsWith('http://') || url.startsWith('https://');
  };

  // Generate WebP version URL if original is not WebP (only for local images)
  const getWebPUrl = (url: string): string => {
    if (isExternalUrl(url) || url.endsWith('.webp')) return url;
    return url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  };

  // Generate srcset for responsive images (only for local images)
  const generateSrcSet = (url: string): string | undefined => {
    // Don't generate srcset for external URLs
    if (isExternalUrl(url)) return undefined;

    const baseUrl = url.replace(/\.(jpg|jpeg|png|webp)$/i, '');
    const ext = url.match(/\.(jpg|jpeg|png|webp)$/i)?.[0] || '.jpg';
    
    // Generate different sizes (assuming server supports this)
    return `
      ${baseUrl}-320w${ext} 320w,
      ${baseUrl}-640w${ext} 640w,
      ${baseUrl}-1024w${ext} 1024w,
      ${baseUrl}-1920w${ext} 1920w
    `.trim();
  };

  const handleError = () => {
    setError(true);
  };

  const handleLoad = () => {
    setLoaded(true);
  };

  // Use fallback if error or no src
  const imageSrc = error || !src ? (fallback || '/placeholder.jpg') : src;
  const webpSrc = error || !src ? imageSrc : getWebPUrl(src);
  const srcSet = generateSrcSet(webpSrc);
  const isExternal = isExternalUrl(imageSrc);

  return (
    <picture>
      {/* WebP source for modern browsers (only for local images with srcset) */}
      {!error && src && !isExternal && srcSet && (
        <source
          type="image/webp"
          srcSet={srcSet}
          sizes={sizes || '100vw'}
        />
      )}
      
      {/* Fallback to original format */}
      <img
        src={imageSrc}
        alt={alt}
        loading={loading}
        onError={handleError}
        onLoad={handleLoad}
        className={`transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        } ${className}`}
        {...props}
      />
    </picture>
  );
};
