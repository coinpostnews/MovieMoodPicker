# Architecture Patterns

**Domain:** Movie Recommendation Web App (Mood-based)
**Researched:** 2026-05-20

## Recommended Architecture

**Pattern:** Client-Side Single-Page Application (SPA) with API Orchestration Layer

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

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| **Mood Selector UI** | Render mood buttons, capture user selection | State Manager |
| **Movie List UI** | Display movie grid with posters, handle clicks | State Manager |
| **Movie Detail UI** | Show full movie info (poster, description, rating, streaming) | State Manager |
| **State Manager** | Central state store, notify UI on changes, coordinate flow | All UI components, API Orchestration Layer |
| **Groq Service** | Transform mood → search query via LLM, parse movie titles | State Manager |
| **TMDb Service** | Search movies, fetch details, get poster URLs, find streaming providers | State Manager |

### Data Flow

**Primary Flow: Mood Selection → Movie Recommendations**

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
   
5. Groq Service → State Manager
   → setState({ movieTitles: [...] })
   
6. State Manager → TMDb Service
   → "Search for these movie titles"
   
7. TMDb Service → TMDb API (HTTP, parallel requests)
   → GET /search/movie?query=...
   → GET /movie/{id}?append_to_response=watch/providers
   
8. TMDb Service → State Manager
   → setState({ movies: [...], loading: false })
   
9. State Manager → Movie List UI
   → UI re-renders with movie grid
```

**Secondary Flow: Movie Detail View**

```
1. User clicks movie card
   → Movie List UI captures event
   
2. Movie List UI → State Manager
   → setState({ selectedMovieId: 123 })
   
3. State Manager → TMDb Service (if details not cached)
   → "Fetch full details for movie 123"
   
4. TMDb Service → TMDb API
   → GET /movie/123?append_to_response=credits,watch/providers
   
5. TMDb Service → State Manager
   → setState({ selectedMovie: {...} })
   
6. State Manager → Movie Detail UI
   → UI renders detail view
```

## Patterns to Follow

### Pattern 1: Centralized State Management
**What:** Single state object with pub/sub pattern for UI updates

**When:** All state changes go through setState(), all UI components subscribe to state changes

**Example:**
```javascript
// State manager
const state = {
  selectedMood: null,
  movies: [],
  selectedMovie: null,
  loading: false,
  error: null
};

const listeners = [];

function setState(updates) {
  Object.assign(state, updates);
  listeners.forEach(fn => fn(state));
}

function subscribe(listener) {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    listeners.splice(index, 1);
  };
}

// UI component subscribes
subscribe((newState) => {
  if (newState.movies.length > 0) {
    renderMovieList(newState.movies);
  }
});
```

### Pattern 2: Service Layer Abstraction
**What:** Wrap external APIs in service modules with consistent interfaces

**When:** All API calls go through service layer, never direct fetch() from UI

**Example:**
```javascript
// groqService.js
async function getMoodRecommendations(mood) {
  const prompt = `User mood: ${mood}. Suggest 5 movies. Return JSON array of titles.`;
  
  const response = await fetch('https://api.groq.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'mixtral-8x7b-32768',
      messages: [{ role: 'user', content: prompt }]
    })
  });
  
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

// tmdbService.js
async function searchMovie(title) {
  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}`
  );
  return response.json();
}

async function getMovieDetails(movieId) {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=watch/providers`
  );
  return response.json();
}
```

### Pattern 3: Component-Based UI Rendering
**What:** Each UI section is a function that renders to a container

**When:** State changes trigger re-render of affected components only

**Example:**
```javascript
// UI components
function renderMoodSelector(container, onMoodSelect) {
  const moods = [
    { emoji: '😄', label: 'Весело', value: 'happy' },
    { emoji: '😢', label: 'Грустно', value: 'sad' },
    { emoji: '😱', label: 'Страшно', value: 'scary' }
  ];
  
  container.innerHTML = '';
  moods.forEach(mood => {
    const button = document.createElement('button');
    button.className = 'mood-button';
    button.innerHTML = `${mood.emoji} ${mood.label}`;
    button.onclick = () => onMoodSelect(mood.value);
    container.appendChild(button);
  });
}

