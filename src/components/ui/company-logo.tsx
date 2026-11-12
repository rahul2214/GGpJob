"use client";

import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper to sanitize domain
function extractDomain(urlOrName?: string | null): string | null {
  if (!urlOrName) return null;
  try {
    let clean = urlOrName.trim();
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      const parsed = new URL(clean);
      return parsed.hostname.replace(/^www\./, '');
    }
    // Clean string like "company.com" or "example.org/path"
    if (clean.includes('.')) {
      return clean.split('/')[0].replace(/^www\./, '');
    }
  } catch {
    // fallback
  }
  return null;
}

// Brand mapping for top companies to domain
const KNOWN_COMPANY_DOMAINS: Record<string, string> = {
  'google': 'google.com',
  'google cloud': 'cloud.google.com',
  'microsoft': 'microsoft.com',
  'amazon': 'amazon.com',
  'amazon web services': 'aws.amazon.com',
  'amazon web services (aws)': 'aws.amazon.com',
  'aws': 'aws.amazon.com',
  'meta': 'meta.com',
  'meta platforms': 'meta.com',
  'apple': 'apple.com',
  'netflix': 'netflix.com',
  'stripe': 'stripe.com',
  'adobe': 'adobe.com',
  'salesforce': 'salesforce.com',
  'tesla': 'tesla.com',
  'spotify': 'spotify.com',
  'figma': 'figma.com',
  'reddit': 'reddit.com',
  'pinterest': 'pinterest.com',
  'mongodb': 'mongodb.com',
  'databricks': 'databricks.com',
  'gusto': 'gusto.com',
  'carta': 'carta.com',
  'roblox': 'roblox.com',
  'vercel': 'vercel.com',
  'dropbox': 'dropbox.com',
  'gitlab': 'gitlab.com',
  'cloudflare': 'cloudflare.com',
  'postman': 'postman.com',
  'elastic': 'elastic.co',
  'inmobi': 'inmobi.com',
  'twilio': 'twilio.com',
  'robinhood': 'robinhood.com',
  'coinbase': 'coinbase.com',
  'checkr': 'checkr.com',
  'lyft': 'lyft.com',
  'uber': 'uber.com',
  'airbnb': 'airbnb.com',
  'twitter': 'x.com',
  'x': 'x.com',
  'linkedin': 'linkedin.com',
  'github': 'github.com',
  'slack': 'slack.com',
  'zoom': 'zoom.us',
  'shopify': 'shopify.com',
  'atlassian': 'atlassian.com',
  'datadog': 'datadoghq.com',
  'veltria': 'veltria.in',
  'ashva cognitive systems': 'veltria.in',
};

