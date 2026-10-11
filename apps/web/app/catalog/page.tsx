import type { Metadata } from 'next';
import { getCatalogProducts } from '../../lib/catalog';
import CatalogBrowser from './CatalogBrowser';

export const metadata: Metadata = {
  title: 'Каталог подшипников с ценами и остатками',
  description: 'Каталог подшипников PODSH_UL: поиск по обозначению, цены за штуку, наличие и поставка по всей России.',
  alternates: { canonical: '/catalog/' },
};

export default async function Catalog() {
  return <CatalogBrowser allProducts={await getCatalogProducts()} />;
}
