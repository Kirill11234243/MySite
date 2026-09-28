# Начните отсюда

Если вы мало работали с разработкой, выполняйте команды строго по порядку.

## 1. Установите программы

- Node.js 22 LTS
- Docker Desktop
- Git
- VS Code

## 2. Скачайте ветку проекта

```bash
git clone https://github.com/Kirill11234243/MySite.git
cd MySite
git switch bearing-shop-mvp
```

## 3. Создайте файл настроек

Windows PowerShell:
```powershell
Copy-Item .env.example .env
```

macOS / Linux:
```bash
cp .env.example .env
```

## 4. Первый запуск

```bash
npm install
docker compose up -d
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

После этого откройте в браузере http://localhost:3000

## 5. В следующий раз

```bash
docker compose up -d
npm run dev
```

Остановить приложение: Ctrl+C.

Остановить контейнеры:
```bash
docker compose down
```

Если возникнет ошибка, скопируйте её целиком и пришлите в чат.
