import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type Product = {
  id: string;
  designation: string;
  brand: { name: string };
  specification?: { innerDiameter: number; outerDiameter: number; width: number } | null;
  offers: Array<{ salePrice: number; stock: number }>;
};

async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch(`${API_URL}/products`, { cache: 'no-store' });
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
          <p>Введите 6205-2RS, SKF 6205 или размеры 25x52x15. MVP уже умеет искать по каталогу PostgreSQL.</p>
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
                    <div className="price">{best ? `${Number(best.salePrice).toFixed(2)} €` : 'Цена по запросу'}</div>
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
