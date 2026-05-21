# Movie Mood Picker — Техническая Спецификация

**Версия:** 1.0  
**Дата:** 2026-05-20  
**Статус:** Утверждено для разработки

---

## 1. Обзор Проекта

### 1.1 Описание
Веб-приложение для подбора фильмов на основе текущего настроения пользователя. Пользователь выбирает настроение через кнопки с эмодзи, AI анализирует запрос и предлагает 3-5 подходящих фильмов с детальной информацией.

### 1.2 Ключевая Ценность
Быстрый и простой способ найти фильм, который соответствует текущему настроению — без долгого поиска и выбора.

### 1.3 Целевая Аудитория
- Пользователи, которые не знают что посмотреть
- Люди, которые хотят найти фильм под настроение
- Пользователи мобильных устройств (60%+ трафика)

---

## 2. Архитектура Системы

### 2.1 Общая Архитектура

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              Presentation Layer                     │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐    │    │
│  │  │  Mood    │  │  Movie   │  │   Movie      │    │    │
│  │  │ Selector │  │   List   │  │   Detail     │    │    │
│  │  │   UI     │  │    UI    │  │     UI       │    │    │
│  │  └──────────┘  └──────────┘  └──────────────┘    │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↕                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Application State Manager                 │    │
│  │  • Current mood                                     │    │
│  │  • Movie recommendations                            │    │
│  │  • Selected movie details                           │    │
│  │  • Watched movies list                              │    │
│  │  • UI state (loading, error)                        │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↕                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │              API Orchestration Layer                │    │
│  │  ┌──────────────────┐  ┌──────────────────┐       │    │
│  │  │  Groq Service    │  │  TMDb Service    │       │    │
│  │  │  • Mood → Query  │  │  • Search movies │       │    │
│  │  │  • LLM prompts   │  │  • Get details   │       │    │
│  │  │  • Parse response│  │  • Get images    │       │    │
│  │  │  • Validation    │  │  • Streaming info│       │    │
│  │  └──────────────────┘  └──────────────────┘       │    │
│  └────────────────────────────────────────────────────┘    │
│                          ↕                                   │
└──────────────────────────┼───────────────────────────────────┘
                           ↓
              ┌────────────────────────────┐
              │    External APIs (Cloud)   │
              │  ┌──────────┐ ┌─────────┐ │
              │  │ Groq API │ │ TMDb API│ │
              │  └──────────┘ └─────────┘ │
              └────────────────────────────┘
```

### 2.2 Компоненты Системы

| Компонент | Ответственность | Технологии |
|-----------|----------------|------------|
| **Mood Selector UI** | Отображение кнопок настроений, обработка выбора | HTML, CSS, JavaScript |
| **Movie List UI** | Отображение списка фильмов с постерами | HTML, CSS, JavaScript |
| **Movie Detail UI** | Детальная информация о фильме | HTML, CSS, JavaScript |
| **State Manager** | Централизованное управление состоянием | JavaScript (pub/sub pattern) |
| **Groq Service** | Интеграция с Groq API для AI подбора | JavaScript (fetch API) |
| **TMDb Service** | Интеграция с TMDb API для данных о фильмах | JavaScript (fetch API) |
| **Cache Layer** | Кэширование API запросов | localStorage |

### 2.3 Поток Данных

#### Основной Поток: Выбор Настроения → Рекомендации

```
1. User clicks mood button
   → Mood Selector UI captures event
   
2. Mood Selector UI → State Manager
   → setState({ selectedMood: "happy", loading: true })
   
3. State Manager → Groq Service
   → "Convert 'happy' mood to movie search query"
   
4. Groq Service → Groq API (HTTP)
   → Prompt: "User feels happy. Suggest 3-5 movie titles..."
   → Response: ["The Grand Budapest Hotel", "Amélie", ...]
   
5. Groq Service → TMDb Service
   → "Validate these movie titles exist"
   
