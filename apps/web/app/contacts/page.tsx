import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Контакты поставщика подшипников',
  description: 'Контакты PODSH_UL: телефоны, факс и электронная почта для заказа подшипников с поставкой по России.',
  alternates: { canonical: '/contacts' },
};

export default function ContactsPage() {
  return (
    <main className="section info-page">
      <div className="container narrow-container">
        <div className="kicker">PODSH_UL</div>
        <h1>Контакты для заказа подшипников</h1>
        <p className="info-lead">Позвоните или напишите нам, чтобы уточнить наличие, количество и условия поставки нужного подшипника.</p>
        <div className="info-grid">
          <section className="panel">
            <h2>Связаться с нами</h2>
            <address className="contact-list">
              <p><strong>Телефон и факс</strong><a href="tel:+78422404435">(8422) 40-44-35</a></p>
              <p><strong>Мобильный телефон</strong><a href="tel:+79023552328">8-902-355-23-28</a></p>
              <p><strong>Электронная почта</strong><a href="mailto:podsh_ul@mail.ru">podsh_ul@mail.ru</a></p>
            </address>
          </section>
          <section className="panel">
            <h2>Что указать в запросе</h2>
            <ol className="steps-list">
              <li>Обозначение подшипника.</li>
              <li>Необходимое количество.</li>
              <li>Город доставки.</li>
            </ol>
            <p><Link className="text-link" href="/catalog">Перейти в каталог →</Link></p>
          </section>
        </div>
      </div>
    </main>
  );
}
