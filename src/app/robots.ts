import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/admin/', '/chat/', '/orders/', '/profile/', '/api/'],
      },
    ],
    sitemap: 'https://go-orient.com/sitemap.xml',
  }
}
