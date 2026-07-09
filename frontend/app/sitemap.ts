import type { MetadataRoute } from 'next';
import { backendFetchApi } from '@/lib/api/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    const res = await backendFetchApi<{ data: Array<{ slug: string; updatedAt?: string }> }>(
      '/search/properties?limit=100',
      { auth: false },
    );
    const propertyPages: MetadataRoute.Sitemap = (res.data ?? []).map((p) => ({
      url: `${baseUrl}/properties/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
    return [...staticPages, ...propertyPages];
  } catch {
    return staticPages;
  }
}
