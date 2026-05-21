<!-- GSD:project-start source:PROJECT.md -->
## Project

**Movie Mood Picker**

Веб-приложение, которое подбирает фильмы по настроению пользователя. Пользователь выбирает настроение через кнопки с эмодзи, AI анализирует запрос и предлагает 3-5 подходящих фильмов с деталями (постер, описание, рейтинг, где посмотреть).

**Core Value:** Быстрый и простой способ найти фильм, который соответствует текущему настроению — без долгого поиска и выбора.

### Constraints

- **Время**: Быстрая разработка — проект должен быть готов за несколько часов
- **Простота**: Никаких сложных архитектур — один HTML файл с inline CSS и JS
- **Бесплатность**: Только бесплатные API и хостинг
- **Деплой**: Должен легко деплоиться на GitHub Pages без настройки CI/CD
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Technologies
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 19.2.0 | UI framework | Industry standard for interactive UIs. React 19 simplifies ref handling (no forwardRef needed), has better TypeScript support, and excellent ecosystem. Overkill for single-page MVP but scales better than Vanilla JS if features expand. |
| Vite | 8.0.10 | Build tool & dev server | Fastest dev server with HMR, zero-config setup. Vite 8 uses Rolldown bundler (Rust-based) for 10x faster builds. Built-in TypeScript support, optimized for modern browsers. |
| Tailwind CSS | 4.3 | Styling | Utility-first CSS with minimal bundle size (<10kB). v4.3 uses CSS variables for theming, supports P3 wide-gamut colors, container queries, and dark mode out of box. Faster than writing custom CSS. |
| TypeScript | 5.x | Type safety | Catches errors at compile time, better IDE support, self-documenting code. React 19 has improved TS types. Essential for maintainability beyond MVP. |
### AI & Data APIs
| Service | Version/Tier | Purpose | Why Recommended |
|---------|--------------|---------|-----------------|
| Groq API | Free tier | LLM inference for mood analysis | Fast inference (500+ tokens/sec), OpenAI-compatible API, free tier available. Supports multiple models. Better speed than OpenAI for simple prompts. **CONFIDENCE: MEDIUM** (limited public pricing info, verify free tier limits) |
| TMDb API | v3 (free) | Movie database | Free tier with generous rate limits, comprehensive movie data (posters, ratings, descriptions, streaming availability). Industry standard for movie apps. Well-documented REST API. **CONFIDENCE: HIGH** |
### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @tanstack/react-query | 5.90.3 | Data fetching & caching | Essential for API calls. Handles loading states, caching, refetching automatically. v5 requires React 18+, uses object syntax for hooks. Eliminates manual fetch boilerplate. |
| axios | 1.x | HTTP client | Optional but recommended over fetch. Better error handling, request/response interceptors, automatic JSON parsing. Use if you need request cancellation or interceptors. |
| clsx | 2.x | Conditional CSS classes | Tiny utility (200B) for dynamic Tailwind classes. Use when toggling classes based on state (loading, selected mood, etc). |
### Development Tools
| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint | Linting | Use `@typescript-eslint` preset. Catches common React mistakes. |
| Prettier | Code formatting | Auto-format on save. Integrates with Tailwind (use `prettier-plugin-tailwindcss` for class sorting). |
| Vite DevTools | Debugging | Built-in with Vite 8 (`devtools: true` in config). Inspect component tree, network requests. |
## Installation
# Create project with Vite
# Core dependencies
# Tailwind CSS
# Dev tools
## Alternatives Considered
| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| React 19 | Vanilla JS (PROJECT.md preference) | Use Vanilla JS if: (1) MVP must ship in <4 hours, (2) no plans to add features beyond mood selection, (3) team unfamiliar with React. Trade-off: harder to maintain as features grow. |
| React 19 | Svelte 5 | Use Svelte if: team prefers compiled frameworks, want smaller bundle size (~30% smaller), simpler reactivity model. Trade-off: smaller ecosystem, fewer job-ready developers. |
| Vite 8 | Next.js 15 | Use Next.js if: need SSR/SSG for SEO, want API routes built-in (solves API key security), plan to add auth/database. Trade-off: more complex setup, overkill for static site. |
| Groq API | OpenAI API | Use OpenAI if: need GPT-4 quality for complex mood analysis, willing to pay ($0.03/1K tokens). Trade-off: slower inference, costs money. |
| Groq API | Anthropic Claude API | Use Claude if: need better reasoning for nuanced mood interpretation, willing to pay. Trade-off: costs money, no free tier. |
| TMDb API | OMDB API | Use OMDB if: need simpler API with fewer fields. Trade-off: less data (no streaming availability, fewer images), smaller database. |
| GitHub Pages | Vercel | Use Vercel if: need serverless functions to hide API keys, want preview deployments per PR, need analytics. Trade-off: requires account setup, more complex than `git push`. |
| GitHub Pages | Netlify | Use Netlify if: need Edge Functions for API proxying, want form handling, need A/B testing. Trade-off: similar to Vercel, more features than needed for MVP. |
## What NOT to Use
| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Create React App | Deprecated, slow builds, outdated webpack config. No longer maintained by React team. | Vite (10x faster, modern tooling) |
| Redux | Overkill for simple app. Boilerplate-heavy, steep learning curve. | TanStack Query for server state + React useState for UI state |
| Styled Components / Emotion | Runtime CSS-in-JS adds bundle size, slower than compile-time solutions. | Tailwind CSS (compile-time, smaller bundle) |
| jQuery | Outdated, conflicts with React's virtual DOM. | React's built-in DOM manipulation |
| Webpack | Slow dev server, complex config. Replaced by faster tools. | Vite (Rust-based bundler, zero config) |
## Stack Patterns by Variant
- API keys MUST be in code (no backend to hide them)
- Use environment variables during build: `VITE_GROQ_API_KEY`, `VITE_TMDB_API_KEY`
- Add rate limiting on client side to prevent abuse
- Consider Groq/TMDb free tier limits as hard constraints
- **Security trade-off:** Keys visible in browser. Acceptable for MVP with free-tier APIs.
- Deploy to Vercel/Netlify with serverless functions
- Create `/api/recommend` endpoint that calls Groq (hides API key)
- Create `/api/movies` endpoint that calls TMDb (hides API key)
- Frontend calls your API, not external APIs directly
- **Trade-off:** More complex deployment, but keys stay server-side.
- Skip React, Vite, TanStack Query
- Use single HTML file with inline `<script>` and `<style>`
- Use `fetch()` API directly (no axios)
- Use template literals for DOM manipulation
- **Trade-off:** Faster initial development, harder to maintain, no type safety.
## Version Compatibility
| Package | Compatible With | Notes |
|---------|-----------------|-------|
| React 19.2.0 | @tanstack/react-query 5.90.3 | TanStack Query v5 requires React 18+. React 19 fully compatible. |
| React 19.2.0 | TypeScript 5.x | Use `npx types-react-codemod@latest preset-19` to migrate types if upgrading from React 18. |
| Vite 8.0.10 | React 19.2.0 | Vite 8 uses Rolldown bundler. Auto-converts esbuild configs for compatibility. |
| Tailwind CSS 4.3 | Vite 8.0.10 | Use PostCSS plugin. Vite has built-in PostCSS support. |
| Node.js | 18.x or 20.x | Vite 8 requires Node 18+. Recommended: Node 20 LTS. |
## Architecture Decision: React vs Vanilla JS
### Vanilla JS (PROJECT.md choice)
- Faster initial development (no build step, no framework learning curve)
- Smaller initial bundle (~10KB vs ~150KB for React)
- Simpler deployment (one HTML file)
- Matches PROJECT.md constraint: "готов за несколько часов"
- No component reusability (copy-paste for movie cards)
- Manual DOM manipulation (error-prone, verbose)
- No type safety (bugs caught at runtime, not compile time)
- Hard to test (no component isolation)
- Difficult to add features (state management becomes spaghetti)
### React + Vite (2026 standard)
- Component reusability (MovieCard, MoodButton components)
- Declarative UI (easier to reason about)
- Type safety with TypeScript (catch bugs early)
- Better testing (component-level tests)
- Easier to add features (auth, favorites, history)
- Industry standard (easier to find help, hire developers)
- Steeper learning curve (if team unfamiliar)
- Longer initial setup (~30 min for Vite project)
- Larger bundle (~150KB gzipped for React + deps)
### Recommendation: **React + Vite**
## Sources
- [React 19 Changelog](https://github.com/facebook/react/blob/main/react/CHANGELOG.md) — Breaking changes, new features (HIGH confidence)
- [Vite 8 Announcement](https://github.com/vitejs/vite/blob/main/docs/blog/announcing-vite8.md) — Rolldown integration, new features (HIGH confidence)
- [TanStack Query v5 Migration Guide](https://github.com/tanstack/query/blob/main/docs/framework/react/guides/migrating-to-v5.md) — API changes, React 18+ requirement (HIGH confidence)
- [Tailwind CSS v4.3](https://tailwindcss.com) — CSS variables, P3 colors, container queries (HIGH confidence)
- [TMDb API Documentation](https://developer.themoviedb.org/docs) — API capabilities, rate limits (HIGH confidence)
- [Groq API Documentation](https://console.groq.com/docs) — OpenAI-compatible API, features (MEDIUM confidence - limited pricing info)
- Context7 library resolution for React, Vite, TanStack Query, Tailwind CSS (HIGH confidence)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
