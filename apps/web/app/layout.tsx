import './globals.css';
import Link from 'next/link';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Bearing Shop',
  description: 'Подшипники по артикулу и размерам',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <header className="header">
          <div className="container header-row">
            <Link className="logo" href="/">BEARING SHOP</Link>
            <nav className="nav">
              <Link href="/catalog">Каталог</Link>
              <a href="http://localhost:4000/products">API</a>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
