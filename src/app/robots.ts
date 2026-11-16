import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rozgarx.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/findjobs',
          '/companies',
          '/how-it-works',
          '/career-advice',
          '/about',
          '/contact',
          '/privacy',
          '/terms'
        ],
        disallow: [
          '/admin',
          '/admin/*',
          '/api/',
          '/api/*'
        ]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`
  };
}

