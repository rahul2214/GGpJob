import { MetadataRoute } from 'next'
import { SITE_URL, siteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Signed-in, transactional and admin surfaces carry no search value and
      // would otherwise dilute crawl budget across thousands of job pages.
      disallow: [
        '/api/',
        '/admin/',
        '/profile/',
        '/applications/',
        '/dashboard/',
        '/messages/',
        '/notifications/',
        '/onboarding/',
        '/auth/',
        '/feedback/',
        '/rewards/',
        '/jobseeker/',
        '/jobs/post',
        '/jobs/edit/',
        '/jobs/saved',
        '/company/payment',
        '/communities/admin',
        '/network-error',
        '/offline',
      ],
    },
    sitemap: siteUrl('/sitemap.xml'),
    host: SITE_URL,
  }
}
