import type { MetadataRoute } from 'next'

// Robots.txt : tout est crawlable sauf l'API et les espaces privés
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard', '/admin', '/instellingen', '/profiel', '/shifts/new'],
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_APP_URL || 'https://chefshift.vercel.app'}/sitemap.xml`,
  }
}
