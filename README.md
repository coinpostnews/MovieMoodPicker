# Movie Mood Picker

Веб-приложение, которое подбирает фильмы по настроению пользователя. Пользователь выбирает настроение через кнопки с эмодзи, AI анализирует запрос и предлагает 3-5 подходящих фильмов с деталями (постер, описание, рейтинг, где посмотреть).

## Ключевая ценность

Быстрый и простой способ найти фильм, который соответствует текущему настроению — без долгого поиска и выбора.

## Статус проекта

Phase 4 подготовлена к GitHub Pages: приложение работает как статический сайт без сборки, использует относительные пути и может публиковаться из корня репозитория.

## Технологический стек

*   **Frontend**: Vanilla JS + ES modules
*   **AI**: Groq API через Cloudflare Worker proxy (ключ хранится как secret)
*   **Данные о фильмах**: TMDb API (постеры, жанры, провайдеры)
*   **Международные рейтинги**: OMDb API (IMDb, Rotten Tomatoes, Metacritic — если ключ настроен)
*   **Деплой**: GitHub Pages + Cloudflare Workers для AI proxy

## Установка и запуск (локально)

1.  **Клонируйте репозиторий:**
    ```bash
    git clone https://github.com/your-username/movie-mood-picker.git
    cd movie-mood-picker
    ```

2.  **Получите API ключи:**
    *   **Groq API Key**: Зарегистрируйтесь на [Groq Console](https://console.groq.com/docs) и получите ваш API ключ.
    *   **TMDb API Key**: Зарегистрируйтесь на [The Movie Database (TMDb) API](https://developers.themoviedb.org/3) и получите ваш API ключ.
    *   **OMDb API Key**: Получите ключ на [OMDb API](https://www.omdbapi.com/apikey.aspx), если хотите показывать IMDb/Rotten Tomatoes/Metacritic ratings.

3.  **Настройте API ключи:**
    Groq ключ не хранится в браузере. Он должен быть добавлен как Cloudflare Worker secret. TMDb и OMDb для MVP остаются в клиентском коде.

    ```bash
    cd workers
    npx wrangler secret put GROQ_API_KEY
    npx wrangler deploy
    ```

    *src/tmdbService.js:*
    ```javascript
    const TMDB_API_KEY = 'ваш_реальный_ключ_tmdb';
    ```
    *src/omdbService.js:*
    ```javascript
    const OMDB_API_KEY = 'ваш_реальный_ключ_omdb';
    ```

    OMDb ключ опционален: без него приложение продолжит работать через TMDb, но вместо IMDb/Rotten Tomatoes будет показывать TMDb rating.
    **ВНИМАНИЕ**: Groq ключ нельзя коммитить в репозиторий. GitHub Push Protection заблокирует такой push, и это правильно.

4.  **Запустите локальный статический сервер:**
    Проект использует ES modules, поэтому надежнее запускать его через локальный HTTP-сервер, а не открывать `index.html` как `file://`.

    ```bash
    python3 -m http.server 4173
    ```

    Затем откройте `http://localhost:4173`.

## Тестирование

Для базовых проверок работоспособности менеджера состояния и кэширования откройте консоль разработчика в браузере (F12) и посмотрите вывод файла `test/index.js`.

1.  **Откройте `index.html`** в браузере.
2.  **Откройте консоль разработчика** (обычно `F12`).
3.  **Перейдите на вкладку `Console`**.
4.  **Импортируйте и запустите тесты:**
    В консоли выполните:
    ```javascript
    import('./test/index.js');
    ```
    Вы увидите результаты тестов в консоли. Обратите внимание, что тест для `getMoodRecommendations` требует работающих API ключей и сети.

## Деплой на GitHub Pages

1.  Убедитесь, что `src/config.js` содержит URL Cloudflare Worker proxy.
2.  Убедитесь, что `src/tmdbService.js` содержит рабочий TMDb ключ. Для международных рейтингов также настройте `src/omdbService.js`.
3.  Закоммитьте `index.html`, `src/`, `workers/`, `README.md` и `.nojekyll`.
4.  Запушьте изменения в GitHub-репозиторий.
5.  Откройте `Settings` → `Pages`.
6.  В `Build and deployment` выберите:
    * Source: `Deploy from a branch`
    * Branch: `main`
    * Folder: `/ (root)`
7.  Сохраните настройки. Сайт будет доступен по адресу `https://your-username.github.io/movie-mood-picker/`.

## Деплой AI proxy

Проект использует Cloudflare Worker, чтобы Groq API key не попадал в браузерный JavaScript.

1.  Авторизуйтесь в Cloudflare:
    ```bash
    npx wrangler login
    ```

2.  Добавьте Groq ключ как secret:
    ```bash
    cd workers
    npx wrangler secret put GROQ_API_KEY
    ```

3.  Задеплойте Worker:
    ```bash
    npx wrangler deploy
    ```

4.  Если Cloudflare выдаст URL, отличный от `https://movie-mood-picker-groq.coinpostnews.workers.dev`, обновите `GROQ_PROXY_URL` в `src/config.js`, закоммитьте и запушьте изменение.

### Deployment-readiness checklist

- `index.html` лежит в корне репозитория.
- Подключение JS использует относительный путь `./src/main.js`, поэтому работает под project URL GitHub Pages.
- Локальные ES module imports используют query version `v=20260521j`, чтобы браузер не держал старый module graph после деплоя.
- Дополнительный build step не нужен.
- `.nojekyll` добавлен, чтобы GitHub Pages публиковал файлы как статические ассеты без Jekyll-обработки.
- Responsive-проверка пройдена на 320px, 768px и 1024px.
- Без задеплоенного Groq Worker proxy публичная страница загрузится, но AI-рекомендации не будут работать.
