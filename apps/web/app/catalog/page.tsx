import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type Product = {
  id: string;
  designation: string;
  brand: { name: string };
  specification?: { innerDiameter: number; outerDiameter: number; width: number } | null;
  offers: Array<{ salePrice: number; stock: number }>;
};

async function searchProducts(q: string): Promise<Product[]> {
  try {
    const url = q ? `${API_URL}/search?q=${encodeURIComponent(q)}` : `${API_URL}/products`;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}

export default async function Catalog({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const q = params.q?.trim() || '';
  const products = await searchProducts(q);
  return (
    <main className="section">
      <div className="container">
        <div className="kicker">Каталог</div>
        <h2>{q ? `Результаты: ${q}` : 'Все подшипники'}</h2>
        <form className="search" action="/catalog" style={{ marginBottom: 28 }}>
          <input name="q" defaultValue={q} placeholder="Артикул или 25x52x15" />
          <button className="button" type="submit">Искать</button>
        </form>
        <table className="table">
          <thead><tr><th>Артикул</th><th>Бренд</th><th>Размер</th><th>Цена</th><th>Остаток</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td><Link href={`/product/${p.id}`}><strong>{p.designation}</strong></Link></td>
                <td>{p.brand.name}</td>
                <td>{p.specification ? `${p.specification.innerDiameter}×${p.specification.outerDiameter}×${p.specification.width}` : '—'}</td>
                <td>{p.offers[0] ? `${Number(p.offers[0].salePrice).toFixed(2)} €` : '—'}</td>
                <td>{p.offers.reduce((sum, offer) => sum + offer.stock, 0)} шт.</td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <p className="muted">Ничего не найдено. Попробуйте 6205 или 25x52x15.</p>}
      </div>
    </main>
  );
}