6. TMDb Service → TMDb API (HTTP, parallel requests)
   → GET /search/movie?query=...
   → GET /movie/{id}?append_to_response=watch/providers
   
7. TMDb Service → State Manager
   → setState({ movies: [...], loading: false })
   
8. State Manager → Movie List UI
   → UI re-renders with movie grid
```

#### Вторичный Поток: Просмотр Деталей Фильма

```
1. User clicks movie card
   → Movie List UI captures event
   
2. Movie List UI → State Manager
   → setState({ selectedMovieId: 123 })
   
3. State Manager → TMDb Service (if not cached)
   → "Fetch full details for movie 123"
   
4. TMDb Service → TMDb API
   → GET /movie/123?append_to_response=credits,watch/providers
   
5. TMDb Service → State Manager
   → setState({ selectedMovie: {...} })
   
6. State Manager → Movie Detail UI
   → UI renders detail view
```

---

## 3. Технологический Стек

### 3.1 Frontend

| Технология | Версия | Назначение |
|------------|--------|------------|
| HTML5 | - | Структура страницы |
| CSS3 | - | Стилизация (Flexbox, Grid, CSS Variables) |
| JavaScript (ES6+) | - | Логика приложения |
| Vanilla JS | - | Без фреймворков для простоты MVP |

**Альтернатива (рекомендуется для v2):**
- React 19.2.0 + Vite 8 + TypeScript 5.x + Tailwind CSS 4.3

### 3.2 External APIs

| API | Версия | Назначение | Rate Limits |
|-----|--------|------------|-------------|
| Groq API | v1 | AI анализ настроения и подбор фильмов | Free tier (лимиты уточнить) |
| TMDb API | v3 | База данных фильмов, постеры, метаданные | 40 req/10s (free tier) |

### 3.3 Deployment

| Сервис | Назначение |
|--------|------------|
| GitHub Pages | Статический хостинг |
| Git | Версионный контроль |

---

## 4. Функциональные Требования

### 4.1 Выбор Настроения (Mood Selection)

**MOOD-01:** Пользователь видит кнопки с эмодзи для выбора настроения
- Кнопки: 😄 Весело, 😢 Грустно, 💕 Романтика, 💥 Экшн, 😱 Страшно, ✨ Вдохновляюще
- Визуально привлекательный дизайн
- Hover эффекты

**MOOD-02:** Пользователь может выбрать из 4-6 базовых настроений
- Минимум 4, максимум 6 настроений
- Каждое настроение имеет уникальный эмодзи и название

**MOOD-03:** Кнопки настроений адаптированы для мобильных устройств
- Touch-friendly размер (минимум 44x44px)
- Адаптивная сетка (2 колонки на мобильных, 3 на планшетах, 6 на десктопе)

**MOOD-04:** Пользователь может отметить фильмы как просмотренные
- Чекбокс или кнопка "Просмотрено" на карточке фильма
- Сохранение в localStorage
- Фильтрация просмотренных из будущих рекомендаций

### 4.2 AI Интеграция (AI Integration)

**AI-01:** Система использует Groq API для анализа настроения и подбора фильмов
- Промпт: "User mood: {mood}. Suggest 5 movies that match this mood. Return JSON array of movie titles."
- Модель: mixtral-8x7b-32768 или llama3-70b
- Timeout: 30 секунд

**AI-02:** Система использует TMDb API для получения данных о фильмах
- Endpoints: /search/movie, /movie/{id}, /movie/{id}/watch/providers
- Параметры: language=ru-RU для русских названий и описаний

**AI-03:** Система валидирует результаты AI через TMDb (двухэтапная проверка)
- Шаг 1: Groq возвращает список названий фильмов
- Шаг 2: TMDb проверяет существование каждого фильма
- Фильтрация: удалить фильмы, которых нет в TMDb
- Fallback: если < 3 фильмов прошли валидацию, запросить у Groq ещё

**AI-04:** Пользователь видит loading индикатор во время подбора фильмов
- Spinner или skeleton screen
- Текст: "Подбираю фильмы..."
- Показывается сразу после клика на настроение

### 4.3 Отображение Фильмов (Movie Display)

**DISP-01:** Пользователь видит список из 3-5 подобранных фильмов с постерами
- Grid layout (1 колонка на мобильных, 2-3 на десктопе)
- Постеры: TMDb poster_path (w500 размер)
- Lazy loading для изображений

**DISP-02:** Каждый фильм показывает название, жанры, рейтинг и описание
- Название: title (русское) или original_title
- Жанры: genres (первые 2-3)
- Рейтинг: vote_average (⭐ 7.5/10)
- Описание: overview (первые 150 символов + "...")

**DISP-03:** Пользователь может кликнуть на фильм и увидеть детальную карточку
- Modal или отдельная страница
- Полное описание
- Год выпуска, длительность
- Актёры (первые 5)
- Режиссёр

**DISP-04:** Детальная карточка показывает где можно посмотреть фильм
- TMDb watch/providers endpoint
- Стриминговые сервисы для России (RU region)
- Иконки сервисов: Netflix, Okko, ivi, Кинопоиск HD, etc.
- Fallback: "Информация о стриминге недоступна"

### 4.4 Техническая Основа (Technical Foundation)

**TECH-01:** Система обрабатывает ошибки API запросов и показывает понятные сообщения
- Groq API error: "Не удалось подобрать фильмы. Попробуйте ещё раз."
- TMDb API error: "Не удалось загрузить данные о фильмах."
- Network error: "Проверьте подключение к интернету."
- Retry кнопка для повторной попытки

**TECH-02:** Система кэширует запросы к API для снижения нагрузки
- localStorage для кэширования:
  - Детали фильмов (movie details) — 24 часа
  - Результаты поиска по настроению — 1 час
- Cache key: `mood_${mood}_${timestamp}`
- Проверка TTL перед использованием кэша

**TECH-03:** Интерфейс адаптирован для всех устройств
- Responsive breakpoints: 320px (mobile), 768px (tablet), 1024px (desktop)
- Mobile-first подход
- Touch-friendly элементы (минимум 44x44px)
- Тестирование на: iPhone, Android, iPad, Desktop

### 4.5 Deployment

**DEPL-01:** Сайт задеплоен на GitHub Pages и доступен по публичной ссылке
- URL: https://{username}.github.io/movie-mood-picker/
- Автоматический деплой через GitHub Actions (опционально)
- HTTPS по умолчанию

---

## 5. Нефункциональные Требования

### 5.1 Производительность
- **Время загрузки:** < 3 секунды на 3G соединении
- **Time to Interactive:** < 5 секунд
- **API Response Time:** < 2 секунды для Groq, < 1 секунда для TMDb
- **Bundle Size:** < 100KB (HTML + CSS + JS)

### 5.2 Безопасность
- **API Keys:** Хранятся в коде (приемлемо для MVP с free-tier APIs)
- **Rate Limiting:** Client-side throttling (max 1 запрос в 2 секунды)
- **XSS Protection:** Sanitize user input (если будет текстовый ввод в v2)
- **HTTPS:** Обязательно (GitHub Pages по умолчанию)

### 5.3 Доступность (Accessibility)
- **Keyboard Navigation:** Tab navigation для всех интерактивных элементов
- **Screen Readers:** ARIA labels для кнопок и изображений
- **Color Contrast:** WCAG AA (минимум 4.5:1 для текста)
- **Focus Indicators:** Видимые focus states

### 5.4 Совместимость
- **Браузеры:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Мобильные:** iOS Safari 14+, Chrome Android 90+
- **Устройства:** Desktop, Tablet, Mobile (320px+)

---

## 6. AI-Агенты для Разработки

### 6.1 Phase 1: Project Setup & API Foundation

#### Agent 1: API Integration Specialist
**Роль:** Интеграция внешних API (Groq, TMDb)  
**Скилы:**
- REST API integration
- Async/await patterns
- Error handling и retry logic
- API authentication (Bearer tokens)
- JSON parsing и validation
- Rate limiting implementation

**Задачи:**
- Создать Groq Service для AI подбора фильмов
- Создать TMDb Service для поиска и получения данных
- Реализовать двухэтапную валидацию (Groq → TMDb)
- Настроить error handling для всех API запросов
- Реализовать client-side rate limiting

**Инструменты:**
- fetch API или axios
- Promise.all для параллельных запросов
- try/catch для обработки ошибок

---

#### Agent 2: State Management Architect
**Роль:** Разработка централизованного управления состоянием  
**Скилы:**
- State management patterns (pub/sub)
- Event-driven architecture
- Data flow design
- Immutable state updates
- Observer pattern

**Задачи:**
- Создать State Manager с pub/sub паттерном
- Реализовать setState() и subscribe() методы
- Определить структуру state объекта
- Настроить уведомления UI компонентов при изменении state
- Реализовать state persistence (localStorage)

**Инструменты:**
- Vanilla JavaScript
- localStorage API
- Custom event system

---

#### Agent 3: Caching & Performance Engineer
**Роль:** Оптимизация производительности и кэширование  
**Скилы:**
- Browser caching strategies (localStorage, sessionStorage)
- Cache invalidation patterns
- TTL (Time To Live) implementation
- Performance optimization
- Lazy loading

**Задачи:**
- Реализовать localStorage кэширование для API ответов
- Настроить TTL для разных типов данных (1 час для mood results, 24 часа для movie details)
- Реализовать cache key generation
- Добавить cache invalidation logic
- Оптимизировать размер кэша (max 5MB)

**Инструменты:**
- localStorage API
- Date/timestamp handling
- JSON serialization

---

### 6.2 Phase 2: Mood Selection Interface

#### Agent 4: UI/UX Frontend Developer
**Роль:** Разработка пользовательского интерфейса  
**Скилы:**
- HTML5 semantic markup
- CSS3 (Flexbox, Grid, animations)
- Responsive design (mobile-first)
- Touch-friendly UI design
- Accessibility (ARIA, keyboard navigation)

**Задачи:**
- Создать Mood Selector UI с кнопками и эмодзи
- Реализовать адаптивную сетку (2/3/6 колонок)
- Добавить hover и active states
- Настроить touch-friendly размеры (44x44px минимум)
- Реализовать loading indicator

**Инструменты:**
- HTML5
- CSS3 (Flexbox/Grid)
- CSS animations
- Media queries

---

#### Agent 5: Interaction Designer
**Роль:** Реализация интерактивности и анимаций  
**Скилы:**
- Event handling (click, touch)
- CSS animations и transitions
- Loading states
- Micro-interactions
- User feedback patterns

**Задачи:**
- Подключить mood buttons к State Manager
- Реализовать loading spinner/skeleton
- Добавить transition анимации между состояниями
- Реализовать error state UI
- Добавить haptic feedback для мобильных (опционально)

**Инструменты:**
- JavaScript event listeners
- CSS transitions/animations
- requestAnimationFrame для плавных анимаций

---

### 6.3 Phase 3: Movie Display & Details

#### Agent 6: Movie List Renderer
**Роль:** Отображение списка фильмов  
**Скилы:**
- Dynamic DOM manipulation
- Template literals
- Image lazy loading
- Grid/Flexbox layouts
- Responsive images

**Задачи:**
- Создать Movie List UI компонент
- Реализовать movie card template
- Настроить lazy loading для постеров
- Реализовать адаптивную сетку (1/2/3 колонки)
- Добавить empty state ("Выберите настроение")

**Инструменты:**
- Template literals
- IntersectionObserver для lazy loading
- CSS Grid

---

#### Agent 7: Movie Detail Specialist
**Роль:** Детальная карточка фильма  
**Скилы:**
- Modal/overlay patterns
- Rich content display
- Data formatting (dates, runtime)
- Streaming provider integration
- Navigation patterns

**Задачи:**
- Создать Movie Detail UI (modal или отдельная страница)
- Отобразить полную информацию о фильме
- Интегрировать streaming providers (watch/providers)
- Реализовать "Просмотрено" функционал
- Добавить back navigation

**Инструменты:**
- Modal/dialog patterns
- localStorage для watched movies
- CSS для overlay/backdrop

---

### 6.4 Phase 4: Responsive Design & Deployment

#### Agent 8: Responsive Design Engineer
**Роль:** Адаптация под все устройства  
**Скилы:**
- Mobile-first CSS
- Responsive breakpoints
- Touch optimization
- Cross-browser testing
- Performance optimization

**Задачи:**
- Протестировать на всех breakpoints (320px, 768px, 1024px)
- Оптимизировать touch targets (минимум 44x44px)
- Проверить на реальных устройствах (iPhone, Android, iPad)
- Оптимизировать изображения (WebP, srcset)
- Минифицировать CSS/JS

**Инструменты:**
- Chrome DevTools (device emulation)
- BrowserStack или реальные устройства
- CSS media queries
- Image optimization tools

---

#### Agent 9: DevOps & Deployment Specialist
**Роль:** Деплой на GitHub Pages  
**Скилы:**
- Git/GitHub workflows
- GitHub Pages configuration
- Static site deployment
- Environment variables
- CI/CD (опционально)

**Задачи:**
- Настроить GitHub Pages для репозитория
- Создать production build
- Настроить custom domain (опционально)
- Добавить GitHub Actions для auto-deploy (опционально)
- Проверить HTTPS и доступность

**Инструменты:**
- Git
- GitHub Pages
- GitHub Actions (опционально)

---

#### Agent 10: QA & Testing Engineer
**Роль:** Тестирование и валидация  
**Скилы:**
- Manual testing
- Cross-browser testing
- Mobile testing
- Accessibility testing
- Performance testing

**Задачи:**
- Протестировать все user flows (mood selection → recommendations → details)
- Проверить error handling (network errors, API errors)
- Валидировать accessibility (keyboard nav, screen readers)
- Проверить на разных браузерах и устройствах
- Измерить performance metrics (Lighthouse)

**Инструменты:**
- Chrome DevTools
- Lighthouse
- WAVE (accessibility checker)
- BrowserStack

---

### 6.5 Cross-Cutting Agents

#### Agent 11: Prompt Engineering Specialist
**Роль:** Оптимизация промптов для Groq API  
**Скилы:**
- LLM prompt engineering
- JSON output formatting
- Few-shot learning
- Prompt testing и iteration
- Hallucination prevention

**Задачи:**
- Создать эффективные промпты для каждого настроения
- Настроить JSON output format для Groq
- Добавить few-shot examples для стабильности
- Тестировать и итерировать промпты
- Документировать лучшие практики

**Инструменты:**
- Groq Playground
- JSON schema validation
- A/B testing разных промптов

---

#### Agent 12: Documentation Writer
**Роль:** Документация проекта  
**Скилы:**
- Technical writing
- API documentation
- Code comments
- README creation
- Architecture diagrams

**Задачи:**
- Написать README.md с инструкциями по запуску
- Документировать API endpoints и responses
- Создать architecture diagrams
- Написать комментарии в коде
- Создать CONTRIBUTING.md (для open source)

**Инструменты:**
- Markdown
- Mermaid (для диаграмм)
- JSDoc (для code comments)

---

## 7. Порядок Разработки (Build Order)

### Phase 1: Foundation (Agents 1, 2, 3)
1. State Manager (Agent 2)
2. Groq Service (Agent 1)
3. TMDb Service (Agent 1)
4. Caching Layer (Agent 3)
5. API Orchestration (Agent 1)

**Критерий завершения:** API pipeline работает, можно вызвать getMoodRecommendations("happy") и получить валидированный список фильмов.

---

### Phase 2: Mood Selection (Agents 4, 5)
1. HTML структура (Agent 4)
2. Mood Selector UI (Agent 4)
3. Loading states (Agent 5)
4. Event handling (Agent 5)

**Критерий завершения:** Пользователь может кликнуть на настроение и увидеть loading индикатор.

---

### Phase 3: Movie Display (Agents 6, 7, 11)
1. Movie List UI (Agent 6)
2. Movie Detail UI (Agent 7)
3. Watched movies feature (Agent 7)
4. Prompt optimization (Agent 11)

**Критерий завершения:** Пользователь видит список фильмов и может открыть детальную карточку.

---

### Phase 4: Polish & Deploy (Agents 8, 9, 10, 12)
1. Responsive design (Agent 8)
2. Cross-browser testing (Agent 10)
3. Deployment (Agent 9)
4. Documentation (Agent 12)

**Критерий завершения:** Сайт доступен по публичной ссылке, работает на всех устройствах.

---

## 8. Риски и Митигация

### 8.1 Технические Риски

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| LLM галлюцинации (несуществующие фильмы) | Высокая | Высокое | Двухэтапная валидация (Groq → TMDb) |
| API rate limits (TMDb: 40 req/10s) | Средняя | Высокое | Кэширование, request batching, throttling |
| Утечка API ключей в клиентском коде | Высокая | Среднее | Приемлемо для MVP с free-tier APIs, переход на backend proxy в v2 |
| Медленный ответ Groq API (>5s) | Средняя | Среднее | Timeout 30s, loading indicator, retry logic |
| Отсутствие streaming данных для России | Средняя | Низкое | Fallback message, проверить TMDb coverage для RU |

### 8.2 UX Риски

| Риск | Вероятность | Влияние | Митигация |
|------|-------------|---------|-----------|
| Плохая мобильная адаптация | Средняя | Высокое | Mobile-first подход, тестирование на реальных устройствах |
| Непонятные сообщения об ошибках | Средняя | Среднее | User-friendly error messages на русском |
| Долгое ожидание результатов | Высокая | Высокое | Loading indicator, skeleton screens, оптимизация промптов |

---

## 9. Метрики Успеха

### 9.1 Технические Метрики
- **Lighthouse Score:** > 90 (Performance, Accessibility, Best Practices)
- **Bundle Size:** < 100KB
- **API Response Time:** < 2s (95th percentile)
- **Error Rate:** < 5%
- **Cache Hit Rate:** > 60%

### 9.2 Пользовательские Метрики
- **Time to First Recommendation:** < 5s
- **Recommendation Accuracy:** > 80% (субъективная оценка пользователей)
- **Mobile Traffic:** > 50%
- **Bounce Rate:** < 40%

---

## 10. Roadmap v2 (Post-MVP)

### Функции для v2
- История подборок пользователя
- Избранные фильмы (watchlist)
- Фильтры по жанрам, годам, рейтингу
- Трейлеры фильмов
- Мультиязычность интерфейса
- Backend proxy для скрытия API ключей
- Миграция на React + TypeScript

### Технические улучшения
- Serverless functions (Vercel/Netlify) для API proxy
- Database для хранения пользовательских данных
- Authentication (опционально)
- Analytics (Google Analytics или Plausible)
- A/B testing для промптов

---

## 11. Заключение

Данная спецификация описывает полную архитектуру и план разработки Movie Mood Picker MVP. Проект разделён на 4 фазы с чёткими критериями завершения. Для разработки требуется 12 специализированных AI-агентов, каждый с уникальными скилами.

**Следующий шаг:** Запустить `/gsd:discuss-phase 1` для начала разработки Phase 1 (API Foundation).

---

**Версия:** 1.0  
**Последнее обновление:** 2026-05-20  
**Статус:** ✅ Утверждено для разработки
