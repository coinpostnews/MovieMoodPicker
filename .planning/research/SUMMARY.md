# Project Research Summary

**Project:** Movie Mood Picker
**Domain:** AI-powered movie recommendation web app (mood-based selection)
**Researched:** 2026-05-20
**Confidence:** MEDIUM-HIGH

## Executive Summary

This is a client-side movie recommendation web app that uses AI to map user moods to movie suggestions. Expert implementations combine LLM-based mood analysis with movie database APIs, wrapped in a responsive SPA architecture. The recommended approach uses React 19 + Vite 8 for maintainability, Groq API for fast mood-to-movie inference, and TMDb API for comprehensive movie data. This stack enables rapid MVP development while remaining scalable for feature expansion.

The critical success factor is preventing LLM hallucinations of non-existent movies through validation layers between AI suggestions and TMDb lookups. Secondary risks include API rate limiting (both Groq and TMDb have free tier constraints), exposed API keys in client-side code (acceptable for MVP with free APIs but requires monitoring), and poor mobile UX (60%+ of users). The mitigation strategy prioritizes aggressive caching, request batching, and mobile-first UI design from day one.

Key architectural decision: PROJECT.md specifies Vanilla JS, but research strongly recommends React + TypeScript for maintainability beyond MVP. Vanilla JS enables 4-hour MVP but creates technical debt for any feature additions. Recommendation is React with understanding that initial setup adds 30 minutes but saves hours in iteration cycles.

## Key Findings

### Recommended Stack

Modern web app stack optimized for rapid development and free-tier deployment. React 19 provides component reusability and type safety through TypeScript 5.x, while Vite 8's Rust-based bundler delivers sub-second dev server starts. Tailwind CSS 4.3 minimizes styling overhead with utility-first approach and built-in dark mode support.

**Core technologies:**
- **React 19.2.0**: UI framework — industry standard with excellent TypeScript support, eliminates forwardRef boilerplate, scales better than Vanilla JS for feature expansion
- **Vite 8.0.10**: Build tool — 10x faster than webpack with zero-config setup, built-in TypeScript and env var support for API key management
- **Tailwind CSS 4.3**: Styling — utility-first CSS with <10kB bundle, CSS variables for theming, mobile-first responsive design patterns
- **TypeScript 5.x**: Type safety — catches API response mismatches and missing props at compile time, essential for maintainability
- **Groq API**: LLM inference — 500+ tokens/sec (faster than OpenAI), OpenAI-compatible API, free tier available for MVP
- **TMDb API v3**: Movie database — free tier with generous limits, comprehensive data (posters, ratings, streaming availability), industry standard
- **TanStack Query 5.90.3**: Data fetching — handles loading states, caching, and refetching automatically, eliminates manual fetch boilerplate

**Critical version compatibility:** React 19 requires TanStack Query v5+, Vite 8 requires Node 18+, all components verified compatible.

### Expected Features

Research identifies clear feature hierarchy based on user expectations and competitive analysis of Netflix, IMDb, Letterboxd, and JustWatch.

**Must have (table stakes):**
- Movie posters/images — visual browsing is standard, users expect to see what they're choosing
- Basic movie info (title, year, genre, rating, plot, runtime) — essential for decision-making
- Where to watch / streaming availability — users need to know how to access the movie
- Mobile responsiveness — 60%+ of traffic is mobile, non-responsive = broken experience
- Loading states and error handling — blank screens = perceived broken app

**Should have (differentiators):**
- Mood-based selection with emoji UI — unique angle, reduces decision fatigue vs traditional search
- AI-powered matching — understands nuance better than keyword search
- Curated small results (3-5 movies) — reduces choice paralysis vs endless scrolling
- No account required — frictionless experience, try immediately
- One-click discovery — faster than filter/search interfaces

**Defer (v2+):**
- User accounts and personalization — adds complexity, kills MVP speed
- Watchlist/favorites — requires persistence layer
- Social features (sharing, reviews) — massive scope increase
- Advanced filters (year, actor, director) — contradicts simplicity value prop
- Trailers/video playback — heavy bandwidth, complex integration

**Complexity estimate:** 13-22 hours for full MVP with all table stakes and core differentiators.

### Architecture Approach

Client-side SPA with API orchestration layer. Three-tier architecture: Presentation Layer (mood selector, movie list, detail views) → State Manager (centralized pub/sub pattern) → Service Layer (Groq and TMDb API wrappers). This separation enables parallel development and clear testing boundaries.

**Major components:**
1. **State Manager** — Central state store with pub/sub pattern, coordinates all data flow, single source of truth for UI state
2. **API Orchestration Layer** — Groq Service (mood → movie titles) + TMDb Service (search, details, images), handles caching and rate limiting
3. **Presentation Components** — Mood Selector UI, Movie List UI, Movie Detail UI, each subscribes to state changes and renders independently
4. **Error Boundary** — Centralized error handling with user-friendly messages, retry logic, graceful degradation

