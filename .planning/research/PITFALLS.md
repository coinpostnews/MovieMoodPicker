# Pitfalls Research

**Domain:** Movie Recommendation Web App (AI-powered, mood-based)
**Researched:** 2026-05-20
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: LLM Hallucinating Non-Existent Movies

**What goes wrong:**
AI generates convincing movie titles, descriptions, and details for films that don't exist. Users click, see "not found" errors from TMDb API, lose trust immediately.

**Why it happens:**
LLMs are trained on movie data and can generate plausible-sounding titles. Without explicit constraints, they'll invent movies that match the mood perfectly but don't exist in TMDb's database.

**How to avoid:**
- Prompt engineering: Explicitly instruct LLM to ONLY return movie titles that exist in TMDb
- Two-step verification: LLM suggests → validate against TMDb → filter out non-existent
- Use TMDb IDs in LLM response format (forces LLM to reference real movies)
- Fallback: If validation fails, retry with stricter prompt or use curated fallback list

**Warning signs:**
- Users report "movie not found" errors
- TMDb API returns 404s for movie searches
- Recommendation results have suspiciously perfect mood matches with obscure titles

**Phase to address:**
Phase 1 (Core AI Integration) — Must be solved before any user-facing deployment

---

### Pitfall 2: API Keys Exposed in Client-Side Code

**What goes wrong:**
API keys committed to GitHub repo, visible in browser DevTools. Malicious users scrape keys, exhaust rate limits, or abuse services. Project becomes unusable within hours of going viral.

**Why it happens:**
"It's just an MVP" mindset. Free tier APIs seem low-risk. Developers underestimate how quickly keys get scraped from public repos and browser sources.

**How to avoid:**
- **For MVP:** Use environment variables + GitHub Secrets, inject at build time
- **Better:** Serverless proxy (Cloudflare Workers, Vercel Edge Functions) to hide keys
- **Best:** Backend API that handles all external calls
- Add rate limiting on client side (prevent accidental abuse)
- Monitor API usage daily during first week

**Warning signs:**
- API rate limits hit unexpectedly
- Usage spikes in API dashboard without corresponding traffic increase
- Keys visible in browser Network tab or page source

**Phase to address:**
Phase 0 (Setup) — Must be addressed before first deployment to GitHub Pages

---

### Pitfall 3: No Loading States = Perceived Broken App

**What goes wrong:**
User clicks mood button → nothing happens for 3-5 seconds → user clicks again → duplicate requests → confusion. AI + TMDb calls take time, but without feedback, users assume it's broken.

**Why it happens:**
Developers test on fast connections with cached responses. Real users have slower networks, cold API starts, and no patience.

**How to avoid:**
- Immediate visual feedback on button click (disable button, show spinner)
- Progressive loading: "Analyzing mood..." → "Finding movies..." → "Loading details..."
- Skeleton screens for movie cards (show layout before data arrives)
- Timeout handling: If >10s, show "Taking longer than expected" message
- Cancel previous request if user clicks different mood

**Warning signs:**
- Users clicking mood buttons multiple times
- High bounce rate (users leave before seeing results)
- Console shows multiple concurrent API calls

**Phase to address:**
Phase 1 (Core UI) — Critical for MVP user experience

---

### Pitfall 4: TMDb API Rate Limiting Kills User Experience

**What goes wrong:**
Free tier: 40 requests/10 seconds. Each recommendation needs: 1 LLM call + 5 movie detail calls + 5 poster fetches = 11 requests. 4 users simultaneously = rate limit exceeded. App stops working.

**Why it happens:**
Developers test alone, never hit rate limits. Don't implement caching or request batching. Assume "40 req/10s is plenty."

**How to avoid:**
- **Immediate:** Batch TMDb requests (use `/movie/{id}?append_to_response=images,watch/providers`)
- **Cache aggressively:** Movie data rarely changes, cache in localStorage for 24h
- **Request queue:** Serialize API calls, don't fire all simultaneously
- **Fallback:** If rate limited, show cached results or generic recommendations
- **Monitor:** Log rate limit headers, alert before hitting limits

**Warning signs:**
- TMDb returns 429 (Too Many Requests)
- Intermittent failures during testing with multiple tabs
- Slow response times as queue backs up

**Phase to address:**
Phase 1 (API Integration) — Must be solved before public launch

---

### Pitfall 5: Mood Prompts Too Vague = Irrelevant Recommendations

**What goes wrong:**
User selects "Happy 😊" → gets random comedies that don't match their actual mood. LLM interprets "happy" too broadly. User tries once, never returns.

**Why it happens:**
Prompt engineering is an afterthought. Developers assume LLM "just knows" what users want. No testing with real mood variations.

**How to avoid:**
- **Specific mood definitions:** "Happy" → "Lighthearted comedies, feel-good stories, uplifting endings"
- **Context in prompt:** Include time of day, typical use cases ("Friday night relaxation" vs "Monday morning motivation")
- **Examples in prompt:** "For 'Happy', recommend movies like Paddington, The Grand Budapest Hotel"
- **User feedback loop:** "Was this helpful?" to refine prompts
- **A/B test prompts:** Track which prompt variations yield better engagement