// Curated SVG Brand Marks for instantly crisp, zero-latency vector rendering
function BrandSvg({ brand, className }: { brand: string; className?: string }) {
  const norm = brand.toLowerCase().trim();

  if (norm.includes('google') && !norm.includes('cloud')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
      </svg>
    );
  }

  if (norm.includes('microsoft')) {
    return (
      <svg className={className} viewBox="0 0 23 23">
        <path fill="#f35325" d="M1 1h10v10H1z" />
        <path fill="#81bc06" d="M12 1h10v10H12z" />
        <path fill="#05a6f0" d="M1 12h10v10H1z" />
        <path fill="#ffba08" d="M12 12h10v10H12z" />
      </svg>
    );
  }

  if (norm.includes('apple')) {
    return (
      <svg className={className} viewBox="0 0 170 170" fill="currentColor">
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.08-7.71-7.96-12.02-14.64-6.8-10.45-12.03-21.94-15.68-34.48-3.66-12.53-5.49-24.16-5.49-34.89 0-14.54 3.59-26.68 10.77-36.42 7.18-9.74 16.3-14.76 27.35-15.05 4.7 0 10.05 1.25 16.05 3.75 6 2.5 9.77 3.86 11.3 4.08 1.94-.43 5.92-1.89 11.94-4.37 6.02-2.49 11.2-3.6 15.54-3.35 11.89.65 21.6 4.9 29.13 12.74-10.44 6.31-15.55 15.11-15.34 26.4.22 8.92 3.69 16.42 10.42 22.5 6.73 6.09 14.77 9.58 24.12 10.49-2.18 6.53-4.8 13.06-7.85 19.59zM119.22 33.51c0-7.39 2.6-14.13 7.8-20.21 5.2-6.09 11.53-9.87 18.99-11.35.22 1.09.33 2.07.33 2.94 0 7.18-2.73 14.03-8.2 20.55-5.47 6.52-12.11 10.23-19.92 11.13-.11-.98-.22-2.07-.33-3.27z" />
      </svg>
    );
  }

  if (norm.includes('meta')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="#0081FB">
        <path d="M12 3C6.48 3 2 6.48 2 10.75c0 2.27 1.29 4.3 3.37 5.68-.11.75-.48 2.05-.72 2.76-.11.31.2.62.51.5 1.5-.58 3.33-1.4 4.34-1.92.8.21 1.63.33 2.5.33 5.52 0 10-3.48 10-7.75S17.52 3 12 3zm4.5 11.2c-.75 0-1.48-.31-2.12-.86-.53-.45-1.07-1.12-1.63-1.97-.68 1.04-1.34 1.83-1.97 2.27-.6.42-1.28.66-2.03.66-1.57 0-2.75-.98-2.75-2.45 0-1.54 1.15-2.77 2.78-3.04.59-.1 1.25-.09 1.95.04.14-.62.37-1.22.7-1.78.6-.99 1.4-1.52 2.37-1.52 1.34 0 2.38.92 2.38 2.36 0 1.24-.77 2.45-1.91 3.23-.49.33-.99.59-1.48.78.36.57.72 1.03 1.08 1.37.42.4 1 .64 1.66.64 1.01 0 1.85-.56 2.22-1.46.08-.2.31-.3.51-.23l1.1.42c.19.07.28.29.21.48-.62 1.43-1.92 2.33-3.66 2.33z" />
      </svg>
    );
  }

  if (norm.includes('amazon') || norm.includes('aws')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none">
        <path d="M13.6 15.8c-2.3 1.7-5.7 2.6-8.6 2.6-4.1 0-7.8-1.5-10.6-4-.2-.2 0-.5.3-.3 3.1 1.8 6.9 2.8 10.8 2.8 2.6 0 5.4-.6 8-1.8.4-.2.7.2.4.5l-.3.2z" fill="#FF9900" />
        <path d="M14.4 14.7c-.3-.4-1.9-.2-2.6 0-.2 0-.3-.2-.1-.3 1.1-.9 2.9-.6 3.1-.3.3.3.1 2.2-.9 3.2-.2.2-.3.1-.3 0 0-.7.8-2.2.8-2.6z" fill="#FF9900" />
        <path d="M9.8 4.2c.4-.8 1-1.3 1.8-1.6.8-.3 1.7-.2 2.4.2.8.5 1.3 1.2 1.5 2.1.2.9 0 1.8-.5 2.6-.5.7-1.2 1.2-2.1 1.4-.4.1-.9.1-1.3 0-.1 0-.2-.1-.2-.2V4.2z" fill="#232F3E" />
      </svg>
    );
  }

  if (norm.includes('netflix')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="#E50914">
        <path d="M4 2h4.5v15.2L15.5 2H20v20h-4.5V6.8L8.5 22H4V2z" />
      </svg>
    );
  }

  if (norm.includes('stripe')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="#635BFF">
        <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C17.652.703 15.023 0 12.062 0 6.643 0 2.766 2.827 2.766 7.625c0 4.887 3.518 6.55 7.158 7.893 2.449.907 3.284 1.631 3.284 2.607 0 .993-.89 1.517-2.316 1.517-2.228 0-5.187-.993-7.234-2.196l-.924 5.518c2.254 1.132 5.378 1.83 8.32 1.83 5.679 0 9.771-2.657 9.771-7.72 0-4.888-3.418-6.685-6.845-7.924z" />
      </svg>
    );
  }

  if (norm.includes('spotify')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="#1DB954">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
    );
  }

  if (norm.includes('tesla')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="#E82127">
        <path d="M12 4.14c2.25 0 5.09.43 7.85 1.5l.55-2.5C17.38 2.37 14.54 2 12 2S6.62 2.37 3.6 3.14l.55 2.5C6.91 4.57 9.75 4.14 12 4.14zm9.85 4.35l-1.42-1.33c-.07-.06-.17-.07-.25-.02-3.1 1.95-6.31 2.5-8.18 2.5s-5.08-.55-8.18-2.5c-.08-.05-.18-.04-.25.02L2.15 8.49c-.08.08-.09.21-.01.3 3.68 4.2 6.55 12.8 6.55 12.8h2.62s-.4-4.88 1.19-8.45c1.59 3.57 1.19 8.45 1.19 8.45h2.62s2.87-8.6 6.55-12.8c.08-.09.07-.22-.01-.3z" />
      </svg>
    );
  }

  if (norm.includes('adobe')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="#FF0000">
        <path d="M13.96 3h8.04v18.5l-8.04-18.5zm-3.92 0H2v18.5l8.04-18.5zm1.96 7.42l4.89 11.08h-3.66l-1.74-4.22H8.7l3.3-6.86z" />
      </svg>
    );
  }

  if (norm.includes('figma')) {
    return (
      <svg className={className} viewBox="0 0 38 57" fill="none">
        <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE" />
        <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83" />
        <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262" />
        <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E" />
        <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF" />
      </svg>
    );
  }

  if (norm.includes('vercel')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 1L24 22H0L12 1Z" />
      </svg>
    );
  }

  if (norm.includes('salesforce')) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="#00A1E0">
        <path d="M19.38 9.38c-.61-2.48-2.83-4.32-5.49-4.32-1.74 0-3.3.79-4.34 2.03C8.84 6.64 8.01 6.36 7.1 6.36c-2.3 0-4.22 1.63-4.66 3.82C1.03 10.74 0 12.28 0 14.07c0 2.37 1.93 4.3 4.3 4.3h14.73c2.75 0 4.97-2.22 4.97-4.97 0-2.3-1.57-4.23-3.62-4.78v-.24z" />
      </svg>
    );
  }

  return null;
}

