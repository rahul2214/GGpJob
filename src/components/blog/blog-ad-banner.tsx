'use client';

import { useEffect } from 'react';

interface BlogAdBannerProps {
  slot?: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'horizontal';
  responsive?: boolean;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

/**
 * Optional manual AdSense ad unit component for blog articles.
 * The main Google AdSense auto-ads script is automatically loaded by src/app/blog/layout.tsx.
 */
export function BlogAdBanner({
  slot,
  format = 'auto',
  responsive = true,
  className = '',
}: BlogAdBannerProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && slot) {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (err) {
      console.warn('[AdSense] Banner init:', err);
    }
  }, [slot]);

  if (!slot) return null;

  return (
    <div className={`my-8 text-center overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-3640606958192895"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
}
