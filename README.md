# Movie Mood Picker

Веб-приложение, которое подбирает фильмы по настроению пользователя. Пользователь выбирает настроение через кнопки с эмодзи, AI анализирует запрос и предлагает 3-5 подходящих фильмов с деталями (постер, описание, рейтинг, где посмотреть).

## Ключевая ценность

Быстрый и простой способ найти фильм, который соответствует текущему настроению — без долгого поиска и выбора.

## Статус проекта

Phase 4 подготовлена к GitHub Pages: приложение работает как статический сайт без сборки, использует относительные пути и может публиковаться из корня репозитория.

## Технологический стек

*   **Frontend**: Vanilla JS + ES modules
*   **AI**: Groq API (для анализа настроения)
*   **Данные о фильмах**: TMDb API (постеры, жанры, провайдеры)
*   **Международные рейтинги**: OMDb API (IMDb, Rotten Tomatoes, Metacritic — если ключ настроен)
*   **Деплой**: GitHub Pages

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
    Откройте файлы `src/groqService.js`, `src/tmdbService.js` и `src/omdbService.js` и замените плейсхолдеры `<YOUR_GROQ_API_KEY>`, `<YOUR_TMDB_API_KEY>`, `<YOUR_OMDB_API_KEY>` на ваши реальные ключи. Вставляйте только сам ключ, без угловых скобок.

    *src/groqService.js:*
    ```javascript
    const GROQ_API_KEY = 'ваш_реальный_ключ_groq';
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
    **ВНИМАНИЕ**: Для MVP API ключи хранятся непосредственно в клиентском коде. Это приемлемо для бесплатных сервисов с лимитами использования. Для продакшн-приложений рекомендуется использовать серверный прокси для защиты ключей.

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

1.  Убедитесь, что плейсхолдеры в `src/groqService.js` и `src/tmdbService.js` заменены на реальные free-tier ключи. Для международных рейтингов также замените плейсхолдер в `src/omdbService.js`.
2.  Закоммитьте `index.html`, `src/`, `README.md` и `.nojekyll`.
3.  Запушьте изменения в GitHub-репозиторий.
4.  Откройте `Settings` → `Pages`.
5.  В `Build and deployment` выберите:
    * Source: `Deploy from a branch`
    * Branch: `main`
    * Folder: `/ (root)`
6.  Сохраните настройки. Сайт будет доступен по адресу `https://your-username.github.io/movie-mood-picker/`.

### Deployment-readiness checklist

- `index.html` лежит в корне репозитория.
- Подключение JS использует относительный путь `./src/main.js`, поэтому работает под project URL GitHub Pages.
- Локальные ES module imports используют query version `v=20260521b`, чтобы браузер не держал старый module graph после деплоя.
- Дополнительный build step не нужен.
- `.nojekyll` добавлен, чтобы GitHub Pages публиковал файлы как статические ассеты без Jekyll-обработки.
- Responsive-проверка пройдена на 320px, 768px и 1024px.
- Без реальных Groq/TMDb ключей публичная страница загрузится, но рекомендации не будут работать.
