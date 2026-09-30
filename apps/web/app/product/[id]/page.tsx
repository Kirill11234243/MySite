import { notFound } from 'next/navigation';
import { apiUrl } from '../../../lib/api';

async function getProduct(id: string) {
  try {
    const response = await fetch(apiUrl(`/products/${id}`), { cache: 'no-store' });
    if (!response.ok) return null;
    return response.json();
  } catch { return null; }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  const spec = product.specification;
  const best = product.offers[0];
  return (
    <main className="section">
      <div className="container product-layout">
        <div className="panel">
          <div className="kicker">{product.brand.name}</div>
          <h1>{product.designation}</h1>
          <p className="muted">{product.description || 'Техническая карточка подшипника.'}</p>
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
          <div className="price">{best ? new Intl.NumberFormat('ru-RU', { style: 'currency', currency: best.currency }).format(Number(best.salePrice)) : 'По запросу'}</div>
          <p className="muted">Цена за 1 шт.</p>
          <p className="muted">В наличии: {product.offers.reduce((sum: number, offer: { stock: number }) => sum + offer.stock, 0)} шт.</p>
          <button className="button" type="button" style={{ width: '100%' }}>Корзина — следующий этап</button>
        </aside>
      </div>
    </main>
  );
}
