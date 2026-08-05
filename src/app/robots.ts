import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/profile/', '/applications/', '/dashboard/', '/admin/'],
    },
    sitemap: 'https://jobsdart.in/sitemap.xml', // Replace with your actual domain when launching
  }
}