**Warning signs:**
- Users select same mood multiple times (not satisfied with results)
- High bounce rate after seeing recommendations
- Recommendations feel generic or mismatched

**Phase to address:**
Phase 1 (AI Prompt Engineering) — Iterative improvement, start in Phase 1, refine in Phase 2

---

### Pitfall 6: No Error Handling = White Screen of Death

**What goes wrong:**
API fails (network issue, rate limit, service down) → unhandled promise rejection → blank screen or console error. User sees nothing, assumes site is broken.

**Why it happens:**
Happy path development. Developers test with working APIs, never simulate failures. Error handling added as afterthought or skipped entirely.

**How to avoid:**
- **Wrap all API calls in try-catch**
- **User-friendly error messages:** "Couldn't load movies. Try again?" (not "Error 500")
- **Retry logic:** Auto-retry failed requests (with exponential backoff)
- **Graceful degradation:** If TMDb fails, show LLM-generated descriptions without posters
- **Offline detection:** Check `navigator.onLine`, show appropriate message

**Warning signs:**
- Blank screens during testing
- Unhandled promise rejections in console
- Users report "site doesn't work" without specifics

**Phase to address:**
Phase 1 (Core Implementation) — Must be comprehensive before MVP launch

---

### Pitfall 7: Mobile UI Breaks on Small Screens

**What goes wrong:**
Looks great on desktop, unusable on mobile. Buttons too small, text overflows, posters don't scale. 60%+ of users are mobile, they bounce immediately.

**Why it happens:**
Desktop-first development. Testing only in browser DevTools responsive mode (not real devices). CSS assumes minimum screen width.

**How to avoid:**
- **Mobile-first CSS:** Design for 320px width, scale up
- **Touch targets:** Minimum 44x44px for buttons (Apple HIG standard)
- **Test on real devices:** iPhone SE (smallest common screen), Android mid-range
- **Responsive images:** Use TMDb's multiple poster sizes, load appropriate for screen
- **Viewport meta tag:** `<meta name="viewport" content="width=device-width, initial-scale=1">`

**Warning signs:**
- High mobile bounce rate in analytics
- Horizontal scrolling on mobile
- Buttons require precise tapping

**Phase to address:**
Phase 1 (UI Implementation) — Mobile-first from the start, not retrofitted

---

### Pitfall 8: Stale State After Navigation

**What goes wrong:**
User selects "Happy" → sees results → clicks "Sad" → sees mix of happy and sad movies. State not properly cleared between mood changes. Confusing, feels buggy.

**Why it happens:**
Vanilla JS state management is manual. Developers forget to clear previous state before loading new data. Async timing issues compound the problem.

**How to avoid:**
- **Clear state explicitly:** Reset movie array before new API call
- **Request cancellation:** Cancel in-flight requests when user changes mood
- **Loading state as source of truth:** Disable interactions while loading
- **State machine pattern:** Define valid states (idle, loading, success, error), enforce transitions
- **Request IDs:** Tag each request, ignore responses from outdated requests

**Warning signs:**
- Flickering content during mood changes
- Mixed results from different moods
- Race conditions in console logs

**Phase to address:**
Phase 1 (State Management) — Critical for single-page app reliability

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| API keys in code | Fast MVP deployment | Security risk, rate limit abuse, rewrite needed | Never — use env vars minimum |
| No caching | Simpler code | Poor performance, rate limits, high API costs | Never — localStorage caching is trivial |
| Inline CSS/JS in HTML | Single file deployment | Unmaintainable, no minification, slow load | Acceptable for MVP <500 lines |
| No build process | Zero setup time | Can't use env vars, no optimization, no TypeScript | Acceptable for MVP, plan migration |
| Hardcoded mood list | Quick implementation | Inflexible, requires code changes to add moods | Acceptable for MVP, externalize in v2 |
| No analytics | Faster launch | Blind to user behavior, can't optimize | Acceptable for MVP, add in Phase 2 |
| Generic error messages | Less code | Poor UX, hard to debug user issues | Never — specific errors cost little |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Groq API | Assuming instant responses | Add 3-5s timeout, show loading state, handle rate limits |
| TMDb API | Fetching each movie individually | Use `append_to_response` to batch data in single request |
| TMDb Images | Using full-size posters | Use `w500` for cards, `original` only for detail view |
| GitHub Pages | Expecting server-side logic | All logic must be client-side, use serverless for secrets |
| CORS | Assuming all APIs allow client calls | Check CORS headers, use proxy if needed (TMDb/Groq are OK) |
| LLM Responses | Expecting JSON without validation | Always validate/parse, LLMs can return malformed JSON |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading all posters at once | Slow initial render, bandwidth spike | Lazy load images, use `loading="lazy"` | >5 movies shown |
| No request deduplication | Multiple identical API calls | Cache responses, dedupe in-flight requests | Multiple users/tabs |
| Synchronous API calls | Long wait times | Parallel Promise.all for independent calls | >3 movies |
| No image optimization | Slow load on mobile | Use TMDb's sized images (w185, w500), not original | Mobile users |
| Blocking UI during API calls | Frozen interface | Async/await with loading states, non-blocking UI | Any API call >1s |
| Memory leaks from event listeners | Slowdown over time | Remove listeners on cleanup, use AbortController | Extended sessions |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| API keys in GitHub repo | Keys scraped, services abused, costs spike | Use GitHub Secrets + env vars, never commit keys |
| No rate limiting on client | Accidental DoS of own APIs | Debounce user actions, queue requests, max N per minute |
| Trusting LLM output as safe HTML | XSS attacks via crafted prompts | Sanitize all LLM output, use textContent not innerHTML |
| No input validation | Malicious prompts, injection attacks | Validate mood selection, sanitize any user input |
| HTTPS mixed content | Browsers block API calls | Ensure all API calls use HTTPS (TMDb/Groq do) |
| Exposing user behavior | Privacy concerns | Don't log personal data, anonymize analytics |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No empty state handling | Confusion when no results | Show "No movies found, try another mood" with suggestions |
| Infinite scroll without feedback | Users don't know if more content exists | Show "Loading more..." or "That's all!" message |
| Auto-playing trailers | Annoying, bandwidth waste | Require explicit user action to play video |
| No back button support | Can't return to previous mood | Use URL hash or History API for navigation |
| Overwhelming choice | Decision paralysis with 20+ movies | Limit to 3-5 recommendations, offer "Show more" |
| No visual feedback on interaction | Feels unresponsive | Hover states, active states, transitions on all clickable elements |
| Tiny touch targets on mobile | Frustrating, requires precision | Minimum 44x44px, generous padding |
| No offline message | Users think site is broken | Detect offline, show clear "No internet" message |