interface CompanyLogoProps {
  companyName?: string | null;
  companyLogo?: string | null;
  companyWebsite?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallbackClassName?: string;
}

export function CompanyLogo({
  companyName = "Company",
  companyLogo,
  companyWebsite,
  size = "md",
  className,
  fallbackClassName
}: CompanyLogoProps) {
  const safeName = companyName?.trim() || "Company";
  const normName = safeName.toLowerCase();

  // Size mapping classes
  const sizeClasses = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-11 h-11 text-sm",
    lg: "w-14 h-14 text-base",
    xl: "w-16 h-16 text-lg",
  }[size] || "w-11 h-11 text-sm";

  const imgSizeClasses = {
    xs: "w-4 h-4",
    sm: "w-5 h-5",
    md: "w-7 h-7",
    lg: "w-9 h-9",
    xl: "w-10 h-10",
  }[size] || "w-7 h-7";

  // Check if we have an SVG brand logo available
  const hasBrandSvg = Boolean(
    normName.includes('google') ||
    normName.includes('microsoft') ||
    normName.includes('apple') ||
    normName.includes('meta') ||
    normName.includes('amazon') ||
    normName.includes('aws') ||
    normName.includes('netflix') ||
    normName.includes('stripe') ||
    normName.includes('spotify') ||
    normName.includes('tesla') ||
    normName.includes('adobe') ||
    normName.includes('figma') ||
    normName.includes('vercel') ||
    normName.includes('salesforce')
  );

  // Derive domain from website, companyLogo, or name
  const domain =
    extractDomain(companyWebsite) ||
    KNOWN_COMPANY_DOMAINS[normName] ||
    (companyLogo && companyLogo.startsWith('http') ? extractDomain(companyLogo) : null);

  // Build candidate image sources
  const candidateUrls: string[] = [];
  
  if (companyLogo && typeof companyLogo === 'string' && (companyLogo.startsWith('http') || companyLogo.startsWith('/'))) {
    // If it's a known problematic URL (e.g. upload.wikimedia.org or cloudflare hotlink-blocked host), prioritize favicon
    if (companyLogo.includes('upload.wikimedia.org') || companyLogo.includes('gusto.com') || companyLogo.includes('carta.com') || companyLogo.includes('rbxcdn.com')) {
      if (domain) {
        candidateUrls.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
      }
      candidateUrls.push(companyLogo);
    } else {
      candidateUrls.push(companyLogo);
      if (domain) {
        candidateUrls.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
      }
    }
  } else if (domain) {
    candidateUrls.push(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);
    candidateUrls.push(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
  }

  const [candidateIndex, setCandidateIndex] = useState(0);
  const [allFailed, setAllFailed] = useState(false);

  // Reset when inputs change
  useEffect(() => {
    setCandidateIndex(0);
    setAllFailed(false);
  }, [companyLogo, companyName, companyWebsite]);

  // Deterministic colorful hue for fallback avatar
  const hue = (safeName.charCodeAt(0) * 23 + (safeName.charCodeAt(1) || 12) * 17 + safeName.length * 11) % 360;
  const initial = safeName.charAt(0).toUpperCase() || 'C';

  // 1. If Brand SVG is available and we don't have a reliable custom logo overriding it, render the pristine SVG
  if (hasBrandSvg && (!companyLogo || companyLogo.includes('wikimedia') || allFailed)) {
    return (
      <div
        className={cn(
          "rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-white/10 flex items-center justify-center shrink-0 shadow-sm p-2 transition-transform duration-200 group-hover:scale-105",
          sizeClasses,
          className
        )}
      >
        <BrandSvg brand={safeName} className={cn("object-contain", imgSizeClasses)} />
      </div>
    );
  }

  // 2. Try candidate image URLs with progressive fallback
  if (!allFailed && candidateUrls.length > 0 && candidateIndex < candidateUrls.length) {
    const currentSrc = candidateUrls[candidateIndex];

    return (
      <div
        className={cn(
          "rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-white/10 flex items-center justify-center shrink-0 shadow-sm p-1.5 overflow-hidden transition-transform duration-200 group-hover:scale-105",
          sizeClasses,
          className
        )}
      >
        <img
          src={currentSrc}
          alt={`${safeName} logo`}
          className={cn("w-full h-full object-contain transition-opacity duration-200", imgSizeClasses)}
          onError={() => {
            if (candidateIndex + 1 < candidateUrls.length) {
              setCandidateIndex(prev => prev + 1);
            } else {
              setAllFailed(true);
            }
          }}
        />
      </div>
    );
  }

  // 3. If Brand SVG is available as a fallback when candidate images failed
  if (hasBrandSvg) {
    return (
      <div
        className={cn(
          "rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-white/10 flex items-center justify-center shrink-0 shadow-sm p-2 transition-transform duration-200 group-hover:scale-105",
          sizeClasses,
          className
        )}
      >
        <BrandSvg brand={safeName} className={cn("object-contain", imgSizeClasses)} />
      </div>
    );
  }

  // 4. Fallback: Elegant colored monogram avatar badge with subtle gradient & bold initial
  return (
    <div
      className={cn(
        "rounded-xl flex items-center justify-center font-black tracking-tight shrink-0 shadow-sm border select-none transition-transform duration-200 group-hover:scale-105",
        sizeClasses,
        className,
        fallbackClassName
      )}
      style={{
        backgroundColor: `hsl(${hue} 85% 96%)`,
        color: `hsl(${hue} 80% 38%)`,
        borderColor: `hsl(${hue} 70% 85%)`,
      }}
      title={safeName}
    >
      <span className="font-extrabold">{initial}</span>
    </div>
  );
}
export default CompanyLogo;