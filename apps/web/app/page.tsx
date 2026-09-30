import Link from 'next/link';
import type { Metadata } from 'next';
import { apiUrl } from '../lib/api';

export const metadata: Metadata = {
  title: 'Купить подшипники с доставкой по России',
  description: 'Каталог из 2 234 подшипников: актуальные цены за штуку, остатки, поиск по обозначению и поставка по всей России.',
  alternates: { canonical: '/' },
};

const faqItems = [
  {
    question: 'Как найти нужный подшипник?',
    answer: 'Введите полное обозначение или его часть в строку поиска. Например: 6205, 2-36114Л или 3ГПЗ.',
  },
  {
    question: 'Как узнать цену и наличие?',
    answer: 'Цена за одну штуку и текущий остаток указаны в каталоге и в карточке каждого подшипника.',
  },
  {
    question: 'Куда вы отправляете подшипники?',
    answer: 'PODSH_UL поставляет подшипники по всей России. Детали отправки можно уточнить по телефону или электронной почте.',
  },
  {
    question: 'Как оформить запрос?',
    answer: 'Позвоните по номеру 8-902-355-23-28 или напишите на podsh_ul@mail.ru и сообщите обозначение и нужное количество.',
  },
];

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqItems.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: { '@type': 'Answer', text: item.answer },
            })),
          }).replace(/</g, '\\u003c'),
        }}
      />
      <section className="hero">
        <div className="container hero-layout">
          <div>
            <div className="kicker hero-kicker">Подшипники в наличии</div>
            <h1>Купить подшипники с актуальными ценами и остатками</h1>
            <p>Более 2 200 позиций в каталоге. Введите обозначение, проверьте цену и наличие — отправляем заказы по всей России.</p>
            <form className="search" action="/catalog">
              <input name="q" aria-label="Обозначение подшипника" placeholder="Например: 6205, 2-36114Л или 3ГПЗ" />
              <button className="button" type="submit">Найти в каталоге</button>
            </form>
            <div className="hero-facts" aria-label="Преимущества каталога">
              <div><strong>2 234</strong><span>позиции</span></div>
              <div><strong>₽ / шт.</strong><span>понятные цены</span></div>
              <div><strong>Россия</strong><span>география поставок</span></div>
            </div>
          </div>
          <div className="bearing-visual" aria-hidden="true">
            <div className="bearing-ring"><div className="bearing-core" /></div>
            <div className="visual-note"><strong>В наличии</strong><span>цены и остатки онлайн</span></div>
          </div>
        </div>
      </section>
      <section className="trust-strip" aria-label="О каталоге">
        <div className="container trust-grid">
          <div><span>01</span><strong>Поиск по маркировке</strong><p>Введите полное обозначение или только его часть.</p></div>
          <div><span>02</span><strong>Остатки и цены</strong><p>Сразу видно количество и стоимость за одну штуку.</p></div>
          <div><span>03</span><strong>Связь напрямую</strong><p>Уточните детали по телефону или электронной почте.</p></div>
        </div>
      </section>
      <section className="seo-section">
        <div className="container seo-copy">
          <div>
            <div className="kicker">Каталог PODSH_UL</div>
            <h2>Подшипники в наличии с ценами за штуку</h2>
          </div>
          <div className="seo-copy-text">
            <p>В каталоге PODSH_UL собрано 2 234 позиции. Для каждого подшипника указаны обозначение, цена и доступное количество. Найти нужную позицию можно по полной маркировке, её части или производителю.</p>
            <p>Если нужного обозначения нет в выдаче, свяжитесь с нами: проверим запрос и уточним условия поставки. Отправляем подшипники заказчикам по всей России.</p>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="section-heading">
            <div>
              <div className="kicker">В наличии сейчас</div>
              <h2>Подшипники из каталога</h2>
            </div>
            <Link className="text-link" href="/catalog">Открыть весь каталог →</Link>
          </div>
          {products.length === 0 ? (
            <div className="card">
              <h3>Каталог временно загружается</h3>
              <p className="muted">Обновите страницу через минуту или свяжитесь с нами по телефону.</p>
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
      <section className="section faq-section">
        <div className="container">
          <div className="kicker">Ответы на вопросы</div>
          <h2>Покупка и поиск подшипников</h2>
          <div className="faq-list">
            {faqItems.map((item) => (
              <details key={item.question}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section className="cta-section">
        <div className="container cta-card">
          <div>
            <div className="kicker">Поможем с запросом</div>
            <h2>Не нашли нужное обозначение?</h2>
            <p>Позвоните или напишите нам. Проверим наличие и уточним детали поставки по России.</p>
          </div>
          <div className="cta-actions">
            <a className="button" href="tel:+79023552328">8-902-355-23-28</a>
            <a className="button button-secondary" href="mailto:podsh_ul@mail.ru">Написать на почту</a>
          </div>
        </div>
      </section>
    </main>
  );
}
