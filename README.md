# Task Manager (Тестовое задание)

Простое веб-приложение для управления задачами (To-Do list), реализованное в рамках тестового задания. Проект состоит из REST API на .NET и SPA-клиента на Angular.

## 🛠 Стек технологий

**Backend:**

- .NET 10 (ASP.NET Core Web API)
- Entity Framework Core (Code-First, Migrations)
- PostgreSQL (в Docker-контейнере)
- Swagger / OpenAPI (документация)

**Frontend:**

- Angular 22.2.4 (Standalone Components, Signals)
- TypeScript (версия 6.0.3)
- SCSS (переменные, адаптивная верстка)
- Vitest (версия 5.0.5,юнит-тесты)

**Инфраструктура:**

- Docker, Docker Compose
- GitHub Actions (CI-сборка)

---

## ✨ Реализованный функционал

- **Backend (REST API):**
    - CRUD-операции с задачами (GET, POST, PUT, DELETE).
    - Фильтрация списка задач по статусу.
    - Валидация входящих данных (Title: обязательное, макс. 200 символов).
    - Использование DTO для изоляции моделей БД.
    - Глобальная обработка ошибок и логирование.
- **Frontend (Angular):**
    - Отображение списка задач (название, описание, дата создания, статус).
    - Добавление новых задач (Reactive Forms с валидацией).
    - Отметка задачи как выполненной / возврат в работу.
    - Удаление задачи с оптимистичным обновлением UI (через Signals).
    - Обработка состояний загрузки (спиннеры) и ошибок API (баннеры).
    - Базовая адаптивность для мобильных устройств.
    - Соответствие стандартам доступности (A11y, WCAG AA, контрастность).

---

## 🚀 Быстрый запуск (через Docker)

Самый простой и надежный способ запустить проект — использовать Docker Compose. Вам не нужно локально устанавливать .NET, Node.js или PostgreSQL.

**Требования:** Установленный [Docker Desktop](https://www.docker.com/products/docker-desktop/).

1. Клонируйте репозиторий:

```bash
git clone https://github.com/yarisuyu/task-manager.git
cd task-manager
```

2. Создайте файл .env в корне проекта (на основе .env.example) и укажите в нем пароль для базы данных:

```bash
cp .env.example .env
```

3. Откройте .env и проверьте значение POSTGRES_PASSWORD

4. Запустите сборку и старт всех контейнеров одной командой:

```bash
docker compose up -d --build
```

После этого приложение доступно по адресам:

🌐 Frontend: http://localhost:4200

📚 Swagger (API): http://localhost:5000/swagger

## 💻 Локальный запуск (для разработки)

Если вы хотите запустить приложения в режиме разработки (с hot-reload):

1. База данных:
   Поднимите только PostgreSQL через Docker:

```bash
docker compose up -d db
```

2. Backend:

```bash
cd backend/TaskManager
dotnet restore
dotnet run
```

(API будет доступно на http://localhost:5000)

3. Frontend:

```bash
cd frontend/task-manager-client
npm install
npm start
```

(Angular запустится на http://127.0.0.1:4200)

## 🧪 Тестирование

Для фронтенда написаны юнит-тесты с использованием Vitest. Покрыты компоненты и сервисы, включая обработку ошибок API и состояния загрузки.

Запуск тестов:

```bash
cd frontend/task-manager-client
npm test
```

## 🏗 Архитектурные решения и Best Practices

**Backend:**

- **Слоистая архитектура:** Контроллеры (роутинг) -> Сервисы (бизнес-логика) -> DbContext (доступ к данным).
- **DTO (Data Transfer Objects):** Модели БД не отдаются наружу напрямую, что защищает от over-posting.
- **User Secrets:** Строка подключения с паролем вынесена из appsettings.json в менеджер секретов .NET (и в переменные окружения для Docker).
- **Ограничения в БД:** Настроены через Fluent API (MaxLength, индексы на IsCompleted для быстрой фильтрации).
- **Async/Await + CancellationToken:** Все асинхронные операции поддерживают отмену запросов.

**Frontend:**

- **Signals:** Управление состоянием (список задач, лоадеры) реализовано на современных Angular Signals (вместо устаревших BehaviorSubject).
- **Smart/Dumb Components:** Компоненты разделены на умные (знают о сервисах) и глупые (только принимают Input и отдают Output), что упрощает тестирование.
- **RxJS finalize:** Гарантирует сброс состояний загрузки даже в случае ошибок сети.
- **A11y (Доступность):** Добавлены aria-label, role, настроен контраст текста (WCAG), учтены настройки prefers-reduced-motion.
- **Строгая типизация:** Отсутствует any (кроме обработчиков ошибок), используются интерфейсы.

**Автор:** Елена Обломова
