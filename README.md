# Bearing Shop MVP

Кастомный MVP интернет-магазина подшипников.

## Стек

- Next.js + TypeScript — витрина
- NestJS — API
- PostgreSQL + Prisma — каталог
- Поиск — через PostgreSQL, отдельный контейнер не требуется
- Docker Compose — локальная инфраструктура

## Уже работает в коде

- каталог и карточка товара
- поиск по артикулу
- поиск по размерам, например `25x52x15`
- бренды, категории, характеристики
- поставщики, цены и остатки
- связи аналогов
- демо-данные SKF / FAG / NSK

## Первый запуск

Установите Node.js 22 LTS, Docker Desktop, Git и VS Code.

```bash
git clone https://github.com/Kirill11234243/MySite.git
cd MySite
git switch bearing-shop-mvp
```

Создайте `.env` из примера:

Windows PowerShell:
```powershell
if (!(Test-Path .env)) { Copy-Item .env.example .env }
```

macOS / Linux:
```bash
cp .env.example .env
```

Затем:
```bash
npm install
docker compose up -d
npm run db:generate
npm run db:push
npm run db:import
npm run dev
```

Откройте http://localhost:3000

API: http://localhost:4000

## Следующие запуски

```bash
docker compose up -d
npm run dev
```

Подробная инструкция: `START-HERE-RU.md`.

Публикация в интернете через Render: `DEPLOY-RENDER-RU.md`. Конфигурация находится в `render.yaml`.


Данные каталога: data/catalog.xlsx. Повторный импорт: npm run db:import. Цены — рубли за штуку. Единственный контейнер этой копии — PostgreSQL на порту 5433. Витрина и API работают через Node.js на Windows. Для обычного запуска можно использовать start.cmd. Подробности: START-HERE-RU.md.
