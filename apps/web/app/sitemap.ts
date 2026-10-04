import type { MetadataRoute } from 'next';
import { getCatalogProducts } from '../lib/catalog';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.SITE_URL || (process.env.SITE_HOST ? `https://${process.env.SITE_HOST}` : 'http://localhost:3000');
  const products = await getCatalogProducts();
  return [
    { url: siteUrl, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/catalog`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/delivery`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/contacts`, changeFrequency: 'monthly', priority: 0.6 },
    ...products.map((product) => ({
      url: `${siteUrl}/product/${product.id}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
