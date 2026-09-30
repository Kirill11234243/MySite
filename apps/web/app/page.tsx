import Link from 'next/link';
import { apiUrl } from '../lib/api';

type Product = {
  id: string;
  designation: string;
  brand: { name: string };
  specification?: { innerDiameter: number; outerDiameter: number; width: number } | null;
  offers: Array<{ salePrice: number | string; stock: number; currency: string }>;
};

async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(apiUrl('/products'), { cache: 'no-store' });
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();
  return (
    <main>
      <section className="hero">
        <div className="container">
          <div className="kicker">Технический каталог подшипников</div>
          <h1>Найти подшипник по номеру или размерам.</h1>
          <p>Введите обозначение подшипника или его часть. В каталоге указаны цены за штуку и текущие остатки.</p>
          <form className="search" action="/catalog">
            <input name="q" placeholder="Например: 6205-2RS или 25x52x15" />
            <button className="button" type="submit">Найти</button>
          </form>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <h2>Популярные позиции</h2>
          {products.length === 0 ? (
            <div className="card">
              <h3>API пока недоступен</h3>
              <p className="muted">Запустите Docker, выполните заполнение БД и затем npm run dev — инструкция есть в README.</p>
            </div>
          ) : (
            <div className="grid">
              {products.slice(0, 6).map((product) => {
                const best = product.offers[0];
                return (
                  <Link className="card" href={`/product/${product.id}`} key={product.id}>
                    <div className="badge">{product.brand.name}</div>
                    <h3>{product.designation}</h3>
                    <div className="muted">
                      {product.specification
                        ? `${product.specification.innerDiameter} × ${product.specification.outerDiameter} × ${product.specification.width} мм`
                        : 'Размеры уточняются'}
                    </div>
                    <div className="price">{best ? `${new Intl.NumberFormat('ru-RU', { style: 'currency', currency: best.currency }).format(Number(best.salePrice))} / шт.` : 'Цена по запросу'}</div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
