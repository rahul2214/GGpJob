import type { MetadataRoute } from 'next';
import { siteUrl } from '@/lib/site';

// Served at /manifest.webmanifest and linked from every page automatically.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'JobsDart — Find Jobs, Build Your Resume & Grow Your Career',
    short_name: 'JobsDart',
    description:
      'AI-powered job portal to discover global and remote jobs, build ATS-friendly resumes and check ATS scores.',
    id: siteUrl('/'),
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#7c3aed',
    categories: ['business', 'productivity', 'education'],
    lang: 'en-IN',
    icons: [
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
      { src: '/logo-icon.png', sizes: 'any', type: 'image/png', purpose: 'any' },
    ],
  };
}
