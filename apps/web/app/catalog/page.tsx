import Link from 'next/link';
import type { Metadata } from 'next';
import { apiUrl } from '../../lib/api';

export const metadata: Metadata = {
  title: 'Каталог подшипников с ценами и остатками',
  description: 'Каталог подшипников PODSH_UL: поиск по обозначению, цены за штуку, наличие и поставка по всей России.',
  alternates: { canonical: '/catalog' },
};

type Product = {
  id: string;
  designation: string;
  brand: { name: string };
  specification?: { innerDiameter: number; outerDiameter: number; width: number } | null;
  offers: Array<{ salePrice: number | string; stock: number; currency: string }>;
};

async function searchProducts(q: string): Promise<Product[] | null> {
  try {
    const url = q ? apiUrl(`/search?q=${encodeURIComponent(q)}`) : apiUrl('/products');
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export default async function Catalog({ searchParams }: { searchParams: Promise<{ q?: string; sort?: string; page?: string }> }) {
  const params = await searchParams;
  const q = params.q?.trim() || '';
  const result = await searchProducts(q);
  const sort = ['name', 'name-desc', 'price', 'price-desc', 'stock'].includes(params.sort || '') ? params.sort! : 'name';
  const collator = new Intl.Collator('ru', { numeric: true, sensitivity: 'base' });
  const products = [...(result || [])].sort((a, b) => {
    const byName = collator.compare(a.designation, b.designation) || a.id.localeCompare(b.id);
    if (sort === 'name-desc') return -byName;
    if (sort === 'stock') return b.offers.reduce((s, o) => s + o.stock, 0) - a.offers.reduce((s, o) => s + o.stock, 0) || byName;
    if (sort === 'price' || sort === 'price-desc') {
      // Items without a price always follow priced items in either direction.
      if (!a.offers[0]) return b.offers[0] ? 1 : byName;
      if (!b.offers[0]) return -1;
      const currencyOrder = a.offers[0].currency.localeCompare(b.offers[0].currency);
      return currencyOrder || (Number(a.offers[0].salePrice) - Number(b.offers[0].salePrice)) * (sort === 'price' ? 1 : -1) || byName;
    }
    return byName;
  });
  const pages = Math.max(1, Math.ceil(products.length / 50));
  const requestedPage = Number(params.page);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, pages) : 1;
  const visible = products.slice((page - 1) * 50, page * 50);
  const pageUrl = (value: number) => `/catalog?${new URLSearchParams({ q, sort, page: String(value) })}`;
  return (
    <main className="section">
      <div className="container">
        <div className="kicker">Каталог</div>
        <h1>{q ? `Результаты: ${q}` : 'Все подшипники'}</h1>
        <form className="catalog-controls" action="/catalog">
          <label className="search-field">Поиск по обозначению или бренду
            <input type="search" name="q" defaultValue={q} placeholder="Например: 6205 или DKF NU205" aria-describedby="search-help" />
          </label>
          <label>Сортировка
            <select name="sort" defaultValue={sort}>
              <option value="name">Обозначение: по возрастанию</option>
              <option value="name-desc">Обозначение: по убыванию</option>
              <option value="price">Сначала дешевле</option>
              <option value="price-desc">Сначала дороже</option>
              <option value="stock">Сначала больший остаток</option>
            </select>
          </label>
          <button className="button" type="submit">Найти</button>
          <Link className="reset-link" href="/catalog">Сбросить</Link>
        </form>
        <p className="muted" id="search-help">Можно ввести часть обозначения или несколько слов в любом порядке. Регистр и лишние пробелы не важны. Размеры ищите в формате 25×52×15, если они заполнены в карточке.</p>
        {result === null ? <p role="alert">Не удалось загрузить каталог. Попробуйте обновить страницу чуть позже.</p> : <p aria-live="polite">Найдено: {products.length.toLocaleString('ru-RU')}{products.length > 0 && ` · Показаны ${(page - 1) * 50 + 1}–${Math.min(page * 50, products.length)}`}</p>}
        <div className="table-scroll catalog-table-wrap">
        <table className="table catalog-table">
          <thead><tr><th>Обозначение</th><th>Бренд</th><th>Размер</th><th>Цена за шт.</th><th>Остаток</th></tr></thead>
          <tbody>
            {visible.map((p) => (
              <tr key={p.id}>
                <td data-label="Обозначение"><Link href={`/product/${p.id}`}><strong>{p.designation}</strong></Link></td>
                <td data-label="Бренд">{p.brand.name}</td>
                <td data-label="Размер">{p.specification ? `${p.specification.innerDiameter}×${p.specification.outerDiameter}×${p.specification.width}` : '—'}</td>
                <td data-label="Цена за шт.">{p.offers[0] ? new Intl.NumberFormat('ru-RU', { style: 'currency', currency: p.offers[0].currency }).format(Number(p.offers[0].salePrice)) : '—'}</td>
                <td data-label="Остаток">{p.offers.reduce((sum, offer) => sum + offer.stock, 0)} шт.</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {result !== null && products.length === 0 && <p className="muted">Ничего не найдено. Попробуйте сократить запрос или <Link href="/catalog">открыть весь каталог</Link>.</p>}
        {pages > 1 && <nav className="pagination" aria-label="Страницы каталога">
          {page > 1 && <Link href={pageUrl(page - 1)}>← Назад</Link>}
          <span>Страница {page} из {pages}</span>
          {page < pages && <Link href={pageUrl(page + 1)}>Далее →</Link>}
        </nav>}
      </div>
    </main>
  );
}
