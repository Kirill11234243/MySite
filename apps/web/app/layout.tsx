import './globals.css';
import Link from 'next/link';
import type { ReactNode } from 'react';

const siteUrl = process.env.SITE_URL || (process.env.SITE_HOST ? `https://${process.env.SITE_HOST}` : 'http://localhost:3000');

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Купить подшипники с доставкой по России | PODSH_UL',
    template: '%s | PODSH_UL',
  },
  description: 'Купить подшипники в каталоге PODSH_UL: 2 234 позиции, актуальные цены за штуку, остатки и поставка по всей России.',
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    siteName: 'PODSH_UL',
    title: 'Купить подшипники с доставкой по России | PODSH_UL',
    description: 'Каталог из 2 234 подшипников с актуальными ценами и остатками. Поставка по всей России.',
    url: siteUrl,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@graph': [
                {
                  '@type': 'Organization',
                  '@id': `${siteUrl}/#organization`,
                  name: 'PODSH_UL',
                  url: siteUrl,
                  email: 'podsh_ul@mail.ru',
                  telephone: ['+7-8422-40-44-35', '+7-902-355-23-28'],
                  areaServed: { '@type': 'Country', name: 'Россия' },
                  contactPoint: {
                    '@type': 'ContactPoint',
                    telephone: '+7-902-355-23-28',
                    contactType: 'sales',
                    areaServed: 'RU',
                    availableLanguage: 'Russian',
                  },
                },
                {
                  '@type': 'WebSite',
                  '@id': `${siteUrl}/#website`,
                  url: siteUrl,
                  name: 'PODSH_UL',
                  inLanguage: 'ru-RU',
                  publisher: { '@id': `${siteUrl}/#organization` },
                  potentialAction: {
                    '@type': 'SearchAction',
                    target: `${siteUrl}/catalog?q={search_term_string}`,
                    'query-input': 'required name=search_term_string',
                  },
                },
              ],
            }).replace(/</g, '\\u003c'),
          }}
        />
        <header className="header">
          <div className="container header-row">
            <Link className="logo" href="/" aria-label="PODSH_UL — главная">PODSH_UL</Link>
            <nav className="nav">
              <Link href="/catalog">Каталог</Link>
              <Link href="/delivery">Доставка</Link>
              <Link href="/contacts">Контакты</Link>
            </nav>
          </div>
        </header>
        {children}
        <footer className="contacts" id="contacts">
          <div className="container">
            <h2>Контакты</h2>
            <address>
              <p>Поставка подшипников по всей России</p>
              <p>Тел/факс: <a href="tel:+78422404435">(8422) 40-44-35</a></p>
              <p>Телефон: <a href="tel:+79023552328">8-902-355-23-28</a></p>
              <p>E-mail: <a href="mailto:podsh_ul@mail.ru">podsh_ul@mail.ru</a></p>
            </address>
            <nav className="footer-nav" aria-label="Полезная информация">
              <Link href="/catalog">Каталог</Link>
              <Link href="/delivery">Доставка и заказ</Link>
              <Link href="/contacts">Контактная информация</Link>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
