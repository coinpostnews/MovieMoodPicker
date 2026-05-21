# Phase 1: Project Setup & API Foundation - Context

**Gathered:** 2026-05-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Создание рабочего API pipeline с валидацией данных, который предотвращает AI галлюцинации. Включает интеграцию Groq API для AI подбора фильмов, TMDb API для получения данных о фильмах, двухэтапную валидацию (Groq → TMDb), error handling и caching стратегию.

</domain>

<decisions>
## Implementation Decisions

### Groq API Integration
- **D-01:** Groq возвращает названия фильмов в JSON формате (массив строк) — легко парсить, надёжно
- **D-02:** Запрашивать 5-7 фильмов у Groq за один раз, чтобы после валидации осталось 3-5
- **D-03:** Использовать индивидуальные промпты для каждого настроения (весело, грустно, романтика, экшн, страшно, вдохновляюще) — более точные рекомендации
- **D-04:** Использовать модель mixtral-8x7b-32768 — быстрая, хорошо работает с JSON, бесплатная

### AI Results Validation
- **D-05:** Для каждого названия от Groq делать TMDb search, брать первый результат если совпадение > 80% (fuzzy match)
- **D-06:** Если после валидации осталось < 3 фильмов — запросить у Groq ещё фильмы (max 2 retry), затем показать что есть
- **D-07:** Искать фильмы в TMDb только на английском языке (Groq возвращает английские названия)

### Error Handling
- **D-08:** Показывать конкретные сообщения об ошибках: "Не удалось подобрать фильмы", "Проблема с TMDb", "Проверьте интернет"
- **D-09:** Кнопка "Попробовать ещё раз" для retry — пользователь контролирует повтор
- **D-10:** Timeout: 30 секунд для Groq API, 10 секунд для TMDb API — баланс между UX и надёжностью

### Caching Strategy
- **D-11:** Кэшировать в localStorage: результаты Groq по настроению + детали фильмов из TMDb
- **D-12:** TTL (Time To Live): Groq результаты — 1 час, TMDb детали — 24 часа
- **D-13:** Cache key формат: `mood_happy_1716231680` (настроение + timestamp)
- **D-14:** Ограничить размер кэша 5MB — достаточно для ~50-100 запросов, не переполнит localStorage

### Claude's Discretion
Нет областей с полной свободой выбора — все ключевые решения приняты.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Documentation
- `.planning/PROJECT.md` — Технический стек (Vanilla JS, Groq API, TMDb API), архитектура, constraints
- `.planning/REQUIREMENTS.md` — Требования AI-01, AI-02, AI-03, TECH-01, TECH-02
- `.planning/ROADMAP.md` — Phase 1 goal, success criteria, dependencies
- `specification.md` — Полная техническая спецификация с AI-агентами и архитектурой

### Research Findings
- `.planning/research/STACK.md` — Рекомендации по технологическому стеку
- `.planning/research/ARCHITECTURE.md` — Архитектурные паттерны, компоненты, data flow
- `.planning/research/PITFALLS.md` — Критические риски (LLM галлюцинации, API rate limits, утечка ключей)
- `.planning/research/FEATURES.md` — Table stakes features для movie recommendation apps

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
Нет существующего кода — greenfield проект. Все компоненты будут созданы с нуля.

### Established Patterns
Из PROJECT.md:
- **Single HTML file** — весь код (HTML, CSS, JS) в одном файле для простоты деплоя
- **No frameworks** — Vanilla JS, никаких React/Vue/Angular
- **Client-side only** — никакого бэкенда, всё работает в браузере
- **API keys in code** — приемлемо для MVP с бесплатными API

### Integration Points
- **Groq API endpoint:** `https://api.groq.com/v1/chat/completions`
- **TMDb API endpoints:** 
  - `/search/movie` — поиск фильмов по названию
  - `/movie/{id}` — детали фильма
  - `/movie/{id}/watch/providers` — где посмотреть фильм

</code_context>

<specifics>
## Specific Ideas

### Groq Prompt Structure
Индивидуальные промпты для каждого настроения должны включать:
- Описание настроения на английском
- Запрос 5-7 фильмов
- Требование вернуть JSON массив названий
- Примеры жанров для этого настроения

Пример для "Весело":
```
User mood: happy and cheerful. Suggest 5-7 uplifting, feel-good movies.
Return JSON array of movie titles in English.
Focus on comedies, romantic comedies, and heartwarming dramas.
```

### Validation Logic
Fuzzy match алгоритм:
1. Получить название от Groq (например, "The Grand Budapest Hotel")
2. Сделать TMDb search: `GET /search/movie?query=The+Grand+Budapest+Hotel`
3. Взять первый результат из `results[0]`
4. Сравнить `results[0].title` с оригинальным названием
5. Если совпадение > 80% (Levenshtein distance или simple string similarity) — принять
6. Если < 80% — отбросить

### Error Messages (Russian)
- Groq API error: "Не удалось подобрать фильмы. Попробуйте ещё раз."
- TMDb API error: "Не удалось загрузить данные о фильмах."
- Network error: "Проверьте подключение к интернету."
- Timeout: "Запрос занял слишком много времени. Попробуйте ещё раз."

### Cache Implementation
localStorage structure:
```javascript
{
  "mood_happy_1716231680": {
    "timestamp": 1716231680000,
    "ttl": 3600000, // 1 hour in ms
    "movies": ["Movie 1", "Movie 2", ...]
  },
  "movie_12345": {
    "timestamp": 1716231680000,
    "ttl": 86400000, // 24 hours in ms
    "data": { /* TMDb movie details */ }
  }
}
```

</specifics>

<deferred>
## Deferred Ideas

Нет — обсуждение осталось в рамках Phase 1 scope.

</deferred>

---

*Phase: 1-Project Setup & API Foundation*
*Context gathered: 2026-05-20*