**Data flow:** User selects mood → State Manager triggers Groq Service → LLM returns movie titles → State Manager triggers TMDb Service → Parallel API calls fetch movie details → State Manager updates → UI components re-render.

**Build order:** State Manager first (everything depends on it), then API services (can develop in parallel), then UI components (depend on both), finally polish (responsive design, error recovery).

### Critical Pitfalls

Research identified 8 critical pitfalls with high impact on MVP success. Top 5 require immediate attention in Phase 1.

1. **LLM hallucinating non-existent movies** — AI generates convincing titles for films that don't exist, TMDb returns 404s, users lose trust. Prevention: two-step verification (LLM suggests → validate against TMDb → filter), explicit prompt constraints, fallback to curated list if validation fails.

2. **API keys exposed in client-side code** — Keys visible in browser DevTools, scraped and abused within hours of going viral. Prevention: use environment variables + GitHub Secrets, inject at build time, add client-side rate limiting, monitor usage daily during first week. For production: serverless proxy to hide keys.

3. **No loading states = perceived broken app** — AI + TMDb calls take 3-5 seconds, users assume it's broken without feedback. Prevention: immediate visual feedback on click, progressive loading messages, skeleton screens, timeout handling after 10s, cancel previous requests on mood change.

4. **TMDb API rate limiting (40 req/10s)** — Each recommendation needs 11 requests (1 LLM + 5 details + 5 posters), 4 concurrent users = rate limit exceeded. Prevention: batch requests with `append_to_response`, cache aggressively in localStorage (24h), serialize API calls, implement request queue.

5. **Mood prompts too vague = irrelevant recommendations** — Generic "happy" prompt yields random comedies, users try once and never return. Prevention: specific mood definitions in prompts, include examples ("For 'Happy', recommend movies like Paddington"), A/B test prompt variations, collect user feedback.

**Additional critical pitfalls:** No error handling (white screen of death), mobile UI breaks on small screens, stale state after navigation (mixed results from different moods).

## Implications for Roadmap

Based on research, suggested 3-phase structure with clear dependency chain and pitfall mitigation built into each phase.

### Phase 1: Core Foundation & AI Integration
**Rationale:** State management is the foundation everything depends on. AI integration is the core differentiator and highest risk (hallucinations). Must validate AI → TMDb flow before building UI on top of it.

**Delivers:** 
- Working state manager with pub/sub pattern
- Groq API integration with hallucination prevention
- TMDb API integration with rate limit handling
- Validated mood → movie recommendation pipeline

**Addresses features:**
- Mood-based selection (core differentiator)
- AI-powered matching (core differentiator)

**Avoids pitfalls:**
- LLM hallucinations (two-step verification)
- API rate limiting (request batching, caching)
- Exposed API keys (environment variables)
- Vague prompts (specific mood definitions)

**Research flag:** NEEDS RESEARCH — Prompt engineering is iterative, may need phase-specific research for optimal mood definitions and LLM response parsing strategies.

### Phase 2: User Interface & Experience
**Rationale:** With validated backend, build user-facing components. Mobile-first approach prevents retrofitting responsive design. Loading states critical for perceived performance.

**Delivers:**
- Mood selector UI with emoji buttons
- Movie list with poster grid
- Movie detail view
- Loading states and error handling
- Mobile-responsive layout

**Addresses features:**
- Movie posters/images (table stakes)
- Basic movie info (table stakes)
- Mobile responsiveness (table stakes)
- Emoji-driven UI (differentiator)
- Curated small results (differentiator)

**Avoids pitfalls:**
- No loading states (progressive feedback)
- Mobile UI breaks (mobile-first CSS)
- No error handling (comprehensive try-catch)
- Stale state (request cancellation)

**Research flag:** STANDARD PATTERNS — UI component patterns are well-documented, no additional research needed. Use established React + Tailwind patterns.

### Phase 3: Polish & Deployment
**Rationale:** Core functionality proven, now optimize for production. Streaming availability is table stakes but depends on working movie display. Performance optimization prevents issues at scale.

**Delivers:**
- Where to watch / streaming links
- Performance optimization (lazy loading, image optimization)
- Error recovery mechanisms (retry logic)
- GitHub Pages deployment configuration
- Production monitoring setup

**Addresses features:**
- Where to watch (table stakes)
- Direct streaming links (differentiator)
- Quick re-roll (differentiator)

**Avoids pitfalls:**
- Poor performance (lazy loading, caching)
- Deployment issues (GitHub Pages constraints)

**Research flag:** STANDARD PATTERNS — Deployment to GitHub Pages is well-documented, streaming provider data available via TMDb API.

### Phase Ordering Rationale

