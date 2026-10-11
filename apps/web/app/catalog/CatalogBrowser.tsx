'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent } from 'react';
import type { CatalogProduct } from '../../lib/catalog';

type Query = { q?: string; sort?: string; page?: string };

export default function CatalogBrowser({ allProducts }: { allProducts: CatalogProduct[] }) {
  const [params, setParams] = useState<Query>({});
  const [queryInput, setQueryInput] = useState('');
  const [sortInput, setSortInput] = useState('name');
  useEffect(() => {
    const read = () => {
      const values = Object.fromEntries(new URLSearchParams(window.location.search));
      setParams(values);
      setQueryInput(values.q || '');
      setSortInput(values.sort || 'name');
    };
    read();
    window.addEventListener('popstate', read);
    return () => window.removeEventListener('popstate', read);
  }, []);
  const navigate = (values: Query) => {
    const query = new URLSearchParams(Object.entries(values).filter(([, value]) => value !== undefined) as [string, string][]);
    window.history.pushState(null, '', `/catalog/?${query}`);
    setParams(values);
    setQueryInput(values.q || '');
    setSortInput(values.sort || 'name');
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate({ q: queryInput.trim(), sort: sortInput });
  };
  const q = params.q?.trim() || '';
  const tokens = q.toUpperCase().split(/[\s/_-]+/).filter(Boolean);
  const result = allProducts.filter((product) => {
    const value = `${product.designation} ${product.brand.name}`.toUpperCase();
    return tokens.every((token) => value.includes(token));
  });
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
        <form className="catalog-controls" action="/catalog" onSubmit={submit}>
          <label className="search-field">Поиск по обозначению или бренду
            <input type="search" name="q" value={queryInput} onChange={(event) => setQueryInput(event.target.value)} placeholder="Например: 6205 или DKF NU205" aria-describedby="search-help" />
          </label>
          <label>Сортировка
            <select name="sort" value={sortInput} onChange={(event) => setSortInput(event.target.value)}>
              <option value="name">Обозначение: по возрастанию</option>
              <option value="name-desc">Обозначение: по убыванию</option>
              <option value="price">Сначала дешевле</option>
              <option value="price-desc">Сначала дороже</option>
              <option value="stock">Сначала больший остаток</option>
            </select>
          </label>
          <button className="button" type="submit">Найти</button>
          <a className="reset-link" href="/catalog/" onClick={(event) => { event.preventDefault(); navigate({}); }}>Сбросить</a>
        </form>
        <p className="muted" id="search-help">Можно ввести часть обозначения или несколько слов в любом порядке. Регистр и лишние пробелы не важны. Размеры и дополнительные характеристики уточняйте по телефону.</p>
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
          {page > 1 && <a href={pageUrl(page - 1)} onClick={(event) => { event.preventDefault(); navigate({ q, sort, page: String(page - 1) }); }}>← Назад</a>}
          <span>Страница {page} из {pages}</span>
          {page < pages && <a href={pageUrl(page + 1)} onClick={(event) => { event.preventDefault(); navigate({ q, sort, page: String(page + 1) }); }}>Далее →</a>}
        </nav>}
      </div>
    </main>
  );
}
