import React, { useState, useEffect } from 'react';
import { Sparkles, Image as ImageIcon } from 'lucide-react';

interface LazyProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  containerClassName?: string;
  aspectRatio?: string; // e.g. 'aspect-4/3', 'aspect-square', 'aspect-16/10'
  priority?: boolean;
  lowResSrc?: string;
  onClick?: () => void;
  showShimmer?: boolean;
  objectFit?: 'cover' | 'contain';
}

/**
 * Generates an ultra-lightweight, low-resolution thumbnail URL (LQIP)
 * when supported (e.g. Unsplash, Cloudinary), enabling instant blur-up
 * and drastically reducing initial network weight.
 */
export function getLowResPlaceholder(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;

  // Unsplash images: create a tiny ~1KB blurred micro-thumbnail
  if (url.includes('images.unsplash.com')) {
    try {
      const u = new URL(url);
      u.searchParams.set('w', '40');
      u.searchParams.set('q', '20');
      u.searchParams.set('auto', 'format');
      u.searchParams.set('fit', 'crop');
      u.searchParams.set('blur', '20');
      return u.toString();
    } catch {
      return url.replace(/w=\d+/, 'w=40').replace(/q=\d+/, 'q=20') + '&blur=20';
    }
  }

  // Cloudinary images: fetch ultra-low quality placeholder
  if (url.includes('cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', '/upload/w_40,c_scale,q_15,e_blur:200/');
  }

  return null;
}

/**
 * Minimalist inline warm SVG placeholder matching Horon Mousso's artisanal palette
 */
const WARM_SHIMMER_PLACEHOLDER = `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 30'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23FAF6F0' /%3E%3Cstop offset='50%25' stop-color='%23F0E8DC' /%3E%3Cstop offset='100%25' stop-color='%23FAF6F0' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='40' height='30' fill='url(%23g)' /%3E%3C/svg%3E`;

export const LazyProductImage: React.FC<LazyProductImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  containerClassName = '',
  aspectRatio,
  priority = false,
  lowResSrc,
  onClick,
  showShimmer = true,
  objectFit = 'cover'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Auto-derive low-resolution micro thumbnail
  const autoLowRes = lowResSrc || getLowResPlaceholder(src) || WARM_SHIMMER_PLACEHOLDER;

  // Reset loading status if src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden bg-stone-100 ${aspectRatio || ''} ${containerClassName}`}
    >
      {/* 1. Low-Resolution Blur Placeholder / LQIP */}
      {(!isLoaded && !hasError) && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          {autoLowRes ? (
            <img
              src={autoLowRes}
              alt=""
              aria-hidden="true"
              className={`w-full h-full ${objectFit === 'contain' ? 'object-contain' : 'object-cover'} filter blur-md scale-110 opacity-90 transition-opacity duration-700 pointer-events-none`}
              referrerPolicy="no-referrer"
            />
          ) : null}

          {/* Warm subtle shimmer pulse animation */}
          {showShimmer && (
            <div className="absolute inset-0 bg-gradient-to-r from-stone-200/40 via-amber-100/30 to-stone-200/40 animate-pulse pointer-events-none" />
          )}
        </div>
      )}

      {/* 2. Main Full-Resolution Image with Native Lazy Loading & Smooth Decode */}
      {src && !hasError ? (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`relative z-1 ${className} ${
            isLoaded 
              ? 'opacity-100 filter-none transition-all duration-500 ease-out' 
              : 'opacity-0 filter blur-xs'
          }`}
        />
      ) : null}

      {/* 3. Graceful Fallback if image failed to load or is empty */}
      {(hasError || !src) && (
        <div className="absolute inset-0 z-1 flex flex-col items-center justify-center bg-[#FAF9F6] text-stone-400 p-3 text-center border border-stone-200/60">
          <div className="w-9 h-9 rounded-full bg-amber-100/80 text-amber-800 flex items-center justify-center mb-1">
            <Sparkles className="w-4 h-4 text-amber-700" />
          </div>
          <span className="text-[10px] font-semibold text-stone-500 line-clamp-1 max-w-[90%]">
            {alt || 'Horon Mousso'}
          </span>
        </div>
      )}
    </div>
  );
};
