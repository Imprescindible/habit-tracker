# HabitFlow — Трекер привычек

## Запуск проекта

### 1. Установить зависимости (один раз)
```bash
npm install
```

### 2. Настроить базу данных
Открой файл `.env` и впиши свой пароль от PostgreSQL:
```
DATABASE_URL="postgresql://postgres:ВАШ_ПАРОЛЬ@localhost:5432/server"
```

### 3. Создать таблицы в базе данных (один раз)
```bash
npm run db:push
```

### 4. Запустить сервер (Терминал 1)
```bash
npm run server:dev
```
Сервер запустится на `http://localhost:3001`

### 5. Запустить фронтенд (Терминал 2)
```bash
npm run dev
```
Приложение откроется на `http://localhost:5173`

---

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запустить фронтенд (Vite) |
| `npm run server:dev` | Запустить сервер с автоперезагрузкой |
| `npm run db:push` | Создать таблицы в БД (без миграций) |
| `npm run db:migrate` | Создать миграцию и применить |
| `npm run db:studio` | Открыть Prisma Studio (GUI для БД) |

---

## Стек

**Фронтенд:** React 19, TypeScript, Vite, Zustand, React Router, SCSS Modules

**Бэкенд:** Node.js, Express, Prisma ORM, PostgreSQL

**Архитектура:** Feature-Sliced Design (FSD)
