# Roadmap: Movie Mood Picker

## Overview

This roadmap delivers a mood-based movie recommendation web app in 4 phases. Phase 1 establishes the API foundation with validated AI-to-database pipeline. Phase 2 builds the mood selection interface with loading feedback. Phase 3 implements movie browsing and detail views. Phase 4 ensures responsive design and deploys to production. Each phase delivers verifiable user-facing capabilities that build toward the core value: быстрый и простой способ найти фильм по настроению.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Project Setup & API Foundation** - Establish working API integration with validated data pipeline
- [ ] **Phase 2: Mood Selection Interface** - Build mood selector UI with loading states
- [x] **Phase 3: Movie Display & Details** - Implement movie browsing and detail views
- [ ] **Phase 4: Responsive Design & Deployment** - Polish for all devices and deploy to production

## Phase Details

### Phase 1: Project Setup & API Foundation
**Goal**: Working API integration with validated data pipeline that prevents AI hallucinations
**Mode**: mvp
**Depends on**: Nothing (first phase)
**Requirements**: TECH-01, TECH-02, AI-01, AI-02, AI-03
**Success Criteria** (what must be TRUE):
  1. Groq API successfully returns movie suggestions based on mood input
  2. TMDb API validates that suggested movies exist and returns complete metadata
  3. System handles API errors gracefully with user-friendly error messages
  4. API responses are cached to reduce redundant requests
  5. Two-step verification prevents non-existent movie recommendations
**Plans**: TBD

### Phase 2: Mood Selection Interface
**Goal**: Users can select moods through emoji buttons and see loading feedback
**Mode**: mvp
**Depends on**: Phase 1
**Requirements**: MOOD-01, MOOD-02, MOOD-03, AI-04
**Success Criteria** (what must be TRUE):
  1. User sees 4-6 mood buttons with emoji icons on the main screen
  2. User can tap/click a mood button and trigger movie recommendation
  3. User sees loading indicator immediately after selecting mood
  4. Mood buttons are touch-friendly and work on mobile devices
**Plans**: TBD
**UI hint**: yes

### Phase 3: Movie Display & Details
**Goal**: Users can browse recommended movies and view detailed information
**Mode**: mvp
**Depends on**: Phase 2
**Requirements**: DISP-01, DISP-02, DISP-03, DISP-04, MOOD-04
**Success Criteria** (what must be TRUE):
  1. User sees 3-5 movie recommendations with poster images after mood selection
  2. Each movie card displays title, genres, rating, and brief description
  3. User can click on a movie to open detailed view
  4. Detailed view shows where to watch the movie (streaming services)
  5. User can mark movies as watched to filter future recommendations
**Plans**: TBD
**UI hint**: yes

### Phase 4: Responsive Design & Deployment
**Goal**: Production-ready app accessible on all devices via public URL
**Mode**: mvp
**Depends on**: Phase 3
**Requirements**: TECH-03, DEPL-01
**Success Criteria** (what must be TRUE):
  1. Interface adapts correctly to desktop, tablet, and mobile screen sizes
  2. All interactive elements are accessible and functional on touch devices
  3. App is deployed to GitHub Pages with working public URL
  4. Page loads and functions correctly in production environment
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Project Setup & API Foundation | 8/8 | Completed | 2026-05-21 |
| 2. Mood Selection Interface | 4/4 | Completed | 2026-05-21 |
| 3. Movie Display & Details | 1/1 | Completed | 2026-05-21 |
| 4. Responsive Design & Deployment | 0/TBD | Not started | - |