function renderMovieList(container, movies, onMovieClick) {
  container.innerHTML = '';
  movies.forEach(movie => {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      <p>⭐ ${movie.vote_average}/10</p>
    `;
    card.onclick = () => onMovieClick(movie.id);
    container.appendChild(card);
  });
}
```

### Pattern 4: Error Boundary Pattern
**What:** Centralized error handling with user-friendly messages

**When:** All async operations wrapped in try/catch, errors flow to state

**Example:**
```javascript
async function handleMoodSelection(mood) {
  try {
    setState({ loading: true, error: null });
    
    const titles = await groqService.getMoodRecommendations(mood);
    const movies = await Promise.all(
      titles.map(title => tmdbService.searchMovie(title))
    );
    
    setState({ movies, loading: false });
  } catch (error) {
    setState({ 
      loading: false, 
      error: 'Не удалось загрузить фильмы. Попробуйте еще раз.' 
    });
  }
}
```

### Pattern 5: Progressive Enhancement
**What:** Show loading states, handle empty states, graceful degradation

**When:** Every async operation shows loading UI, every list handles empty case

**Example:**
```javascript
function render(state) {
  if (state.loading) {
    showLoader('Подбираю фильмы...');
    return;
  }
  
  if (state.error) {
    showError(state.error);
    return;
  }
  
  if (state.movies.length === 0) {
    showEmptyState('Выберите настроение');
    return;
  }
  
  renderMovieList(state.movies);
}
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Direct DOM Manipulation from Multiple Places
**What goes wrong:** Multiple functions modify same DOM elements, causing conflicts and bugs

**Why bad:** Hard to track state, race conditions, inconsistent UI

**Instead:** All DOM updates go through render functions triggered by state changes

### Anti-Pattern 2: Inline API Keys in Public Code
**What goes wrong:** API keys exposed in client-side code can be scraped and abused

**Why bad:** Rate limit exhaustion, potential costs if APIs aren't free tier

**Instead:** For MVP with free APIs, accept the risk but document it. For production, use backend proxy or environment-based key rotation

### Anti-Pattern 3: Nested Callbacks (Callback Hell)
**What goes wrong:** 
```javascript
// Bad
getMood(mood => {
  getRecommendations(mood, titles => {
    searchMovies(titles, movies => {
      renderMovies(movies);
    });
  });
});
```

**Why bad:** Hard to read, error handling complex, difficult to debug

**Instead:** Use async/await with proper error handling

### Anti-Pattern 4: Fetching Same Data Multiple Times
**What goes wrong:** Every time user views movie detail, fetch from API again

**Why bad:** Slow UX, unnecessary API calls, rate limit waste

**Instead:** Cache movie details in state after first fetch

### Anti-Pattern 5: Blocking UI During API Calls
**What goes wrong:** No loading indicator, app appears frozen

**Why bad:** User doesn't know if app is working, may click multiple times

**Instead:** Always show loading state during async operations

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| **API Rate Limits** | Direct client calls OK | Need request queuing/throttling | Require backend proxy with caching |
| **State Management** | Simple object + pub/sub | Same approach works | Consider IndexedDB for caching |
| **Code Organization** | Single HTML file OK | Split into modules (ES6 imports) | Build system + code splitting |
| **Caching** | Browser cache sufficient | Add localStorage for movie data | CDN + service worker + backend cache |
| **Error Handling** | Basic try/catch | Add retry logic + exponential backoff | Circuit breaker pattern |
| **Performance** | Vanilla JS fast enough | Same | Consider virtual scrolling for large lists |

## Build Order (Dependency-Based)

### Phase 1: Foundation (No Dependencies)
1. **State Manager** - Core infrastructure, no dependencies
2. **UI Shell** - Basic HTML structure, containers for components
3. **Mood Selector UI** - Simple button grid, depends only on state manager

**Why first:** Everything else depends on state management. Mood selector is entry point.

### Phase 2: API Integration (Depends on Phase 1)
4. **Groq Service** - Mood → movie titles transformation
5. **TMDb Service** - Movie search and details fetching
6. **API Orchestration** - Connect Groq → TMDb flow

**Why second:** Need state manager in place. These services are independent of each other initially.

### Phase 3: Display Layer (Depends on Phase 1 & 2)
7. **Movie List UI** - Display recommendations from TMDb
8. **Loading/Error States** - Handle async operation feedback

**Why third:** Requires both state management and API services to be functional.

### Phase 4: Detail View (Depends on Phase 1, 2, 3)
9. **Movie Detail UI** - Full movie information display
10. **Navigation** - Back button, view switching

**Why fourth:** Builds on movie list, requires full API integration.

### Phase 5: Polish (Depends on all previous)
11. **Responsive Design** - Mobile optimization
12. **Error Recovery** - Retry mechanisms, better error messages
13. **Performance** - Caching, request optimization

**Why last:** Refinement after core functionality proven.

## Critical Dependencies

```
State Manager (1)
    ↓
    ├─→ Mood Selector UI (3)
    ├─→ Groq Service (4)
    ├─→ TMDb Service (5)
    └─→ Movie List UI (7)
         └─→ Movie Detail UI (9)

Groq Service (4) + TMDb Service (5)
    ↓
API Orchestration (6)
    ↓
Movie List UI (7)
```

**Parallel Development Opportunities:**
- Mood Selector UI + Groq Service (both depend only on State Manager)
- Movie List UI + Movie Detail UI (can mock data initially)
- Loading States + Error States (independent UI components)

## Sources

- [TMDb API Documentation](https://developer.themoviedb.org/docs) - HIGH confidence, official docs
- [MDN: Client-side JavaScript Frameworks](https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks) - HIGH confidence, official Mozilla docs
- Web search findings on SPA architecture patterns - MEDIUM confidence, verified against MDN patterns
