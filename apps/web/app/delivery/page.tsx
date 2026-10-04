import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Заказ и доставка подшипников по России',
  description: 'Как заказать подшипники в PODSH_UL. Уточнение наличия и организация поставки подшипников по России.',
  alternates: { canonical: '/delivery' },
};

export default function DeliveryPage() {
  return (
    <main className="section info-page">
      <div className="container narrow-container">
        <div className="kicker">Поставка по России</div>
        <h1>Как заказать подшипники с доставкой</h1>
        <p className="info-lead">Подберите нужное обозначение в каталоге и свяжитесь с нами. Мы проверим актуальный остаток и согласуем детали поставки.</p>
        <div className="order-steps">
          <section className="panel"><span>01</span><h2>Найдите подшипник</h2><p>Используйте полное обозначение или его часть. В карточке указаны цена за штуку и текущий остаток.</p></section>
          <section className="panel"><span>02</span><h2>Отправьте запрос</h2><p>Сообщите обозначение, количество и город доставки по телефону или электронной почте.</p></section>
          <section className="panel"><span>03</span><h2>Согласуйте поставку</h2><p>Условия и способ отправки уточняются до оформления заказа. Поставляем подшипники по России.</p></section>
        </div>
        <div className="panel info-cta">
          <div><h2>Начать подбор</h2><p>Найдите обозначение в каталоге или сразу свяжитесь с нами.</p></div>
          <div className="cta-actions"><Link className="button" href="/catalog">Открыть каталог</Link><Link className="button button-secondary" href="/contacts">Контакты</Link></div>
        </div>
      </div>
    </main>
  );
}
