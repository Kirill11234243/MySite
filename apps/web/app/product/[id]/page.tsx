import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { apiUrl } from '../../../lib/api';

const siteUrl = process.env.SITE_URL || (process.env.SITE_HOST ? `https://${process.env.SITE_HOST}` : 'http://localhost:3000');

async function getProduct(id: string) {
  try {
    const response = await fetch(apiUrl(`/products/${id}`), { cache: 'no-store' });
    if (!response.ok) return null;
    return response.json();
  } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: 'Подшипник не найден' };
  const offer = product.offers[0];
  const stock = product.offers.reduce((sum: number, item: { stock: number }) => sum + item.stock, 0);
  const price = offer ? `${Number(offer.salePrice).toLocaleString('ru-RU')} ₽` : 'по запросу';
  const description = `Подшипник ${product.designation}: цена ${price}, в наличии ${stock} шт. Поставка по всей России.`;
  return {
    title: `Подшипник ${product.designation} — цена и наличие`,
    description,
    alternates: { canonical: `/product/${id}` },
    openGraph: { title: `Подшипник ${product.designation}`, description, url: `${siteUrl}/product/${id}` },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  const spec = product.specification;
  const best = product.offers[0];
  const stock = product.offers.reduce((sum: number, offer: { stock: number }) => sum + offer.stock, 0);
  const priceText = best
    ? new Intl.NumberFormat('ru-RU', { style: 'currency', currency: best.currency }).format(Number(best.salePrice))
    : 'по запросу';
  const brandName = product.brand?.name && product.brand.name !== 'Не указан' ? product.brand.name : null;
  const productUrl = `${siteUrl}/product/${product.id}`;
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `Подшипник ${product.designation}`,
    sku: product.sku,
    description: product.description || `Подшипник ${product.designation}. Актуальная цена и наличие, поставка по всей России.`,
    brand: brandName ? { '@type': 'Brand', name: brandName } : undefined,
    offers: best ? {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: best.currency,
      price: String(best.salePrice),
      availability: stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: 'PODSH_UL' },
    } : undefined,
  };
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Главная', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Каталог подшипников', item: `${siteUrl}/catalog` },
      { '@type': 'ListItem', position: 3, name: product.designation, item: productUrl },
    ],
  };
  return (
    <main className="section">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd).replace(/</g, '\\u003c') }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, '\\u003c') }} />
      <div className="container breadcrumbs" aria-label="Хлебные крошки">
        <a href="/">Главная</a><span>→</span><a href="/catalog">Каталог</a><span>→</span><span>{product.designation}</span>
      </div>
      <div className="container product-layout">
        <div className="panel">
          <div className="kicker">{brandName || 'Каталог PODSH_UL'}</div>
          <h1>Подшипник {product.designation} — цена и наличие</h1>
          <p className="product-lead">{product.description || `Подшипник ${product.designation} доступен для заказа в PODSH_UL. Цена указана за одну штуку, текущий остаток — ${stock} шт. Организуем поставку по России.`}</p>
          <h2>Характеристики</h2>
          <table className="table"><tbody>
            <tr><td>Внутренний диаметр</td><td>{spec ? `${spec.innerDiameter} мм` : '—'}</td></tr>
            <tr><td>Наружный диаметр</td><td>{spec ? `${spec.outerDiameter} мм` : '—'}</td></tr>
            <tr><td>Ширина</td><td>{spec ? `${spec.width} мм` : '—'}</td></tr>
            <tr><td>Уплотнение</td><td>{spec?.sealType || '—'}</td></tr>
            <tr><td>Зазор</td><td>{spec?.clearance || '—'}</td></tr>
          </tbody></table>
        </div>
        <aside className="panel">
          <div className="kicker">Лучшее предложение</div>
          <div className="price">{priceText}</div>
          <p className="muted">Цена за 1 шт.</p>
          <p className="muted">В наличии: {stock} шт.</p>
          <div className="product-actions">
            <a className="button" href="tel:+79023552328">Уточнить наличие</a>
            <a className="button button-secondary" href={`mailto:podsh_ul@mail.ru?subject=${encodeURIComponent(`Запрос: ${product.designation}`)}`}>Отправить запрос</a>
          </div>
          <p className="product-delivery">Поставка по всей России</p>
        </aside>
      </div>
      <section className="container product-info">
        <div className="panel">
          <h2>Как заказать подшипник {product.designation}</h2>
          <p>Проверьте цену и остаток в карточке, затем позвоните по номеру <a href="tel:+79023552328">8-902-355-23-28</a> или отправьте запрос на <a href={`mailto:podsh_ul@mail.ru?subject=${encodeURIComponent(`Запрос: ${product.designation}`)}`}>podsh_ul@mail.ru</a>. В сообщении укажите обозначение <strong>{product.designation}</strong> и необходимое количество.</p>
          <p>{brandName ? `Производитель или маркировка в каталоге: ${brandName}. ` : ''}{spec ? `Размеры: ${spec.innerDiameter} × ${spec.outerDiameter} × ${spec.width} мм. ` : 'Размеры и дополнительные характеристики можно уточнить перед заказом. '}Поставка доступна заказчикам по всей России.</p>
          <div className="product-links">
            <a href={`/catalog?q=${encodeURIComponent(product.designation)}`}>Найти обозначение в каталоге</a>
            <a href="/delivery">Условия заказа и доставки</a>
            <a href="/contacts">Все способы связи</a>
          </div>
        </div>
      </section>
    </main>
  );
}
