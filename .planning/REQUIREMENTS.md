# Requirements: Movie Mood Picker

**Defined:** 2026-05-20
**Core Value:** Быстрый и простой способ найти фильм, который соответствует текущему настроению — без долгого поиска и выбора.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Mood Selection

- [ ] **MOOD-01**: Пользователь видит кнопки с эмодзи для выбора настроения
- [ ] **MOOD-02**: Пользователь может выбрать из 4-6 базовых настроений (весело, грустно, романтика, экшн, страшно, вдохновляюще)
- [ ] **MOOD-03**: Кнопки настроений адаптированы для мобильных устройств
- [ ] **MOOD-04**: Пользователь может отметить фильмы как просмотренные

### AI Integration

- [ ] **AI-01**: Система использует Groq API для анализа настроения и подбора фильмов
- [ ] **AI-02**: Система использует TMDb API для получения данных о фильмах
- [ ] **AI-03**: Система валидирует результаты AI через TMDb (двухэтапная проверка: AI предлагает → TMDb проверяет существование)
- [ ] **AI-04**: Пользователь видит loading индикатор во время подбора фильмов

### Movie Display

- [ ] **DISP-01**: Пользователь видит список из 3-5 подобранных фильмов с постерами
- [ ] **DISP-02**: Каждый фильм показывает название, жанры, рейтинг и описание
- [ ] **DISP-03**: Пользователь может кликнуть на фильм и увидеть детальную карточку
- [ ] **DISP-04**: Детальная карточка показывает где можно посмотреть фильм (стриминговые сервисы)

### Technical Foundation

- [ ] **TECH-01**: Система обрабатывает ошибки API запросов и показывает понятные сообщения
- [ ] **TECH-02**: Система кэширует запросы к API для снижения нагрузки
- [ ] **TECH-03**: Интерфейс адаптирован для всех устройств (desktop, tablet, mobile)

### Deployment

- [ ] **DEPL-01**: Сайт задеплоен на GitHub Pages и доступен по публичной ссылке

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Personalization

- **PERS-01**: История подборок пользователя
- **PERS-02**: Избранные фильмы (watchlist)
- **PERS-03**: Рекомендации на основе просмотренных фильмов

### Advanced Features

- **ADV-01**: Фильтры по жанрам, годам, рейтингу
- **ADV-02**: Трейлеры фильмов
- **ADV-03**: Мультиязычность интерфейса
- **ADV-04**: Возможность оценивать фильмы

### Social

- **SOC-01**: Поделиться подборкой с друзьями
- **SOC-02**: Комментарии и обсуждения фильмов

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Регистрация и авторизация | Усложняет MVP, не нужна для базовой функциональности |
| Сложные ML алгоритмы | Groq API достаточно для MVP, не нужна собственная модель |
| Детальные метаданные (актёры, режиссёры, награды) | Перегружает интерфейс, фокус на быстром выборе |
| Рейтинг и отзывы пользователей | Требует модерацию и backend, отложено на v2+ |
| Интеграция с соцсетями | Не критично для core value |
| Backend сервер | Статический сайт проще деплоить и поддерживать для MVP |
| Сложные фильтры и поиск | Противоречит идее "быстрого выбора по настроению" |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| MOOD-01 | Phase 2 | Pending |
| MOOD-02 | Phase 2 | Pending |
| MOOD-03 | Phase 2 | Pending |
| MOOD-04 | Phase 3 | Pending |
| AI-01 | Phase 1 | Pending |
| AI-02 | Phase 1 | Pending |
| AI-03 | Phase 1 | Pending |
| AI-04 | Phase 2 | Pending |
| DISP-01 | Phase 3 | Pending |
| DISP-02 | Phase 3 | Pending |
| DISP-03 | Phase 3 | Pending |
| DISP-04 | Phase 3 | Pending |
| TECH-01 | Phase 1 | Pending |
| TECH-02 | Phase 1 | Pending |
| TECH-03 | Phase 4 | Pending |
| DEPL-01 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-20*
*Last updated: 2026-05-20 after roadmap creation*
