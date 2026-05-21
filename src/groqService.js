/**
 * Groq Service - fetches movie suggestions through a server-side proxy.
 * The real Groq API key must live in the proxy environment, never in this file.
 */

import { setCache, getCache } from "./cache.js?v=20260521i";
import { GROQ_PROXY_URL } from "./config.js?v=20260521j";

/**
 * Calls the Groq proxy.
 * @param {string} mood Mood selected by the user.
 * @param {string[]} [excludedTitles=[]] Movie titles to avoid repeating.
 * @param {number} [timeout=30000] Timeout in ms (default 30s).
 * @returns {Promise<string[]>} Array of movie titles.
 */
export async function fetchMovieTitlesFromGroq(mood, excludedTitles = [], timeout = 30000) {
  if (!GROQ_PROXY_URL || GROQ_PROXY_URL === "<YOUR_GROQ_PROXY_URL>") {
    throw new Error(
      "Groq proxy is not configured. Deploy the Cloudflare Worker and set GROQ_PROXY_URL in src/config.js.",
    );
  }

  const exclusionKey = excludedTitles.slice(0, 30).join("|").toLowerCase();
  const cacheKey = `groq_mood_${mood}_${exclusionKey}`;
  const cached = getCache(cacheKey);
  if (cached) {
    return cached;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(GROQ_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mood, excludedTitles }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const apiMessage = errorBody?.error || response.statusText || "Unknown Groq proxy error";
      console.error("Groq proxy error", response.status, apiMessage);
      throw new Error("Groq proxy error " + response.status + ": " + apiMessage);
    }

    const data = await response.json();
    const titles = Array.isArray(data.titles) ? data.titles : [];
    if (titles.length === 0) {
      throw new Error("Groq proxy returned no titles");
    }

    setCache(cacheKey, titles, 1);
    return titles;
  } catch (e) {
    if (e.name === "AbortError") {
      console.error("Groq request timed out");
    }
    // Propagate error to caller
    throw e;
  }
}
