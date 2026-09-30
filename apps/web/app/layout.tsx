import './globals.css';
import Link from 'next/link';
import type { ReactNode } from 'react';

const siteUrl = process.env.SITE_URL || (process.env.SITE_HOST ? `https://${process.env.SITE_HOST}` : 'http://localhost:3000');

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: 'PODSH_UL — каталог подшипников',
  description: 'Подшипники в наличии: обозначения, цены за штуку и остатки.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <header className="header">
          <div className="container header-row">
            <Link className="logo" href="/" aria-label="PODSH_UL — главная">PODSH_UL</Link>
            <nav className="nav">
              <Link href="/catalog">Каталог</Link>
              <a href="#contacts">Контакты</a>
            </nav>
          </div>
        </header>
        {children}
        <footer className="contacts" id="contacts">
          <div className="container">
            <h2>Контакты</h2>
            <address>
              <p>Тел/факс: <a href="tel:+78422404435">(8422) 40-44-35</a></p>
              <p>Телефон: <a href="tel:+79023552328">8-902-355-23-28</a></p>
              <p>E-mail: <a href="mailto:podsh_ul@mail.ru">podsh_ul@mail.ru</a></p>
            </address>
          </div>
        </footer>
      </body>
    </html>
  );
}
