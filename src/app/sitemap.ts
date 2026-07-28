import type { MetadataRoute } from 'next'

// Sitemap des pages publiques et indexables
export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.chefshift.nl'
  const nu = new Date()
  return [
    { url: `${base}/`, lastModified: nu, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/register`, lastModified: nu, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/shifts`, lastModified: nu, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${base}/login`, lastModified: nu, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${base}/voorwaarden`, lastModified: nu, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/privacy`, lastModified: nu, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