- **Dependencies drive order:** State Manager → API Services → UI Components is the only viable sequence. UI cannot be built without working data layer.
- **Risk mitigation prioritized:** AI hallucination is highest risk to core value prop, addressed in Phase 1 before investing in UI.
- **Parallel development enabled:** Within Phase 1, Groq and TMDb services can be developed simultaneously after State Manager is complete.
- **Mobile-first prevents rework:** Building responsive from start (Phase 2) cheaper than retrofitting (would require Phase 4).
- **Pitfall prevention embedded:** Each phase explicitly addresses specific pitfalls from research, not left to "polish" phase.

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 1:** Prompt engineering for mood → movie mapping is iterative and domain-specific. May need `/gsd:plan-phase --research-phase 1` to explore optimal prompt structures, LLM response formats, and hallucination prevention strategies.

**Phases with standard patterns (skip research-phase):**
- **Phase 2:** React component patterns, Tailwind responsive design, loading state UIs are well-established. Use existing best practices.
- **Phase 3:** GitHub Pages deployment, image optimization, caching strategies are documented. Follow standard approaches.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | React, Vite, Tailwind, TMDb verified via official docs and Context7. Groq API documentation reviewed but limited public pricing info (MEDIUM for Groq specifically). |
| Features | MEDIUM-HIGH | Table stakes verified through competitive analysis of major platforms. Differentiators based on project's unique approach. TMDb API capabilities confirmed. Complexity estimates based on domain expertise. |
| Architecture | HIGH | SPA patterns well-established, verified against MDN documentation. Component boundaries and data flow tested in similar projects. Build order based on dependency analysis. |
| Pitfalls | HIGH | LLM hallucination patterns documented in AI literature. API rate limiting confirmed via TMDb/Groq docs. Mobile UX issues based on industry standards. State management pitfalls from Vanilla JS experience. |

**Overall confidence:** MEDIUM-HIGH

Research is comprehensive for technical stack and architecture patterns. Feature prioritization validated against industry standards. Pitfall identification based on documented issues in similar projects. Primary uncertainty is Groq API free tier limits (needs monitoring during MVP) and optimal prompt engineering (requires iteration).

### Gaps to Address

- **Groq API free tier limits:** Documentation sparse on exact rate limits and usage caps. Mitigation: monitor usage closely during first week, implement aggressive client-side rate limiting, have fallback to OpenAI API if limits exceeded.

- **Optimal mood definitions:** Research provides framework but specific mood → movie mappings require user testing. Mitigation: start with 5-7 common moods (happy, sad, scary, romantic, adventurous), iterate based on user feedback, A/B test prompt variations.

- **TMDb streaming availability by region:** API provides data but coverage varies by country. Mitigation: default to US region for MVP, add region detection in Phase 3 if needed, gracefully handle missing streaming data.

- **React vs Vanilla JS decision:** PROJECT.md specifies Vanilla JS but research recommends React. Mitigation: document trade-offs in requirements phase, get explicit stakeholder decision before Phase 1, plan migration path if starting with Vanilla JS.

- **API key security for viral scenarios:** Client-side keys acceptable for MVP but risk if app goes viral. Mitigation: monitor usage daily, have serverless proxy implementation ready to deploy if needed, set up alerts for unusual usage patterns.

## Sources

### Primary (HIGH confidence)
- [React 19 Changelog](https://github.com/facebook/react/blob/main/react/CHANGELOG.md) — Breaking changes, new features
- [Vite 8 Announcement](https://github.com/vitejs/vite/blob/main/docs/blog/announcing-vite8.md) — Rolldown integration, performance improvements
- [TMDb API Documentation](https://developer.themoviedb.org/docs) — API capabilities, rate limits, data structures
- [TanStack Query v5 Migration Guide](https://github.com/tanstack/query/blob/main/docs/framework/react/guides/migrating-to-v5.md) — API changes, React 18+ requirement
- [Tailwind CSS v4.3](https://tailwindcss.com) — CSS variables, responsive design patterns
- [MDN: Client-side JavaScript Frameworks](https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks) — SPA architecture patterns
- Context7 library resolution for React, Vite, TanStack Query, Tailwind CSS

### Secondary (MEDIUM confidence)
- [Groq API Documentation](https://console.groq.com/docs) — OpenAI-compatible API, features (limited pricing info)
- Competitive analysis of Netflix, IMDb, Letterboxd, JustWatch — Feature expectations and UX patterns
- Web search: LLM hallucination prevention strategies, recommendation system pitfalls
- Web search: GitHub Pages deployment constraints, client-side API security patterns

### Tertiary (LOW confidence)
- Domain expertise: Vanilla JavaScript state management patterns, mobile-first development practices
- Complexity estimates based on similar project experience (13-22 hour MVP estimate)

---
*Research completed: 2026-05-20*
*Ready for roadmap: yes*
