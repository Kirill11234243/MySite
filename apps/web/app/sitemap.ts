import type { MetadataRoute } from 'next';
import { apiUrl } from '../lib/api';

type SitemapProduct = { id: string; updatedAt?: string };

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.SITE_URL || (process.env.SITE_HOST ? `https://${process.env.SITE_HOST}` : 'http://localhost:3000');
  let products: SitemapProduct[] = [];
  try {
    const response = await fetch(apiUrl('/products'), { cache: 'no-store' });
    if (response.ok) products = await response.json();
  } catch {
    products = [];
  }
  return [
    { url: siteUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/catalog`, changeFrequency: 'daily', priority: 0.9 },
    ...products.map((product) => ({
      url: `${siteUrl}/product/${product.id}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