## "Looks Done But Isn't" Checklist

- [ ] **Movie recommendations:** Often missing validation that movies exist in TMDb — verify each title returns valid TMDb ID
- [ ] **Error handling:** Often missing network failure cases — test with DevTools offline mode
- [ ] **Loading states:** Often missing for slow connections — throttle network to 3G in DevTools
- [ ] **Mobile responsiveness:** Often missing real device testing — test on actual iPhone/Android, not just DevTools
- [ ] **API rate limits:** Often missing handling for concurrent users — simulate 10+ simultaneous requests
- [ ] **State cleanup:** Often missing between navigation — rapidly switch moods, check for stale data
- [ ] **Image loading:** Often missing fallbacks for broken images — test with blocked image URLs
- [ ] **Accessibility:** Often missing keyboard navigation — test without mouse, check screen reader
- [ ] **CORS issues:** Often missing in production — test deployed version, not just localhost
- [ ] **Cache invalidation:** Often missing strategy — verify stale data doesn't persist indefinitely

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Exposed API keys | HIGH | Revoke keys immediately, create new keys, deploy with env vars, audit usage logs |
| LLM hallucinations | MEDIUM | Add validation layer, implement retry with stricter prompt, create fallback movie list |
| Rate limit exceeded | LOW | Implement caching, add request queue, reduce concurrent calls, wait for limit reset |
| Broken mobile UI | MEDIUM | Rewrite CSS mobile-first, test on real devices, use responsive units (rem, %, vw) |
| No error handling | MEDIUM | Wrap all async calls in try-catch, add user-friendly error UI, implement retry logic |
| Stale state bugs | LOW | Add state reset on navigation, cancel in-flight requests, use request IDs |
| Poor performance | MEDIUM | Add lazy loading, implement caching, batch API requests, optimize images |
| Bad recommendations | LOW | Refine prompts iteratively, add examples, collect user feedback, A/B test |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| LLM hallucinations | Phase 1 (AI Integration) | Test with 20+ mood queries, verify all movies exist in TMDb |
| Exposed API keys | Phase 0 (Setup) | Check GitHub repo, inspect deployed page source, verify keys not visible |
| No loading states | Phase 1 (UI) | Throttle network to 3G, verify feedback on all interactions |
| Rate limiting | Phase 1 (API Integration) | Simulate 10 concurrent users, verify no 429 errors |
| Vague prompts | Phase 1 (Prompt Engineering) | User testing with 5+ people, measure satisfaction with results |
| No error handling | Phase 1 (Core Implementation) | Test offline mode, block APIs, verify graceful degradation |
| Mobile UI breaks | Phase 1 (UI) | Test on iPhone SE, Android mid-range, verify all features work |
| Stale state | Phase 1 (State Management) | Rapidly switch moods 10+ times, verify no mixed results |

## Sources

- TMDb API documentation (rate limits, best practices)
- Groq API documentation (rate limits, prompt engineering)
- Web search: recommendation system pitfalls, LLM hallucination prevention
- Web search: client-side API security, GitHub Pages deployment issues
- Web search: vanilla JavaScript state management patterns
- Domain expertise: common SPA pitfalls, mobile-first development
- GitHub Pages documentation (deployment constraints, CORS)

---
*Pitfalls research for: Movie Mood Picker (AI-powered movie recommendation web app)*
*Researched: 2026-05-20*
