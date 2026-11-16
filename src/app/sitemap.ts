import { MetadataRoute } from 'next';
import { INITIAL_JOBS } from '../data/seed';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rozgarx.com';
  const currentDate = new Date().toISOString();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0
    },
    {
      url: `${baseUrl}/findjobs`,
      lastModified: currentDate,
      changeFrequency: 'hourly',
      priority: 0.9
    },
    {
      url: `${baseUrl}/companies`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.8
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.7
    },
    {
      url: `${baseUrl}/career-advice`,
      lastModified: currentDate,
      changeFrequency: 'weekly',
      priority: 0.7
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: 'monthly',
      priority: 0.5
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: 'yearly',
      priority: 0.3
    }
  ];

  // Dynamic public indexable jobs (approved only)
  const jobRoutes: MetadataRoute.Sitemap = INITIAL_JOBS
    .filter(j => j.status === 'approved')
    .map(job => ({
      url: `${baseUrl}/findjobs?jobId=${job.id}`,
      lastModified: job.updatedAt || currentDate,
      changeFrequency: 'weekly',
      priority: job.isFeatured ? 0.9 : 0.8
    }));

  return [...staticRoutes, ...jobRoutes];
}

